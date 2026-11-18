import time

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from src.api.auth_guards import roles_required
from src.models.datatypes import Booking
from src.services.booking_service import (
    delete_booking,
    get_all_bookings,
    get_up_to_date_form_content,
    insert_booking,
    update_booking_db,
    update_booking_payment,
)
from src.services.mail_service import send_confirmation_mail
from src.services.option_service import ticket_requires_workshift
from src.services.orga_team_service import is_valid_active_orga_team_member
from src.services.pricing_service import (
    SERVER_OWNED_PAYMENT_DEFAULTS,
    calculate_regular_total_price,
)
from src.services.workshift_service import (
    MAX_SHIFTS_PER_BOOKING,
    validate_booking_timeslot_selection,
)
from src.utils.logger import get_logger
from src.utils.rate_limit import limiter
from src.utils.signature import decode_signature_to_blob

# Initialize logger
logger = get_logger(__name__)

bookings_bp = Blueprint("bookings", __name__)
limiter_bookings = limiter


def _apply_workshift_rules(booking: Booking) -> str | None:
    """Validate or reset shift-related fields depending on the ticket. Returns an error message."""
    booking.requires_workshift = ticket_requires_workshift(booking.ticket_id, scope="regular")

    if not booking.requires_workshift:
        booking.timeslot_priority_1 = -1
        booking.timeslot_priority_2 = -1
        booking.timeslot_priority_3 = -1
        booking.amount_shifts = 0
        booking.supporter_buddy = ""
        return None

    try:
        booking.amount_shifts = int(booking.amount_shifts)
    except (TypeError, ValueError):
        return "Invalid number of shifts"
    if not 1 <= booking.amount_shifts <= MAX_SHIFTS_PER_BOOKING:
        return f"Number of shifts must be between 1 and {MAX_SHIFTS_PER_BOOKING}"

    selection_valid, selection_error = validate_booking_timeslot_selection(
        [booking.timeslot_priority_1, booking.timeslot_priority_2, booking.timeslot_priority_3]
    )
    return None if selection_valid else selection_error


def _apply_server_price(booking: Booking, form_content: dict) -> str | None:
    """Set the total price from the server-side option prices. Returns an error message."""
    try:
        booking.total_price = calculate_regular_total_price(
            form_content,
            int(booking.ticket_id),
            int(booking.beverage_id),
            int(booking.food_id),
            booking.amount_shifts,
        )
    except (TypeError, ValueError):
        return "Invalid option selection"
    return None


@bookings_bp.route("/submitForm", methods=["POST"])
@limiter_bookings.limit("90/minute")
@roles_required("user", "admin")
def submit_form():
    """Submit booking form with comprehensive logging."""
    start_time = time.time()
    client_ip = request.remote_addr

    try:
        logger.info(f"Booking submission started from {client_ip}")

        # Validate request
        if not request.json:
            logger.warning(f"Booking submission failed: missing JSON body from {client_ip}")
            return jsonify({"error": "Missing JSON body"}), 400

        booking_data = {**request.json, **SERVER_OWNED_PAYMENT_DEFAULTS}
        booking_data.pop("id", None)

        try:
            decode_signature_to_blob(str(booking_data.get("signature", "")))
        except ValueError as signature_error:
            return jsonify({"error": str(signature_error)}), 400

        # Create booking object
        booking = Booking(**booking_data)
        logger.info(
            f"Booking submission from {booking.first_name} {booking.last_name} ({booking.email})"
        )

        if not is_valid_active_orga_team_member(booking.invited_by_id):
            logger.warning(
                f"Booking submission failed: invalid invited_by_id={booking.invited_by_id} from {client_ip}"
            )
            return jsonify({"error": "Invalid inviter selection"}), 400

        form_content_dict = get_up_to_date_form_content()
        validation_error = _apply_workshift_rules(booking) or _apply_server_price(
            booking, form_content_dict
        )
        if validation_error:
            logger.warning(f"Booking submission failed: {validation_error}")
            return jsonify({"error": validation_error}), 400

        # Attempt to insert booking
        success, profile_uuid = insert_booking(booking)

        if success:
            resolved_profile_uuid = profile_uuid or ""
            # Send email
            try:
                send_confirmation_mail(booking, form_content_dict, resolved_profile_uuid)
                logger.info(
                    f"Booking and confirmation email successful for {booking.first_name} {booking.last_name}"
                )
            except Exception as email_error:
                logger.exception(
                    "Booking successful but email failed for "
                    f"{booking.first_name} {booking.last_name}: {str(email_error)}",
                )
                # Still return success since booking was created

            duration = time.time() - start_time
            logger.info(
                f"Booking process completed in {duration:.3f}s for {booking.first_name} {booking.last_name}"
            )
            response_payload = {
                "msg": "Booking successful",
                "profile_uuid": resolved_profile_uuid,
            }
            response_status = 200
        else:
            logger.warning(
                f"Duplicate booking attempt for {booking.first_name} {booking.last_name} ({booking.email})"
            )

            response_payload = {"error": "Duplicate booking"}
            response_status = 400

        return jsonify(response_payload), response_status

    except Exception as e:
        duration = time.time() - start_time
        logger.exception(f"Booking submission failed after {duration:.3f}s: {str(e)}")
        return jsonify({"error": "Booking submission failed"}), 500


