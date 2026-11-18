"""Admin API: event history of a booking (Phase L)."""

from typing import cast

from flask import Blueprint, jsonify

from src.api.auth_guards import protect_blueprint
from src.services.booking_events_service import get_booking_events
from src.utils.pseudonyms import BookingType, booking_ref

admin_booking_events_bp = Blueprint("admin_booking_events", __name__)
protect_blueprint(admin_booking_events_bp, "admin")

BOOKING_TYPES = ("regular", "artist")


@admin_booking_events_bp.route("/bookings/<booking_type>/<int:booking_id>/events", methods=["GET"])
def get_events(booking_type: str, booking_id: int):
    if booking_type not in BOOKING_TYPES:
        return jsonify({"error": "Unknown booking type"}), 400
    typed = cast(BookingType, booking_type)
    return jsonify(
        {
            "booking_ref": booking_ref(typed, booking_id),
            "events": get_booking_events(typed, booking_id),
        }
    )
