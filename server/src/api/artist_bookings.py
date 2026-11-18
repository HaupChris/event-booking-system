import re
import time

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from src.models.datatypes import ArtistBooking
from src.services.artist_service import (
    delete_artist_booking,
    get_all_artist_bookings,
    get_artist_booking_by_id,
    get_up_to_date_artist_form_content,
    insert_artist_bookings,
    update_artist_booking,
    update_artist_payment,
)
from src.services.mail_service import send_artist_confirmation_mail
from src.services.orga_team_service import is_valid_active_orga_team_member
from src.services.pricing_service import SERVER_OWNED_PAYMENT_DEFAULTS, calculate_option_total
from src.utils.logger import get_logger, log_security_event
from src.utils.rate_limit import limiter
from src.utils.signature import decode_signature_to_blob

# Initialize logger
logger = get_logger(__name__)

artist_bp = Blueprint("artist", __name__)
limiter_artist = limiter


def _to_int(value, default: int = -1) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _is_valid_email(value: str) -> bool:
    return bool(re.fullmatch(r"^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$", value, re.I))


def _create_artist_booking_payload(source: dict, total_price: float) -> dict:
    return {
        "last_name": str(source.get("last_name", "")).strip(),
        "first_name": str(source.get("first_name", "")).strip(),
        "email": str(source.get("email", "")).strip(),
        "phone": str(source.get("phone", "")).strip(),
        "invited_by_id": _to_int(source.get("invited_by_id"), -1),
        "ticket_id": _to_int(source.get("ticket_id"), -1),
        "beverage_id": _to_int(source.get("beverage_id"), -1),
        "food_id": _to_int(source.get("food_id"), -1),
        "artist_material_ids": source.get("artist_material_ids", []),
        "total_price": total_price,
        "signature": str(source.get("signature", "")),
        **SERVER_OWNED_PAYMENT_DEFAULTS,
        "equipment": str(source.get("equipment", "")),
        "special_requests": str(source.get("special_requests", "")),
        "performance_details": str(source.get("performance_details", "")),
        "profession_ids": source.get("profession_ids", []),
    }


@artist_bp.route("/artist/submitForm", methods=["POST"])
@limiter_artist.limit("90/minute")
@jwt_required()
def submit_artist_form():  # noqa: C901, PLR0911, PLR0912, PLR0915  # lint-baseline
    """Submit artist booking form with comprehensive logging."""
    start_time = time.time()
    client_ip = request.remote_addr

    try:
        logger.info(f"Artist booking submission started from {client_ip}")

        if not request.json:
            logger.warning(f"Artist booking submission failed: missing JSON body from {client_ip}")
            return jsonify({"error": "Missing JSON body"}), 400

        booking_data = dict(request.json)
        booking_data.pop("id", None)

        try:
            decode_signature_to_blob(str(booking_data.get("signature", "")))
        except ValueError as signature_error:
            return jsonify({"error": str(signature_error)}), 400

        artist_type = str(booking_data.get("artist_type", "dj")).lower()
        raw_band_members = booking_data.get("band_members", [])
        band_members = raw_band_members if isinstance(raw_band_members, list) else []

        form_content_dict = get_up_to_date_artist_form_content()

        lead_total_price = calculate_option_total(
            form_content_dict,
            _to_int(booking_data.get("ticket_id"), -1),
            _to_int(booking_data.get("beverage_id"), -1),
            _to_int(booking_data.get("food_id"), -1),
        )
        lead_payload = _create_artist_booking_payload(booking_data, lead_total_price)
        booking = ArtistBooking(**lead_payload)
        artist_name = f"{booking.first_name} {booking.last_name}".strip() or "Unknown Artist"
        logger.info(f"Artist booking submission from {artist_name}")

        if not _is_valid_email(booking.email):
            return jsonify({"error": "Valid email is required"}), 400

        bookings_to_insert = [booking]

        if artist_type == "band":
            if len(band_members) == 0:
                return jsonify({"error": "At least one band member is required"}), 400

            for member_data in band_members:
                if not isinstance(member_data, dict):
                    return jsonify({"error": "Invalid band member payload"}), 400

                first_name = str(member_data.get("first_name", "")).strip()
                last_name = str(member_data.get("last_name", "")).strip()
                email = str(member_data.get("email", "")).strip()
                if not first_name or not last_name:
                    return jsonify({"error": "Band member first and last name are required"}), 400

                if not email or not _is_valid_email(email):
                    return jsonify({"error": "Band member email is required"}), 400

                ticket_id = _to_int(member_data.get("ticket_id"), -1)
                if ticket_id < 0:
                    return jsonify({"error": "Band member ticket selection is required"}), 400

                beverage_id = _to_int(member_data.get("beverage_id"), -1)
                food_id = _to_int(member_data.get("food_id"), -1)

                member_payload = {
                    **booking_data,
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "ticket_id": ticket_id,
                    "beverage_id": beverage_id,
                    "food_id": food_id,
                    "artist_material_ids": [],
                    "profession_ids": [],
                }
                member_total_price = calculate_option_total(
                    form_content_dict, ticket_id, beverage_id, food_id
                )
                bookings_to_insert.append(
                    ArtistBooking(
                        **_create_artist_booking_payload(member_payload, member_total_price)
                    )
                )

        if not is_valid_active_orga_team_member(booking.invited_by_id):
            logger.warning(
                f"Artist booking submission failed: invalid invited_by_id={booking.invited_by_id} from {client_ip}"
            )
            return jsonify({"error": "Invalid inviter selection"}), 400

        success, profile_uuids = insert_artist_bookings(bookings_to_insert)

        if success:
            try:
                for booked_artist, profile_uuid in zip(
                    bookings_to_insert, profile_uuids, strict=False
                ):
                    send_artist_confirmation_mail(booked_artist, form_content_dict, profile_uuid)
                logger.info(f"Artist booking and confirmation email successful for {artist_name}")
            except Exception as email_error:
                logger.error(
                    f"Artist booking successful but email failed for {artist_name}: {str(email_error)}",
                    exc_info=True,
                )

            duration = time.time() - start_time
            logger.info(f"Artist booking process completed in {duration:.3f}s for {artist_name}")
            return (
                jsonify(
                    {
                        "msg": "Artist booking successful",
                        "profile_uuid": profile_uuids[0] if profile_uuids else "",
                        "profile_uuids": profile_uuids,
                    }
                ),
                200,
            )
        else:
            logger.warning(f"Duplicate artist booking attempt for {artist_name}")
            return jsonify({"error": "Duplicate booking"}), 400

    except ValueError as e:
        # Raised by the price calculation for unknown options or missing form content.
        logger.warning(f"Artist booking submission rejected: {e}")
        return jsonify({"error": "Invalid option selection"}), 400

    except Exception as e:
        duration = time.time() - start_time
        logger.error(
            f"Artist booking submission failed after {duration:.3f}s: {str(e)}", exc_info=True
        )
        return jsonify({"error": "Artist booking submission failed"}), 500


