import dataclasses
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime

from src.models.datatypes import Booking, ArtistBooking
from src.services.artist_service import insert_artist_booking, get_up_to_date_artist_form_content
from src.services.booking_service import insert_booking, get_all_bookings, get_up_to_date_form_content, delete_booking
from src.services.mail_service import send_confirmation_mail, send_artist_confirmation_mail

from src.services.booking_service import update_booking_db, update_booking_payment

bookings_bp = Blueprint("bookings", __name__)
limiter_bookings = Limiter(get_remote_address)


@bookings_bp.route("/submitForm", methods=["POST"])
@limiter_bookings.limit("90/minute")
@jwt_required()
def submit_form():
    booking_data = request.json
    if "id" in booking_data:
        del booking_data["id"]
    booking = Booking(**booking_data)

    success = insert_booking(booking)
    request_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{request_time}] Received booking from {booking.first_name} {booking.last_name}")

    if success:
        # Send email
        form_content_dict = get_up_to_date_form_content()
        send_confirmation_mail(booking, form_content_dict)
        print(f"Booking & mail done for {booking.first_name} {booking.last_name}")
        return jsonify({"msg": "Booking successful"}), 200
    else:
        print(f"Duplicate booking attempt for {booking.first_name} {booking.last_name}")
        return jsonify({"error": "Duplicate booking"}), 400


@bookings_bp.route("/data", methods=["GET"])
@limiter_bookings.limit("200/minute")
@jwt_required()
def get_bookings():
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity not in ["admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    all_bookings = get_all_bookings()
    return jsonify([dataclasses.asdict(b) for b in all_bookings]), 200


@bookings_bp.route("/booking/<int:booking_id>", methods=["PUT"])
@limiter_bookings.limit("60/minute")
@jwt_required()
def update_booking(booking_id):
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity not in ["admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    booking_data = request.json

    # Validate input data
    required_fields = ["first_name", "last_name", "email", "phone", "ticket_id",
                       "beverage_id", "food_id", "total_price"]

    for field in required_fields:
        if field not in booking_data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    success = update_booking_db(booking_id, booking_data)

    if success:
        return jsonify({"message": "Booking updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update booking"}), 404


@bookings_bp.route("/booking/<int:booking_id>", methods=["DELETE"])
@limiter_bookings.limit("60/minute")
@jwt_required()
def delete_booking_endpoint(booking_id):
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    success = delete_booking(booking_id)

    if success:
        return jsonify({"message": "Booking deleted successfully"}), 200
    else:
        return jsonify({"error": "Failed to delete booking"}), 404


# Add to server/src/api/bookings.py

@bookings_bp.route("/booking/<int:booking_id>/payment", methods=["PUT"])
@limiter_bookings.limit("60/minute")
@jwt_required()
def update_payment_status(booking_id):
    # Check if user has admin permissions
    identity = get_jwt_identity()
    if identity not in ["admin"]:
        return jsonify({"error": "Unauthorized"}), 403
    payment_data = request.json

    # Validate input data
    required_fields = ["is_paid", "paid_amount"]

    for field in required_fields:
        if field not in payment_data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    success = update_booking_payment(booking_id, payment_data)

    if success:
        return jsonify({"message": "Payment status updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update payment status"}), 404


@bookings_bp.route("/submitArtistForm", methods=["POST"])
@limiter_bookings.limit("90/minute")
@jwt_required()
def submit_artist_form():
    booking_data = request.json
    if "id" in booking_data:
        del booking_data["id"]

    # Create a Booking object from the request data
    booking = ArtistBooking(**booking_data)

    success = insert_artist_booking(booking)
    request_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{request_time}] Received artist booking from {booking.first_name} {booking.last_name}")

    if success:
        # Send email
        form_content_dict = get_up_to_date_artist_form_content()
        # Here you could create a custom email template for artists
        send_artist_confirmation_mail(booking, form_content_dict)
        print(f"Artist booking & mail done for {booking.first_name} {booking.last_name}")
        return jsonify({"msg": "Artist booking successful"}), 200
    else:
        print(f"Duplicate artist booking attempt for {booking.first_name} {booking.last_name}")
        return jsonify({"error": "Duplicate booking"}), 400