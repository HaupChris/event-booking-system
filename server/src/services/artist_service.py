import sqlite3
import uuid
from contextlib import closing
from typing import Any, cast

from src.models.datatypes import ArtistBooking, ArtistBookingWithTimestamp
from src.services.app_settings_service import get_payment_link
from src.services.booking_service import DB_FILE_PATH
from src.services.formcontent_service import (
    get_artist_form_content_obj,
    update_artist_form_content_with_db_counts,
)
from src.services.orga_team_service import get_active_orga_team_members
from src.utils.signature import MAX_SIGNATURE_BYTES, decode_signature_to_blob


def get_all_artist_bookings() -> list[ArtistBookingWithTimestamp]:
    """
    Returns all artist bookings with artist + booking info, including material_ids.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT b.id as booking_id,
                   a.last_name,
                   a.first_name,
                   a.email,
                   a.phone_number,
                   b.ticket_option_id,
                   b.beverage_option_id,
                   b.food_option_id,
                   b.total_price,
                   b.timestamp,
                   b.signature,
                   b.is_paid,
                   b.paid_amount,
                   b.payment_notes,
                   b.payment_date,
                   b.invited_by_id,
                   ot.name as invited_by_name,
                   b.equipment,
                   b.special_requests,
                   b.performance_details,
                   b.profile_uuid
            FROM Artists a
            JOIN ArtistBookings b ON a.id = b.artist_id
            LEFT JOIN OrgaTeamInviters ot ON b.invited_by_id = ot.id
            """
        )
        rows = cursor.fetchall()

        bookings: list[ArtistBookingWithTimestamp] = []
        for row in rows:
            booking_id = row[0]
            cursor.execute(
                """
                SELECT artist_material_id
                FROM ArtistBookingMaterials
                WHERE booking_id = ?
                """,
                (booking_id,),
            )
            material_ids = [item[0] for item in cursor.fetchall()]

            cursor.execute(
                """
                           SELECT profession_id
                           FROM ArtistBookingProfessions
                           WHERE booking_id = ?
                           """,
                (booking_id,),
            )
            profession_ids = [item[0] for item in cursor.fetchall()]

            booking = ArtistBookingWithTimestamp(
                id=booking_id,
                last_name=row[1],
                first_name=row[2],
                email=row[3],
                phone=row[4],
                ticket_id=row[5],
                beverage_id=row[6],
                food_id=row[7],
                total_price=row[8],
                timestamp=row[9],
                signature="",
                is_paid=row[11] == 1,
                paid_amount=row[12],
                payment_notes=row[13],
                payment_date=row[14],
                invited_by_id=row[15] if row[15] is not None else -1,
                invited_by_name=row[16] or "",
                equipment=row[17],
                special_requests=row[18],
                performance_details=row[19],
                profile_uuid=row[20],
                artist_material_ids=material_ids,
                profession_ids=profession_ids,
            )
            bookings.append(booking)
        return bookings


