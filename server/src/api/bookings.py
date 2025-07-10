import time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


from src.models.datatypes import Booking
from src.services.booking_service import insert_booking, get_all_bookings, get_up_to_date_form_content, delete_booking
from src.services.mail_service import send_confirmation_mail
from src.services.booking_service import update_booking_db, update_booking_payment
from src.utils.logger import get_logger, log_security_event

# Initialize logger
logger = get_logger(__name__)

bookings_bp = Blueprint("bookings", __name__)
limiter_bookings = Limiter(get_remote_address)


@bookings_bp.route("/submitForm", methods=["POST"])
@limiter_bookings.limit("90/minute")
@jwt_required()
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

        booking_data = request.json
        if "id" in booking_data:
            del booking_data["id"]

        # Create booking object
        booking = Booking(**booking_data)
        logger.info(f"Booking submission from {booking.first_name} {booking.last_name} ({booking.email})")

        # Attempt to insert booking
        success = insert_booking(booking)

        if success:
            # Send email
            try:
                form_content_dict = get_up_to_date_form_content()
                send_confirmation_mail(booking, form_content_dict)
                logger.info(f"Booking and confirmation email successful for {booking.first_name} {booking.last_name}")
            except Exception as email_error:
                logger.error(
                    f"Booking successful but email failed for {booking.first_name} {booking.last_name}: {str(email_error)}",
                    exc_info=True)
                # Still return success since booking was created

            duration = time.time() - start_time
            logger.info(f"Booking process completed in {duration:.3f}s for {booking.first_name} {booking.last_name}")
            return jsonify({"msg": "Booking successful"}), 200
        else:
            logger.warning(f"Duplicate booking attempt for {booking.first_name} {booking.last_name} ({booking.email})")
            return jsonify({"error": "Duplicate booking"}), 400

    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Booking submission failed after {duration:.3f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Booking submission failed"}), 500


@bookings_bp.route("/data", methods=["GET"])
@limiter_bookings.limit("200/minute")
@jwt_required()
def get_bookings():
    """Get all bookings with admin authorization."""
    start_time = time.time()

    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity not in ["admin"]:
            logger.warning(
                f"Unauthorized access attempt to booking data from user: {identity}, IP: {request.remote_addr}")
            log_security_event('UNAUTHORIZED_DATA_ACCESS', {
                'endpoint': 'bookings_data',
                'user_identity': identity
            })
            return jsonify({"error": "Unauthorized"}), 403

        logger.info(f"Admin {identity} accessing booking data from {request.remote_addr}")

        all_bookings = get_all_bookings()
        booking_count = len(all_bookings)

        duration = time.time() - start_time
        logger.info(f"Retrieved {booking_count} bookings in {duration:.3f}s for admin {identity}")

        if duration > 2.0:  # Log slow queries
            logger.warning(f"Slow booking data retrieval: {duration:.3f}s for {booking_count} bookings")

        return jsonify([vars(b) for b in all_bookings]), 200

    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Failed to retrieve booking data after {duration:.3f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to retrieve booking data"}), 500


@bookings_bp.route("/booking/<int:booking_id>", methods=["PUT"])
@limiter_bookings.limit("60/minute")
@jwt_required()
def update_booking(booking_id):
    """Update booking with admin authorization."""
    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity not in ["admin"]:
            logger.warning(f"Unauthorized booking update attempt by {identity} for booking {booking_id}")
            log_security_event('UNAUTHORIZED_UPDATE_ATTEMPT', {
                'endpoint': 'update_booking',
                'user_identity': identity,
                'booking_id': booking_id
            })
            return jsonify({"error": "Unauthorized"}), 403

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
        logger.error(f"Failed to update booking {booking_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to update booking"}), 500


@bookings_bp.route("/booking/<int:booking_id>/payment", methods=["PUT"])
@limiter_bookings.limit("60/minute")
@jwt_required()
def update_payment(booking_id):
    """Update payment status with admin authorization."""
    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity not in ["admin"]:
            logger.warning(f"Unauthorized payment update attempt by {identity} for booking {booking_id}")
            log_security_event('UNAUTHORIZED_PAYMENT_UPDATE', {
                'endpoint': 'update_payment',
                'user_identity': identity,
                'booking_id': booking_id
            })
            return jsonify({"error": "Unauthorized"}), 403

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
        logger.error(f"Failed to update payment for booking {booking_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to update payment"}), 500


@bookings_bp.route("/booking/<int:booking_id>", methods=["DELETE"])
@limiter_bookings.limit("30/minute")
@jwt_required()
def delete_booking_endpoint(booking_id):
    """Delete booking with admin authorization."""
    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity not in ["admin"]:
            logger.warning(f"Unauthorized booking deletion attempt by {identity} for booking {booking_id}")
            log_security_event('UNAUTHORIZED_DELETE_ATTEMPT', {
                'endpoint': 'delete_booking',
                'user_identity': identity,
                'booking_id': booking_id
            })
            return jsonify({"error": "Unauthorized"}), 403

        logger.warning(f"Admin {identity} deleting booking {booking_id}")  # Use warning for deletion

        success = delete_booking(booking_id)

        if success:
            logger.warning(f"Booking {booking_id} deleted by admin {identity}")
            return jsonify({"message": "Booking deleted successfully"}), 200
        else:
            logger.warning(f"Booking deletion failed: booking {booking_id} not found")
            return jsonify({"error": "Booking not found"}), 404

    except Exception as e:
        logger.error(f"Failed to delete booking {booking_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to delete booking"}), 500