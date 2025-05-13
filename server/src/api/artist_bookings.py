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
    update_artist_payment, get_up_to_date_artist_form_content
)
from src.services.mail_service import send_artist_confirmation_mail

artist_bp = Blueprint("artist", __name__)
limiter_artist = Limiter(get_remote_address)


@artist_bp.route("/artist/submitForm", methods=["POST"])
@limiter_artist.limit("90/minute")
@jwt_required()
def submit_artist_form():
    booking_data = request.json
    if "id" in booking_data:
        del booking_data["id"]
    booking = ArtistBooking(**booking_data)

    success = insert_artist_booking(booking)
    if success:
        # Send email
        form_content_dict = get_up_to_date_artist_form_content()
        send_artist_confirmation_mail(booking, form_content_dict)
        return jsonify({"msg": "Artist booking successful"}), 200
    else:
        return jsonify({"error": "Duplicate booking"}), 400


@artist_bp.route("/artist/formcontent", methods=["GET"])
@limiter_artist.limit("200/minute")
@jwt_required()
def get_artist_formcontent():
    try:
        form_content_dict = get_up_to_date_artist_form_content()
        return jsonify(form_content_dict), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@artist_bp.route("/artist/data", methods=["GET"])
@limiter_artist.limit("200/minute")
@jwt_required()
def get_artist_bookings():
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity not in ["admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    all_bookings = get_all_artist_bookings()
    return jsonify([vars(b) for b in all_bookings]), 200


@artist_bp.route("/artist/booking/<int:booking_id>", methods=["GET"])
@limiter_artist.limit("200/minute")
@jwt_required()
def get_artist_booking(booking_id):
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity not in ["admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    booking = get_artist_booking_by_id(booking_id)
    if booking:
        return jsonify(vars(booking)), 200
    else:
        return jsonify({"error": "Booking not found"}), 404


@artist_bp.route("/artist/booking/<int:booking_id>", methods=["PUT"])
@limiter_artist.limit("60/minute")
@jwt_required()
def update_artist(booking_id):
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity not in ["admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    booking_data = request.json
    success = update_artist_booking(booking_id, booking_data)

    if success:
        return jsonify({"message": "Artist booking updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update artist booking"}), 404


@artist_bp.route("/artist/booking/<int:booking_id>/payment", methods=["PUT"])
@limiter_artist.limit("60/minute")
@jwt_required()
def update_artist_payment_status(booking_id):
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity.get("role") not in ["admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    payment_data = request.json
    required_fields = ["is_paid", "paid_amount"]

    for field in required_fields:
        if field not in payment_data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    success = update_artist_payment(booking_id, payment_data)

    if success:
        return jsonify({"message": "Artist payment status updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update artist payment status"}), 404