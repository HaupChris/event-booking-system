"""Pseudonyms that let admins find log entries without logging personal data (docs/LOGGING.md)."""

import hashlib
import hmac
import os
from typing import Literal

BookingType = Literal["regular", "artist"]

_BOOKING_REF_PREFIX: dict[str, str] = {"regular": "R", "artist": "A"}


def booking_ref(booking_type: BookingType, booking_id: int) -> str:
    """`R-123` for regular bookings, `A-45` for artist bookings."""
    return f"{_BOOKING_REF_PREFIX[booking_type]}-{booking_id}"


def email_ref(email: str) -> str:
    """Short keyed hash of an email address for events without a booking (e.g. recovery).

    Keyed with the JWT secret so the value cannot be reproduced from a known email address
    without server access. It changes when the secret is rotated, which is fine for logs.
    """
    key = os.environ.get("JWT_SECRET_KEY", "").encode()
    digest = hmac.new(key, email.strip().lower().encode(), hashlib.sha256).hexdigest()
    return f"e:{digest[:8]}"
