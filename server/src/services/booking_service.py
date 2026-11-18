import sqlite3
import time
import uuid
from contextlib import closing

from src.models.datatypes import Booking, BookingWithTimestamp
from src.models.schema import init_db
from src.services.app_settings_service import get_form_step_descriptions, get_payment_link
from src.services.formcontent_service import (
    get_form_content_obj,
    update_form_content_with_db_counts,
)
from src.services.option_service import ensure_option_schema
from src.services.orga_team_service import get_active_orga_team_members
from src.services.workshift_service import ensure_workshift_schema
from src.utils.logger import get_logger
from src.utils.paths import get_data_dir, get_db_file_path
from src.utils.signature import (
    MAX_SIGNATURE_BYTES,
    decode_signature_to_blob,
    migrate_signatures_to_blob,
)

logger = get_logger(__name__)

DB_FILE_PATH = get_db_file_path()
REGULAR_SCHEMA_PATH = str(get_data_dir() / "schema.sql")


def _connect_db() -> sqlite3.Connection:
    """
    Returns a new SQLite connection.
    """
    try:
        logger.debug("Establishing database connection")
        conn = sqlite3.connect(DB_FILE_PATH)
        return conn
    except sqlite3.Error as e:
        logger.error(f"Failed to connect to database: {e}", exc_info=True)
        raise


def _table_has_column(cursor: sqlite3.Cursor, table_name: str, column_name: str) -> bool:
    cursor.execute(f"PRAGMA table_info({table_name})")
    return any(row[1] == column_name for row in cursor.fetchall())


def ensure_profile_uuid_schema(conn: sqlite3.Connection) -> None:
    """
    Ensure profile UUID columns exist for booking tables and backfill missing values.

    This keeps fresh and legacy databases compatible with profile-link features.
    """
    cursor = conn.cursor()

    for table_name in ("Bookings", "ArtistBookings"):
        if not _table_has_column(cursor, table_name, "profile_uuid"):
            logger.warning(f"Adding missing profile_uuid column to {table_name}")
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN profile_uuid TEXT")

        cursor.execute(
            f"SELECT id FROM {table_name} WHERE profile_uuid IS NULL OR profile_uuid = ''"  # noqa: S608  # lint-baseline
        )
        missing_ids = [row[0] for row in cursor.fetchall()]

        for row_id in missing_ids:
            cursor.execute(
                f"UPDATE {table_name} SET profile_uuid = ? WHERE id = ?",  # noqa: S608  # lint-baseline
                (str(uuid.uuid4()), row_id),
            )

        index_name = f"idx_{table_name.lower()}_profile_uuid"
        cursor.execute(
            f"""
            CREATE UNIQUE INDEX IF NOT EXISTS {index_name}
            ON {table_name}(profile_uuid)
            WHERE profile_uuid IS NOT NULL AND profile_uuid != ''
            """
        )

    conn.commit()


# Ensure database is initialized on import
init_db(DB_FILE_PATH, [REGULAR_SCHEMA_PATH], get_form_content_obj())
ensure_option_schema()
ensure_workshift_schema()
with closing(_connect_db()) as _init_conn:
    ensure_profile_uuid_schema(_init_conn)
    migrate_signatures_to_blob(_init_conn)


def _to_signature_blob(signature: str | bytes) -> bytes:
    if isinstance(signature, bytes):
        if not signature:
            raise ValueError("Signature is required")
        if len(signature) > MAX_SIGNATURE_BYTES:
            raise ValueError("Signature is too large")
        return signature
    return decode_signature_to_blob(signature)