@artist_bp.route("/artist/formcontent", methods=["GET"])
@limiter_artist.limit("200/minute")
@jwt_required()
def get_artist_formcontent():
    """Get artist form content with performance monitoring."""
    start_time = time.time()

    try:
        logger.info("Artist form content requested")

        form_content_dict = get_up_to_date_artist_form_content()

        duration = time.time() - start_time
        logger.info(f"Artist form content generated successfully in {duration:.3f}s")

        if duration > 1.0:
            logger.warning(f"Slow artist form content generation: {duration:.3f}s")

        return jsonify(form_content_dict), 200

    except Exception as e:
        duration = time.time() - start_time
        logger.error(
            f"Error generating artist form content after {duration:.3f}s: {str(e)}", exc_info=True
        )
        return jsonify({"error": "Failed to generate artist form content"}), 500


@artist_bp.route("/artist/data", methods=["GET"])
@limiter_artist.limit("200/minute")
@jwt_required()
def get_artist_bookings():
    """Get all artist bookings with admin authorization."""
    start_time = time.time()

    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity not in ["admin"]:
            logger.warning(
                f"Unauthorized access attempt to artist data from user: {identity}, IP: {request.remote_addr}"
            )
            log_security_event(
                "UNAUTHORIZED_ARTIST_DATA_ACCESS",
                {"endpoint": "artist_data", "user_identity": identity},
            )
            return jsonify({"error": "Unauthorized"}), 403

        logger.info(f"Admin {identity} accessing artist booking data from {request.remote_addr}")

        all_bookings = get_all_artist_bookings()
        booking_count = len(all_bookings)

        duration = time.time() - start_time
        logger.info(
            f"Retrieved {booking_count} artist bookings in {duration:.3f}s for admin {identity}"
        )

        if duration > 2.0:
            logger.warning(
                f"Slow artist booking data retrieval: {duration:.3f}s for {booking_count} bookings"
            )

        return jsonify([vars(b) for b in all_bookings]), 200

    except Exception as e:
        duration = time.time() - start_time
        logger.error(
            f"Failed to retrieve artist booking data after {duration:.3f}s: {str(e)}", exc_info=True
        )
        return jsonify({"error": "Failed to retrieve artist booking data"}), 500


