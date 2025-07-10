import time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from src.models.datatypes import ArtistBooking
from src.services.artist_service import (
    insert_artist_booking,
    get_all_artist_bookings,
    get_artist_booking_by_id,
    update_artist_booking,
    update_artist_payment,
    get_up_to_date_artist_form_content,
    delete_artist_booking
)
from src.services.mail_service import send_artist_confirmation_mail
from src.utils.logger import get_logger, log_security_event

# Initialize logger
logger = get_logger(__name__)

artist_bp = Blueprint("artist", __name__)
limiter_artist = Limiter(get_remote_address)


@artist_bp.route("/artist/submitForm", methods=["POST"])
@limiter_artist.limit("90/minute")
@jwt_required()
def submit_artist_form():
    """Submit artist booking form with comprehensive logging."""
    start_time = time.time()
    client_ip = request.remote_addr

    try:
        logger.info(f"Artist booking submission started from {client_ip}")

        if not request.json:
            logger.warning(f"Artist booking submission failed: missing JSON body from {client_ip}")
            return jsonify({"error": "Missing JSON body"}), 400

        booking_data = request.json
        if "id" in booking_data:
            del booking_data["id"]

        booking = ArtistBooking(**booking_data)
        artist_name = getattr(booking, 'artist_name', 'Unknown Artist')
        logger.info(f"Artist booking submission from {artist_name}")

        success = insert_artist_booking(booking)

        if success:
            try:
                # Send email
                form_content_dict = get_up_to_date_artist_form_content()
                send_artist_confirmation_mail(booking, form_content_dict)
                logger.info(f"Artist booking and confirmation email successful for {artist_name}")
            except Exception as email_error:
                logger.error(f"Artist booking successful but email failed for {artist_name}: {str(email_error)}",
                             exc_info=True)

            duration = time.time() - start_time
            logger.info(f"Artist booking process completed in {duration:.3f}s for {artist_name}")
            return jsonify({"msg": "Artist booking successful"}), 200
        else:
            logger.warning(f"Duplicate artist booking attempt for {artist_name}")
            return jsonify({"error": "Duplicate booking"}), 400

    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Artist booking submission failed after {duration:.3f}s: {str(e)}", exc_info=True)
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
        logger.error(f"Error generating artist form content after {duration:.3f}s: {str(e)}", exc_info=True)
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
                f"Unauthorized access attempt to artist data from user: {identity}, IP: {request.remote_addr}")
            log_security_event('UNAUTHORIZED_ARTIST_DATA_ACCESS', {
                'endpoint': 'artist_data',
                'user_identity': identity
            })
            return jsonify({"error": "Unauthorized"}), 403

        logger.info(f"Admin {identity} accessing artist booking data from {request.remote_addr}")

        all_bookings = get_all_artist_bookings()
        booking_count = len(all_bookings)

        duration = time.time() - start_time
        logger.info(f"Retrieved {booking_count} artist bookings in {duration:.3f}s for admin {identity}")

        if duration > 2.0:
            logger.warning(f"Slow artist booking data retrieval: {duration:.3f}s for {booking_count} bookings")

        return jsonify([vars(b) for b in all_bookings]), 200

    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Failed to retrieve artist booking data after {duration:.3f}s: {str(e)}", exc_info=True)
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
            logger.warning(f"Unauthorized artist booking access attempt by {identity} for booking {booking_id}")
            log_security_event('UNAUTHORIZED_ARTIST_BOOKING_ACCESS', {
                'endpoint': 'get_artist_booking',
                'user_identity': identity,
                'booking_id': booking_id
            })
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
            logger.warning(f"Unauthorized artist booking update attempt by {identity} for booking {booking_id}")
            log_security_event('UNAUTHORIZED_ARTIST_UPDATE_ATTEMPT', {
                'endpoint': 'update_artist_booking',
                'user_identity': identity,
                'booking_id': booking_id
            })
            return jsonify({"error": "Unauthorized"}), 403

        logger.info(f"Admin {identity} updating artist booking {booking_id}")

        if not request.json:
            logger.warning(f"Artist booking update failed: missing JSON body for booking {booking_id}")
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
def update_artist_payment(booking_id):
    """Update artist payment status with admin authorization."""
    try:
        # Check if user has admin permissions
        identity = get_jwt_identity()
        if identity not in ["admin"]:
            logger.warning(f"Unauthorized artist payment update attempt by {identity} for booking {booking_id}")
            log_security_event('UNAUTHORIZED_ARTIST_PAYMENT_UPDATE', {
                'endpoint': 'update_artist_payment',
                'user_identity': identity,
                'booking_id': booking_id
            })
            return jsonify({"error": "Unauthorized"}), 403

        logger.info(f"Admin {identity} updating artist payment for booking {booking_id}")

        if not request.json:
            logger.warning(f"Artist payment update failed: missing JSON body for booking {booking_id}")
            return jsonify({"error": "Missing JSON body"}), 400

        payment_data = request.json
        success = update_artist_payment(booking_id, payment_data)

        if success:
            logger.info(f"Artist payment status updated for booking {booking_id} by admin {identity}")
            return jsonify({"message": "Artist payment updated successfully"}), 200
        else:
            logger.warning(f"Artist payment update failed: booking {booking_id} not found")
            return jsonify({"error": "Booking not found"}), 404

    except Exception as e:
        logger.error(f"Failed to update artist payment for booking {booking_id}: {str(e)}", exc_info=True)
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
            logger.warning(f"Unauthorized artist booking deletion attempt by {identity} for booking {booking_id}")
            log_security_event('UNAUTHORIZED_ARTIST_DELETE_ATTEMPT', {
                'endpoint': 'delete_artist_booking',
                'user_identity': identity,
                'booking_id': booking_id
            })
            return jsonify({"error": "Unauthorized"}), 403

        logger.warning(f"Admin {identity} deleting artist booking {booking_id}")  # Use warning for deletion

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