def _booking_exists(cursor: sqlite3.Cursor, booking: Booking) -> bool:
    """A booking with the same first name, last name and email already exists."""
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM Users u
                 JOIN Bookings b ON u.id = b.user_id
        WHERE u.first_name = ?
          AND u.last_name = ?
          AND u.email = ?
        """,
        (booking.first_name, booking.last_name, booking.email),
    )
    return cursor.fetchone()[0] > 0


def _insert_user(cursor: sqlite3.Cursor, booking: Booking) -> int:
    cursor.execute(
        "INSERT INTO Users (last_name, first_name, email, phone_number) VALUES (?, ?, ?, ?)",
        (booking.last_name, booking.first_name, booking.email, booking.phone),
    )
    return int(cursor.lastrowid or -1)


def _insert_booking_row(
    cursor: sqlite3.Cursor, user_id: int, booking: Booking, profile_uuid: str
) -> int:
    cursor.execute(
        """
        INSERT INTO Bookings (user_id, ticket_option_id, beverage_option_id, food_option_id,
                              first_priority_timeslot_id, second_priority_timeslot_id,
                              third_priority_timeslot_id,
                              amount_shifts, supporter_buddy, invited_by_id,
                              signature, total_price, is_paid,
                              paid_amount, payment_notes, payment_date, profile_uuid)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            booking.ticket_id,
            booking.beverage_id,
            booking.food_id,
            booking.timeslot_priority_1,
            booking.timeslot_priority_2,
            booking.timeslot_priority_3,
            booking.amount_shifts,
            booking.supporter_buddy,
            booking.invited_by_id,
            sqlite3.Binary(_to_signature_blob(booking.signature)),
            booking.total_price,
            booking.is_paid,
            booking.paid_amount,
            booking.payment_notes,
            booking.payment_date,
            profile_uuid,
        ),
    )
    return int(cursor.lastrowid or -1)


def _insert_materials(cursor: sqlite3.Cursor, booking_id: int, material_ids: list[int]) -> None:
    cursor.executemany(
        "INSERT INTO BookingMaterials (booking_id, material_id) VALUES (?, ?)",
        [(booking_id, material_id) for material_id in material_ids],
    )


def _insert_professions(cursor: sqlite3.Cursor, booking_id: int, profession_ids: list[int]) -> None:
    cursor.executemany(
        "INSERT INTO BookingProfessions (booking_id, profession_id) VALUES (?, ?)",
        [(booking_id, profession_id) for profession_id in profession_ids],
    )


def insert_booking(booking: Booking) -> tuple[bool, str | None]:
    """
    Store user, booking, materials and professions in one transaction.

    Returns (True, profile_uuid) on success and (False, None) for a duplicate booking.
    Database errors are raised after a rollback, so nothing is stored partially.
    """
    profile_uuid = str(uuid.uuid4())

    with closing(_connect_db()) as conn:
        # IMMEDIATE takes the write lock up front, so concurrent duplicates are serialized.
        conn.execute("BEGIN IMMEDIATE")
        try:
            cursor = conn.cursor()
            if _booking_exists(cursor, booking):
                conn.rollback()
                logger.warning(
                    f"Duplicate booking attempt for {booking.first_name} {booking.last_name} ({booking.email})"
                )
                return False, None

            user_id = _insert_user(cursor, booking)
            booking_id = _insert_booking_row(cursor, user_id, booking, profile_uuid)
            _insert_materials(cursor, booking_id, booking.material_ids)
            _insert_professions(cursor, booking_id, booking.profession_ids)
            conn.commit()
        except Exception:
            conn.rollback()
            logger.error(
                f"Booking insertion rolled back for {booking.first_name} {booking.last_name}",
                exc_info=True,
            )
            raise

    logger.info(f"Booking {booking_id} created (UUID: {profile_uuid[:8]}...) for user {user_id}")
    return True, profile_uuid