@artist_bp.route("/artist/booking/<int:booking_id>", methods=["GET"])
@limiter_artist.limit("200/minute")
@jwt_required()
def get_artist_booking(booking_id):
    """Get specific artist booking with admin authorization."""
    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity not in ["admin"]:
            logger.warning(
                f"Unauthorized artist booking access attempt by {identity} for booking {booking_id}"
            )
            log_security_event(
                "UNAUTHORIZED_ARTIST_BOOKING_ACCESS",
                {
                    "endpoint": "get_artist_booking",
                    "user_identity": identity,
                    "booking_id": booking_id,
                },
            )
            return jsonify({"error": "Unauthorized"}), 403

        logger.info(f"Admin {identity} accessing artist booking {booking_id}")

        booking = get_artist_booking_by_id(booking_id)
        if booking:
            logger.info(f"Artist booking {booking_id} retrieved successfully for admin {identity}")
            return jsonify(vars(booking)), 200
        else:
            logger.warning(f"Artist booking {booking_id} not found for admin {identity}")
            return jsonify({"error": "Booking not found"}), 404

    except Exception as e:
        logger.error(f"Failed to retrieve artist booking {booking_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to retrieve artist booking"}), 500


@artist_bp.route("/artist/booking/<int:booking_id>", methods=["PUT"])
@limiter_artist.limit("60/minute")
@jwt_required()
def update_artist(booking_id):
    """Update artist booking with admin authorization."""
    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity not in ["admin"]:
            logger.warning(
                f"Unauthorized artist booking update attempt by {identity} for booking {booking_id}"
            )
            log_security_event(
                "UNAUTHORIZED_ARTIST_UPDATE_ATTEMPT",
                {
                    "endpoint": "update_artist_booking",
                    "user_identity": identity,
                    "booking_id": booking_id,
                },
            )
            return jsonify({"error": "Unauthorized"}), 403

        logger.info(f"Admin {identity} updating artist booking {booking_id}")

        if not request.json:
            logger.warning(
                f"Artist booking update failed: missing JSON body for booking {booking_id}"
            )
            return jsonify({"error": "Missing JSON body"}), 400

        booking_data = request.json
        success = update_artist_booking(booking_id, booking_data)

        if success:
            logger.info(f"Artist booking {booking_id} updated successfully by admin {identity}")
            return jsonify({"message": "Artist booking updated successfully"}), 200
        else:
            logger.warning(f"Artist booking update failed: booking {booking_id} not found")
            return jsonify({"error": "Booking not found"}), 404

    except Exception as e:
        logger.error(f"Failed to update artist booking {booking_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to update artist booking"}), 500


@artist_bp.route("/artist/booking/<int:booking_id>/payment", methods=["PUT"])
@limiter_artist.limit("60/minute")
@jwt_required()
def update_artist_payment_route(booking_id):
    """Update artist payment status with admin authorization."""
    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity not in ["admin"]:
            logger.warning(
                f"Unauthorized artist payment update attempt by {identity} for booking {booking_id}"
            )
            log_security_event(
                "UNAUTHORIZED_ARTIST_PAYMENT_UPDATE",
                {
                    "endpoint": "update_artist_payment",
                    "user_identity": identity,
                    "booking_id": booking_id,
                },
            )
            return jsonify({"error": "Unauthorized"}), 403

        logger.info(f"Admin {identity} updating artist payment for booking {booking_id}")

        if not request.json:
            logger.warning(
                f"Artist payment update failed: missing JSON body for booking {booking_id}"
            )
            return jsonify({"error": "Missing JSON body"}), 400

        payment_data = request.json
        success = update_artist_payment(booking_id, payment_data)

        if success:
            logger.info(
                f"Artist payment status updated for booking {booking_id} by admin {identity}"
            )
            return jsonify({"message": "Artist payment updated successfully"}), 200
        else:
            logger.warning(f"Artist payment update failed: booking {booking_id} not found")
            return jsonify({"error": "Booking not found"}), 404

    except Exception as e:
        logger.error(
            f"Failed to update artist payment for booking {booking_id}: {str(e)}", exc_info=True
        )
        return jsonify({"error": "Failed to update artist payment"}), 500


@artist_bp.route("/artist/booking/<int:booking_id>", methods=["DELETE"])
@limiter_artist.limit("30/minute")
@jwt_required()
def delete_artist_booking_endpoint(booking_id):
    """Delete artist booking with admin authorization."""
    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity not in ["admin"]:
            logger.warning(
                f"Unauthorized artist booking deletion attempt by {identity} for booking {booking_id}"
            )
            log_security_event(
                "UNAUTHORIZED_ARTIST_DELETE_ATTEMPT",
                {
                    "endpoint": "delete_artist_booking",
                    "user_identity": identity,
                    "booking_id": booking_id,
                },
            )
            return jsonify({"error": "Unauthorized"}), 403

        logger.warning(
            f"Admin {identity} deleting artist booking {booking_id}"
        )  # Use warning for deletion

        success = delete_artist_booking(booking_id)

        if success:
            logger.warning(f"Artist booking {booking_id} deleted by admin {identity}")
            return jsonify({"message": "Artist booking deleted successfully"}), 200
        else:
            logger.warning(f"Artist booking deletion failed: booking {booking_id} not found")
            return jsonify({"error": "Booking not found"}), 404

    except Exception as e:
        logger.error(f"Failed to delete artist booking {booking_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to delete artist booking"}), 500