def get_artist_booking_by_id(booking_id: int) -> ArtistBookingWithTimestamp | None:
    """Returns a specific artist booking by ID."""
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
                       SELECT b.id as booking_id,
                              a.last_name,
                              a.first_name,
                              a.email,
                              a.phone_number,
                              b.ticket_option_id,
                              b.beverage_option_id,
                              b.food_option_id,
                              b.total_price,
                              b.timestamp,
                              b.signature,
                              b.is_paid,
                              b.paid_amount,
                               b.payment_notes,
                               b.payment_date,
                               b.invited_by_id,
                               ot.name as invited_by_name,
                               b.equipment,
                               b.special_requests,
                               b.performance_details,
                               b.profile_uuid
                       FROM Artists a
                                 JOIN ArtistBookings b ON a.id = b.artist_id
                                 LEFT JOIN OrgaTeamInviters ot ON b.invited_by_id = ot.id
                       WHERE b.id = ?
                       """,
            (booking_id,),
        )
        row = cursor.fetchone()

        if not row:
            return None

        cursor.execute(
            """
                       SELECT artist_material_id
                       FROM ArtistBookingMaterials
                       WHERE booking_id = ?
                       """,
            (booking_id,),
        )
        material_ids = [item[0] for item in cursor.fetchall()]

        return ArtistBookingWithTimestamp(
            id=row[0],
            last_name=row[1],
            first_name=row[2],
            email=row[3],
            phone=row[4],
            ticket_id=row[5],
            beverage_id=row[6],
            food_id=row[7],
            total_price=row[8],
            timestamp=row[9],
            signature="",
            is_paid=row[11] == 1,
            paid_amount=row[12],
            payment_notes=row[13],
            payment_date=row[14],
            invited_by_id=row[15] if row[15] is not None else -1,
            invited_by_name=row[16] or "",
            equipment=row[17],
            special_requests=row[18],
            performance_details=row[19],
            profile_uuid=row[20],
            artist_material_ids=material_ids,
        )


def update_artist_booking(booking_id: int, booking_data: dict) -> bool:
    """
    Updates an existing artist booking in the database.
    Returns True if successful, False otherwise.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()

        # First get the artist_id associated with this booking
        cursor.execute("SELECT artist_id FROM ArtistBookings WHERE id = ?", (booking_id,))
        result = cursor.fetchone()
        if not result:
            return False

        artist_id = result[0]

        # Start a transaction
        conn.execute("BEGIN TRANSACTION")
        try:
            # Update Artist information
            cursor.execute(
                """
                           UPDATE Artists
                           SET first_name   = ?,
                               last_name    = ?,
                               email        = ?,
                               phone_number = ?
                           WHERE id = ?
                           """,
                (
                    booking_data["first_name"],
                    booking_data["last_name"],
                    booking_data["email"],
                    booking_data["phone"],
                    artist_id,
                ),
            )

            # Update ArtistBooking information
            cursor.execute(
                """
                           UPDATE ArtistBookings
                           SET ticket_option_id    = ?,
                               beverage_option_id  = ?,
                               food_option_id      = ?,
                               total_price         = ?,
                               equipment           = ?,
                               special_requests    = ?,
                                performance_details = ?,
                                invited_by_id       = ?,
                                is_paid             = ?,
                                paid_amount         = ?,
                                payment_notes       = ?,
                               payment_date        = ?
                           WHERE id = ?
                           """,
                (
                    booking_data["ticket_id"],
                    booking_data["beverage_id"],
                    booking_data["food_id"],
                    booking_data["total_price"],
                    booking_data.get("equipment", ""),
                    booking_data.get("special_requests", ""),
                    booking_data.get("performance_details", ""),
                    booking_data.get("invited_by_id"),
                    1 if booking_data.get("is_paid", False) else 0,
                    booking_data.get("paid_amount", 0),
                    booking_data.get("payment_notes", ""),
                    booking_data.get("payment_date", ""),
                    booking_id,
                ),
            )

            # Handle materials if they were updated
            if "artist_material_ids" in booking_data:
                # Delete existing materials first
                cursor.execute(
                    "DELETE FROM ArtistBookingMaterials WHERE booking_id = ?", (booking_id,)
                )

                # Insert new material selections
                for material_id in booking_data["artist_material_ids"]:
                    cursor.execute(
                        "INSERT INTO ArtistBookingMaterials (booking_id, artist_material_id) VALUES (?, ?)",
                        (booking_id, material_id),
                    )

            # Commit transaction
            conn.commit()
            return True

        except Exception as e:
            # Rollback in case of error
            conn.rollback()
            print(f"Error updating artist booking: {e}")
            return False