def get_all_bookings() -> list[BookingWithTimestamp]:
    """
    Returns all bookings with user + booking info, including material_ids, as a list of BookingWithTimestamp.
    """
    start_time = time.time()

    try:
        logger.debug("Fetching all bookings from database")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                            SELECT b.id as booking_id,
                                   u.last_name,
                                   u.first_name,
                                   u.email,
                                   u.phone_number,
                                   b.ticket_option_id,
                                   b.beverage_option_id,
                                   b.food_option_id,
                                   b.first_priority_timeslot_id,
                                   b.second_priority_timeslot_id,
                                   b.third_priority_timeslot_id,
                                   b.amount_shifts,
                                    b.supporter_buddy,
                                    b.invited_by_id,
                                    ot.name as invited_by_name,
                                    b.total_price,
                                    b.Timestamp,
                                   b.signature,
                                   b.is_paid,
                                   b.paid_amount,
                                   b.payment_notes,
                                    b.payment_date,
                                    b.profile_uuid,
                                    COALESCE(t.requires_workshift, 1) as requires_workshift
                             FROM Users u
                                      JOIN Bookings b ON u.id = b.user_id
                                      LEFT JOIN TicketOptions t ON b.ticket_option_id = t.id
                                      LEFT JOIN OrgaTeamInviters ot ON b.invited_by_id = ot.id
                             """
            )
            rows = cursor.fetchall()

            bookings: list[BookingWithTimestamp] = []
            for row in rows:
                booking_id = row[0]
                cursor.execute(
                    """
                               SELECT material_id
                               FROM BookingMaterials
                               WHERE booking_id = ?
                               """,
                    (booking_id,),
                )
                material_ids = [item[0] for item in cursor.fetchall()]

                cursor.execute(
                    """
                               SELECT profession_id
                               FROM BookingProfessions
                               WHERE booking_id = ?
                               """,
                    (booking_id,),
                )
                profession_ids = [item[0] for item in cursor.fetchall()]

                booking = BookingWithTimestamp(
                    id=booking_id,
                    last_name=row[1],
                    first_name=row[2],
                    email=row[3],
                    phone=row[4],
                    ticket_id=row[5],
                    beverage_id=row[6],
                    food_id=row[7],
                    timeslot_priority_1=row[8],
                    timeslot_priority_2=row[9],
                    timeslot_priority_3=row[10],
                    amount_shifts=row[11],
                    supporter_buddy=row[12],
                    invited_by_id=row[13] if row[13] is not None else -1,
                    invited_by_name=row[14] or "",
                    total_price=row[15],
                    timestamp=row[16],
                    signature="",
                    is_paid=True if row[18] == 1 else False,  # noqa: SIM210  # lint-baseline
                    paid_amount=row[19],
                    payment_notes=row[20],
                    payment_date=row[21],
                    profession_ids=profession_ids,
                    material_ids=material_ids,
                    profile_uuid=row[22],
                    requires_workshift=bool(row[23]),
                )
                bookings.append(booking)
            duration = time.time() - start_time
            logger.info(f"Retrieved {len(bookings)} bookings in {duration:.3f}s")

            if duration > 2.0:
                logger.warning(
                    f"Slow booking retrieval: {duration:.3f}s for {len(bookings)} bookings"
                )

            return bookings
    except sqlite3.Error as e:
        duration = time.time() - start_time
        logger.error(
            f"Database error retrieving bookings after {duration:.3f}s: {e}", exc_info=True
        )
        return []


def check_email_exists(email: str) -> bool:
    """
    Returns True if there's already a user with the specified email.
    """
    try:
        logger.debug(f"Checking if email exists: {email}")
        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Users WHERE email=?", (email,))
            return cursor.fetchone() is not None

    except sqlite3.Error as e:
        logger.error(f"Database error checking email existence: {e}", exc_info=True)
        return True


def get_up_to_date_form_content() -> dict:
    """Returns form content with updated booking counts and logging."""
    start_time = time.time()
    try:
        logger.debug("Generating up-to-date form content")
        form_content_obj = get_form_content_obj()
        result = update_form_content_with_db_counts(form_content_obj, _connect_db)
        result["payment_link"] = get_payment_link()
        result["orga_inviters"] = get_active_orga_team_members()
        result["step_descriptions"] = get_form_step_descriptions("regular")

        duration = time.time() - start_time
        logger.debug(f"Form content generated in {duration:.3f}s")

        if duration > 0.5:
            logger.warning(f"Slow form content generation: {duration:.3f}s")

        return result
    except Exception as e:
        duration = time.time() - start_time
        logger.error(
            f"Failed to generate form content after {duration:.3f}s: {str(e)}", exc_info=True
        )
        return {}


def update_booking_db(booking_id: int, booking_data: dict) -> bool:
    """
    Updates an existing booking in the database.
    Returns True if successful, False otherwise.
    """
    try:
        logger.info(f"Updating booking {booking_id}")
        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            # First get the user_id associated with this booking
            cursor.execute("SELECT user_id FROM Bookings WHERE id = ?", (booking_id,))
            result = cursor.fetchone()
            if not result:
                return False

            user_id = result[0]

            # Start a transaction
            conn.execute("BEGIN TRANSACTION")
            try:
                # Update User information
                cursor.execute(
                    """
                               UPDATE Users
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
                        user_id,
                    ),
                )

                # Update Booking information
                cursor.execute(
                    """
                               UPDATE Bookings
                               SET ticket_option_id            = ?,
                                   beverage_option_id          = ?,
                                   food_option_id              = ?,
                                   first_priority_timeslot_id  = ?,
                                   second_priority_timeslot_id = ?,
                                    third_priority_timeslot_id  = ?,
                                    amount_shifts               = ?,
                                    supporter_buddy             = ?,
                                    invited_by_id               = ?,
                                    total_price                 = ?
                                WHERE id = ?
                                """,
                    (
                        booking_data["ticket_id"],
                        booking_data["beverage_id"],
                        booking_data["food_id"],
                        booking_data["timeslot_priority_1"],
                        booking_data["timeslot_priority_2"],
                        booking_data["timeslot_priority_3"],
                        booking_data["amount_shifts"],
                        booking_data["supporter_buddy"],
                        booking_data.get("invited_by_id"),
                        booking_data["total_price"],
                        booking_id,
                    ),
                )

                # Handle materials if they were updated
                if "material_ids" in booking_data:
                    # Delete existing materials first
                    cursor.execute(
                        "DELETE FROM BookingMaterials WHERE booking_id = ?", (booking_id,)
                    )

                    # Insert new material selections
                    for material_id in booking_data["material_ids"]:
                        cursor.execute(
                            "INSERT INTO BookingMaterials (booking_id, material_id) VALUES (?, ?)",
                            (booking_id, material_id),
                        )

                # Commit transaction
                conn.commit()
                logger.info(f"Booking {booking_id} updated successfully")
                return True

            except Exception as e:
                # Rollback in case of error
                conn.rollback()
                print(f"Error updating booking: {e}")
                return False
    except sqlite3.Error as e:
        logger.error(f"Database error updating booking {booking_id}: {e}", exc_info=True)
        return False
    except Exception as e:
        logger.error(f"Unexpected error updating booking {booking_id}: {str(e)}", exc_info=True)
        return False


