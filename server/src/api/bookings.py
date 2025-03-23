import dataclasses
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime

from src.models.datatypes import Booking
from src.services.booking_service import insert_booking, get_all_bookings, get_up_to_date_form_content
from src.services.mail_service import send_confirmation_mail

bookings_bp = Blueprint("bookings", __name__)
limiter_bookings = Limiter(get_remote_address)


@bookings_bp.route("/submitForm", methods=["POST"])
@limiter_bookings.limit("90/minute")
@jwt_required()
def submit_form():
    booking_data = request.json
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
    # optional: check_jwt_identity to ensure user or admin role
    # identity = get_jwt_identity()
    # if identity.get("role") not in ["admin", "user"]:
    #    return jsonify({"error": "Unauthorized role"}), 403

    all_bookings = get_all_bookings()
    return jsonify([dataclasses.asdict(b) for b in all_bookings]), 200