@bookings_bp.route("/data", methods=["GET"])
@limiter_bookings.limit("200/minute")
@roles_required("admin")
def get_bookings():
    """Get all bookings with admin authorization."""
    start_time = time.time()

    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()

        logger.info(f"Admin {identity} accessing booking data from {request.remote_addr}")

        all_bookings = get_all_bookings()
        booking_count = len(all_bookings)

        duration = time.time() - start_time
        logger.info(f"Retrieved {booking_count} bookings in {duration:.3f}s for admin {identity}")

        if duration > 2.0:  # Log slow queries
            logger.warning(
                f"Slow booking data retrieval: {duration:.3f}s for {booking_count} bookings"
            )

        return jsonify([vars(b) for b in all_bookings]), 200

    except Exception as e:
        duration = time.time() - start_time
        logger.exception(f"Failed to retrieve booking data after {duration:.3f}s: {str(e)}")
        return jsonify({"error": "Failed to retrieve booking data"}), 500


@bookings_bp.route("/booking/<int:booking_id>", methods=["PUT"])
@limiter_bookings.limit("60/minute")
@roles_required("admin")
def update_booking(booking_id):
    """Update booking with admin authorization."""
    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()

        logger.info(f"Admin {identity} updating booking {booking_id}")

        if not request.json:
            logger.warning(f"Booking update failed: missing JSON body for booking {booking_id}")
            return jsonify({"error": "Missing JSON body"}), 400

        booking_data = request.json
        success = update_booking_db(booking_id, booking_data)

        if success:
            logger.info(f"Booking {booking_id} updated successfully by admin {identity}")
            return jsonify({"message": "Booking updated successfully"}), 200
        else:
            logger.warning(f"Booking update failed: booking {booking_id} not found")
            return jsonify({"error": "Booking not found"}), 404

    except Exception as e:
        logger.exception(f"Failed to update booking {booking_id}: {str(e)}")
        return jsonify({"error": "Failed to update booking"}), 500


@bookings_bp.route("/booking/<int:booking_id>/payment", methods=["PUT"])
@limiter_bookings.limit("60/minute")
@roles_required("admin")
def update_payment(booking_id):
    """Update payment status with admin authorization."""
    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()

        logger.info(f"Admin {identity} updating payment for booking {booking_id}")

        if not request.json:
            logger.warning(f"Payment update failed: missing JSON body for booking {booking_id}")
            return jsonify({"error": "Missing JSON body"}), 400

        payment_data = request.json
        success = update_booking_payment(booking_id, payment_data)

        if success:
            logger.info(f"Payment status updated for booking {booking_id} by admin {identity}")
            return jsonify({"message": "Payment updated successfully"}), 200
        else:
            logger.warning(f"Payment update failed: booking {booking_id} not found")
            return jsonify({"error": "Booking not found"}), 404

    except Exception as e:
        logger.exception(f"Failed to update payment for booking {booking_id}: {str(e)}")
        return jsonify({"error": "Failed to update payment"}), 500


@bookings_bp.route("/booking/<int:booking_id>", methods=["DELETE"])
@limiter_bookings.limit("30/minute")
@roles_required("admin")
def delete_booking_endpoint(booking_id):
    """Delete booking with admin authorization."""
    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()

        logger.warning(
            f"Admin {identity} deleting booking {booking_id}"
        )  # Use warning for deletion

        success = delete_booking(booking_id)

        if success:
            logger.warning(f"Booking {booking_id} deleted by admin {identity}")
            return jsonify({"message": "Booking deleted successfully"}), 200
        else:
            logger.warning(f"Booking deletion failed: booking {booking_id} not found")
            return jsonify({"error": "Booking not found"}), 404

    except Exception as e:
        logger.exception(f"Failed to delete booking {booking_id}: {str(e)}")
        return jsonify({"error": "Failed to delete booking"}), 500