def update_artist_payment(booking_id: int, payment_data: dict) -> bool:
    """
    Updates the payment status of an artist booking.
    Returns True if successful, False otherwise.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()

        # Check if booking exists
        cursor.execute("SELECT id FROM ArtistBookings WHERE id = ?", (booking_id,))
        if not cursor.fetchone():
            return False

        try:
            # Update payment information
            cursor.execute(
                """
                           UPDATE ArtistBookings
                           SET is_paid       = ?,
                               paid_amount   = ?,
                               payment_notes = ?,
                               payment_date  = ?
                           WHERE id = ?
                           """,
                (
                    1 if payment_data["is_paid"] else 0,
                    payment_data["paid_amount"],
                    payment_data.get("payment_notes", ""),
                    payment_data.get("payment_date"),
                    booking_id,
                ),
            )

            conn.commit()
            return True

        except Exception as e:
            print(f"Error updating artist payment: {e}")
            return False


def insert_artist_booking(booking: ArtistBooking) -> tuple[bool, str | None]:
    """
    Backward-compatible single-booking insert helper.
    """
    success, profile_uuids = insert_artist_bookings([booking])
    if not success or not profile_uuids:
        return False, None
    return True, profile_uuids[0]


def insert_artist_bookings(bookings: list[ArtistBooking]) -> tuple[bool, list[str]]:
    """
    Inserts multiple artist bookings atomically.

    Returns:
        Tuple of (success: bool, profile_uuids: list[str])
    """
    if not bookings:
        return False, []

    with closing(_connect_db()) as conn:
        cursor = conn.cursor()

        for booking in bookings:
            if _artist_booking_exists_with_cursor(cursor, booking):
                return False, []

        profile_uuids: list[str] = []
        try:
            conn.execute("BEGIN TRANSACTION")

            for booking in bookings:
                cursor.execute(
                    """
                    INSERT INTO Artists (last_name, first_name, email, phone_number)
                    VALUES (?, ?, ?, ?)
                    """,
                    (booking.last_name, booking.first_name, booking.email, booking.phone),
                )
                artist_id = cast(int, cursor.lastrowid)

                profile_uuid = str(uuid.uuid4())
                signature_blob = _to_signature_blob(booking.signature)
                cursor.execute(
                    """
                    INSERT INTO ArtistBookings (
                        artist_id, ticket_option_id, beverage_option_id, food_option_id,
                        signature, total_price, is_paid, paid_amount, payment_notes, payment_date,
                        invited_by_id, equipment, special_requests, performance_details, profile_uuid
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        artist_id,
                        booking.ticket_id,
                        booking.beverage_id,
                        booking.food_id,
                        sqlite3.Binary(signature_blob),
                        booking.total_price,
                        1 if booking.is_paid else 0,
                        booking.paid_amount,
                        booking.payment_notes,
                        booking.payment_date,
                        booking.invited_by_id,
                        booking.equipment,
                        booking.special_requests,
                        booking.performance_details,
                        profile_uuid,
                    ),
                )
                booking_id = cast(int, cursor.lastrowid)

                for material_id in booking.artist_material_ids:
                    cursor.execute(
                        "INSERT INTO ArtistBookingMaterials (booking_id, artist_material_id) VALUES (?, ?)",
                        (booking_id, material_id),
                    )

                for profession_id in booking.profession_ids:
                    cursor.execute(
                        "INSERT INTO ArtistBookingProfessions (booking_id, profession_id) VALUES (?, ?)",
                        (booking_id, profession_id),
                    )

                profile_uuids.append(profile_uuid)

            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"Error inserting artist bookings: {e}")
            return False, []

    return True, profile_uuids


def get_up_to_date_artist_form_content() -> dict:
    """
    Returns the current form content (dict) with booking counts updated based on the DB state.
    """
    form_content_obj = get_artist_form_content_obj()
    result = update_artist_form_content_with_db_counts(cast(Any, form_content_obj), _connect_db)  # type: ignore
    result["payment_link"] = get_payment_link()
    result["orga_inviters"] = get_active_orga_team_members()
    return result