def update_booking_payment(booking_id: int, payment_data: dict) -> bool:
    """
    Updates the payment status of a booking.
    Returns True if successful, False otherwise.
    """
    try:
        logger.info(f"Updating payment status for booking {booking_id}")
        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            # Check if booking exists
            cursor.execute("SELECT id FROM Bookings WHERE id = ?", (booking_id,))
            if not cursor.fetchone():
                return False

            try:
                # Update payment information
                cursor.execute(
                    """
                               UPDATE Bookings
                               SET is_paid       = ?,
                                   paid_amount   = ?,
                                   payment_notes = ?,
                                   payment_date  = ?
                               WHERE id = ?
                               """,
                    (
                        payment_data["is_paid"],
                        payment_data["paid_amount"],
                        payment_data.get("payment_notes", ""),
                        payment_data.get("payment_date"),
                        booking_id,
                    ),
                )

                conn.commit()
                logger.info(f"Payment status updated for booking {booking_id}")
                return True
            except Exception as e:
                print(f"Error updating payment: {e}")
                return False
    except Exception as e:
        logger.error(f"Failed to update payment for booking {booking_id}: {str(e)}", exc_info=True)
        return False


def delete_booking(booking_id: int) -> bool:
    """
    Deletes a booking and all related data.
    Returns True if successful, False otherwise.
    """
    try:
        logger.warning(f"Deleting booking {booking_id}")
        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            try:
                # Start a transaction
                conn.execute("BEGIN TRANSACTION")

                # Delete related records first
                cursor.execute("DELETE FROM BookingMaterials WHERE booking_id = ?", (booking_id,))
                cursor.execute("DELETE FROM BookingProfessions WHERE booking_id = ?", (booking_id,))
                cursor.execute("DELETE FROM ShiftAssignments WHERE booking_id = ?", (booking_id,))

                # Get user_id to delete if this is the only booking for this user
                cursor.execute("SELECT user_id FROM Bookings WHERE id = ?", (booking_id,))
                result = cursor.fetchone()

                if not result:
                    # Booking not found
                    conn.rollback()
                    return False

                user_id = result[0]

                # Delete the booking
                cursor.execute("DELETE FROM Bookings WHERE id = ?", (booking_id,))

                # Check if user has other bookings, if not, delete the user
                cursor.execute("SELECT COUNT(*) FROM Bookings WHERE user_id = ?", (user_id,))
                if cursor.fetchone()[0] == 0:
                    cursor.execute("DELETE FROM Users WHERE id = ?", (user_id,))

                # Commit transaction
                conn.commit()
                logger.warning(f"Booking {booking_id} deleted successfully")
                return True

            except Exception as e:
                # Rollback in case of error
                conn.rollback()
                print(f"Error deleting booking: {e}")
                return False
    except Exception as e:
        logger.error(f"Failed to delete booking {booking_id}: {str(e)}", exc_info=True)
        return False
