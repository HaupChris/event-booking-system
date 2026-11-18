"""Business events per booking (Phase L, docs/LOGGING.md).

Each event is stored for the event history in the admin booking view and logged as a structured
event with the booking's pseudonym (`booking_ref`). Details must not contain personal data and
only hold values of bounded size (IDs, flags, amounts, error types).
"""

import json
import sqlite3
from contextlib import closing
from datetime import UTC, datetime
from typing import Any

from src.utils.logger import get_logger
from src.utils.paths import get_db_file_path
from src.utils.pseudonyms import BookingType, booking_ref

logger = get_logger(__name__)

DB_FILE_PATH = get_db_file_path()

# Stable event names; the admin frontend shows a label for each of them.
BOOKING_EVENTS = frozenset(
    {
        "booking_created",
        "confirmation_mail_sent",
        "confirmation_mail_failed",
        "booking_updated_by_admin",
        "payment_updated",
        "shift_accepted",
        "shift_declined",
        "profile_link_requested",
        "profile_link_sent",
        "profile_link_send_failed",
        "custom_mail_sent",
        "custom_mail_failed",
    }
)

_BOOKING_TABLES: dict[str, str] = {"regular": "Bookings", "artist": "ArtistBookings"}


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _insert_event(
    cursor: sqlite3.Cursor,
    booking_type: BookingType,
    booking_id: int,
    event: str,
    details: dict[str, Any],
) -> None:
    cursor.execute(
        "INSERT INTO BookingEvents (booking_type, booking_id, event, details, created_at) "
        "VALUES (?, ?, ?, ?, ?)",
        (
            booking_type,
            booking_id,
            event,
            json.dumps(details, default=str),
            datetime.now(tz=UTC).isoformat(timespec="seconds"),
        ),
    )


def record_booking_event(
    booking_type: BookingType,
    booking_id: int,
    event: str,
    details: dict[str, Any] | None = None,
    cursor: sqlite3.Cursor | None = None,
) -> None:
    """Log and store an event. Pass `cursor` to write inside the caller's transaction.

    Without a cursor, a failure to store the event is logged but never breaks the caller.
    """
    if event not in BOOKING_EVENTS:
        raise ValueError(f"Unknown booking event: {event}")
    details = details or {}
    ref = booking_ref(booking_type, booking_id)
    logger.info(event, booking_ref=ref, **details)

    if cursor is not None:
        _insert_event(cursor, booking_type, booking_id, event, details)
        return
    try:
        with closing(_connect()) as conn:
            _insert_event(conn.cursor(), booking_type, booking_id, event, details)
            conn.commit()
    except sqlite3.Error:
        logger.exception("booking_event_store_failed", booking_ref=ref, booking_event=event)


def payment_details(payment_data: dict[str, Any]) -> dict[str, Any]:
    """Event details of a payment update (amounts only, no notes)."""
    return {"is_paid": bool(payment_data["is_paid"]), "paid_amount": payment_data["paid_amount"]}


def find_booking_by_profile(profile_uuid: str) -> tuple[BookingType, int] | None:
    """Booking type and ID for a profile link, or None if it does not exist."""
    with closing(_connect()) as conn:
        for booking_type in ("regular", "artist"):
            row = conn.execute(
                f"SELECT id FROM {_BOOKING_TABLES[booking_type]} WHERE profile_uuid = ?",  # noqa: S608  # fixed table names
                (profile_uuid,),
            ).fetchone()
            if row:
                return booking_type, int(row["id"])
    return None


def record_profile_event(
    profile_uuid: str, event: str, details: dict[str, Any] | None = None
) -> None:
    """Record an event where only the profile link of a booking is known."""
    try:
        booking = find_booking_by_profile(profile_uuid)
    except sqlite3.Error:
        logger.exception("booking_event_lookup_failed", booking_event=event)
        return
    if booking is None:
        logger.warning("booking_event_without_booking", booking_event=event)
        return
    record_booking_event(booking[0], booking[1], event, details)


def get_booking_events(booking_type: BookingType, booking_id: int) -> list[dict[str, Any]]:
    """Events of a booking, oldest first."""
    with closing(_connect()) as conn:
        rows = conn.execute(
            "SELECT id, event, details, created_at FROM BookingEvents "
            "WHERE booking_type = ? AND booking_id = ? ORDER BY id",
            (booking_type, booking_id),
        ).fetchall()
    return [
        {
            "id": row["id"],
            "event": row["event"],
            "details": json.loads(row["details"]),
            "created_at": row["created_at"],
        }
        for row in rows
    ]


def delete_booking_events(
    cursor: sqlite3.Cursor, booking_type: BookingType, booking_id: int
) -> None:
    """Delete the history together with its booking (inside the caller's transaction)."""
    cursor.execute(
        "DELETE FROM BookingEvents WHERE booking_type = ? AND booking_id = ?",
        (booking_type, booking_id),
    )