def delete_artist_booking(booking_id: int) -> bool:
    """
    Deletes an artist booking and all related data.
    Returns True if successful, False otherwise.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()

        try:
            # Start a transaction
            conn.execute("BEGIN TRANSACTION")

            # Delete related records first
            cursor.execute("DELETE FROM ArtistBookingMaterials WHERE booking_id = ?", (booking_id,))
            cursor.execute(
                "DELETE FROM ArtistBookingProfessions WHERE booking_id = ?", (booking_id,)
            )

            # Get artist_id to delete if this is the only booking for this artist
            cursor.execute("SELECT artist_id FROM ArtistBookings WHERE id = ?", (booking_id,))
            result = cursor.fetchone()

            if not result:
                # Booking not found
                conn.rollback()
                return False

            artist_id = result[0]

            # Delete the booking
            cursor.execute("DELETE FROM ArtistBookings WHERE id = ?", (booking_id,))

            # Check if artist has other bookings, if not, delete the artist
            cursor.execute("SELECT COUNT(*) FROM ArtistBookings WHERE artist_id = ?", (artist_id,))
            if cursor.fetchone()[0] == 0:
                cursor.execute("DELETE FROM Artists WHERE id = ?", (artist_id,))

            # Commit transaction
            conn.commit()
            return True

        except Exception as e:
            # Rollback in case of error
            conn.rollback()
            print(f"Error deleting artist booking: {e}")
            return False


################## helper methods


def _connect_db() -> sqlite3.Connection:
    """
    Returns a new SQLite connection.
    """
    return sqlite3.connect(DB_FILE_PATH)


def _to_signature_blob(signature: str | bytes) -> bytes:
    if isinstance(signature, bytes):
        if not signature:
            raise ValueError("Signature is required")
        if len(signature) > MAX_SIGNATURE_BYTES:
            raise ValueError("Signature is too large")
        return signature
    return decode_signature_to_blob(signature)


def _artist_booking_exists(booking: ArtistBooking) -> bool:
    """
    Checks if an artist booking already exists with the same name and email.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT COUNT(*)
            FROM Artists a
            JOIN ArtistBookings b ON a.id = b.artist_id
            WHERE a.first_name = ?
            AND a.last_name = ?
            AND a.email = ?
            """,
            (booking.first_name, booking.last_name, booking.email),
        )
        return cursor.fetchone()[0] > 0


def _artist_booking_exists_with_cursor(cursor: sqlite3.Cursor, booking: ArtistBooking) -> bool:
    """
    Checks if an artist booking already exists with the same name and email.
    """
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM Artists a
        JOIN ArtistBookings b ON a.id = b.artist_id
        WHERE a.first_name = ?
        AND a.last_name = ?
        AND a.email = ?
        """,
        (booking.first_name, booking.last_name, booking.email),
    )
    return cursor.fetchone()[0] > 0


def _create_artist(booking: ArtistBooking) -> int:
    """
    Creates an artist in the Artists table and returns the artist_id.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO Artists (last_name, first_name, email, phone_number)
            VALUES (?, ?, ?, ?)
            """,
            (booking.last_name, booking.first_name, booking.email, booking.phone),
        )
        conn.commit()
        artist_id = cursor.lastrowid
        if artist_id is None:
            raise RuntimeError("Failed to create artist record")
        return artist_id


def _create_artist_booking(artist_id: int, booking: ArtistBooking) -> tuple[int, str | None]:
    """
    Creates an artist booking in the ArtistBookings table and returns (booking_id, profile_uuid).
    """
    # Generate unique profile UUID
    profile_uuid = str(uuid.uuid4())
    signature_blob = _to_signature_blob(booking.signature)

    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO ArtistBookings (
                artist_id, ticket_option_id, beverage_option_id, food_option_id,
                signature, total_price, is_paid, paid_amount, payment_notes, payment_date,
                invited_by_id, equipment, special_requests, performance_details, profile_uuid
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                artist_id,
                booking.ticket_id,
                booking.beverage_id,
                booking.food_id,
                sqlite3.Binary(signature_blob),
                booking.total_price,
                booking.is_paid,
                booking.paid_amount,
                booking.payment_notes,
                booking.payment_date,
                booking.invited_by_id,
                booking.equipment,
                booking.special_requests,
                booking.performance_details,
                profile_uuid,
            ),
        )
        conn.commit()
        booking_id = cursor.lastrowid
        if booking_id is None:
            raise RuntimeError("Failed to create artist booking record")
        return booking_id, profile_uuid


def _assign_artist_materials(booking_id: int, material_ids: list[int]) -> None:
    """
    Inserts the chosen artist materials into ArtistBookingMaterials.
    """
    if not material_ids:
        return
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        for material_id in material_ids:
            cursor.execute(
                """
                INSERT INTO ArtistBookingMaterials (booking_id, artist_material_id)
                VALUES (?, ?)
                """,
                (booking_id, material_id),
            )
        conn.commit()


def _assign_artist_professions(booking_id: int, profession_ids: list[int]) -> None:
    """
    Inserts the chosen professions into ArtistBookingProfessions.
    """
    if not profession_ids:
        return
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        for profession_id in profession_ids:
            cursor.execute(
                """
                INSERT INTO ArtistBookingProfessions (booking_id, profession_id)
                VALUES (?, ?)
                """,
                (booking_id, profession_id),
            )
        conn.commit()
