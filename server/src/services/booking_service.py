import base64
import os
import sqlite3
import time

from contextlib import closing
from typing import List

from src.models.datatypes import Booking, BookingWithTimestamp
from src.services.formcontent_service import get_form_content_obj, update_form_content_with_db_counts
from src.models.schema import init_db
from src.utils.logger import get_logger

logger = get_logger(__name__)

IN_DOCKER = os.environ.get('IN_DOCKER', 'False').lower() == 'true'

if IN_DOCKER:
    # Docker paths
    DB_DIR='/app/user_data'
    DB_FILE_PATH = os.path.join(DB_DIR, 'bookings.db')
    DATA_DIR='/app/data'
    REGULAR_SCHEMA_PATH = os.path.join(DATA_DIR, 'schema.sql')

else:
    # Local development paths
    DB_DIR = os.path.join(os.path.dirname(__file__), '../../db')
    DB_FILE_PATH = os.path.join(DB_DIR, 'bookings.db')
    DATA_DIR=os.path.join(os.path.dirname(__file__), '../../data')
    REGULAR_SCHEMA_PATH = os.path.join(DATA_DIR, 'schema.sql')



# Ensure database is initialized on import

if not os.path.exists(DB_FILE_PATH):
    init_db(DB_FILE_PATH, [REGULAR_SCHEMA_PATH], get_form_content_obj())


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


def booking_exists(booking: Booking) -> bool:
    """
    Checks if a booking already exists with the same first name, last name, and email.
    """
    try:
        logger.debug(f"Checking for existing booking: {booking.first_name} {booking.last_name} ({booking.email})")
        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                           SELECT COUNT(*)
                           FROM Users u
                                    JOIN Bookings b ON u.id = b.user_id
                           WHERE u.first_name = ?
                             AND u.last_name = ?
                             AND u.email = ?
                           """, (booking.first_name, booking.last_name, booking.email))
            exists = cursor.fetchone()[0] > 0
            if exists:
                logger.debug(f"Existing booking found for {booking.first_name} {booking.last_name}")
            return exists
    except sqlite3.Error as e:
        logger.error(f"Database error checking booking existence: {e}", exc_info=True)
        return True


def create_user(booking: Booking) -> int:
    """Creates a user in the Users table and returns the user_id."""
    try:
        logger.debug(f"Creating user: {booking.first_name} {booking.last_name}")
        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                           INSERT INTO Users (last_name, first_name, email, phone_number)
                           VALUES (?, ?, ?, ?)
                           """, (booking.last_name, booking.first_name, booking.email, booking.phone))
            conn.commit()
            user_id = cursor.lastrowid
            logger.info(f"User created successfully with ID {user_id}: {booking.first_name} {booking.last_name}")
            return user_id
    except sqlite3.Error as e:
        logger.error(f"Database error creating user {booking.first_name} {booking.last_name}: {e}", exc_info=True)
        return -1


def create_booking(user_id: int, booking: Booking) -> int:
    """
    Creates a booking in the Bookings table and returns the booking_id.
    """
    try:
        logger.debug(f"Creating booking for user {user_id}")
        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                           INSERT INTO Bookings (user_id, ticket_option_id, beverage_option_id, food_option_id,
                                                 first_priority_timeslot_id, second_priority_timeslot_id,
                                                 third_priority_timeslot_id,
                                                 amount_shifts, supporter_buddy, signature, total_price, is_paid,
                                                 paid_amount, payment_notes, payment_date)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                           """, (
                               user_id,
                               booking.ticket_id,
                               booking.beverage_id,
                               booking.food_id,
                               booking.timeslot_priority_1,
                               booking.timeslot_priority_2,
                               booking.timeslot_priority_3,
                               booking.amount_shifts,
                               booking.supporter_buddy,
                               booking.signature,
                               booking.total_price,
                               booking.is_paid,
                               booking.paid_amount,
                               booking.payment_notes,
                               booking.payment_date
                           ))
            conn.commit()
            booking_id = cursor.lastrowid
            logger.info(f"Booking created successfully with ID {booking_id} for user {user_id}")
            return booking_id
    except sqlite3.Error as e:
        logger.error(f"Database error creating booking for user {user_id}: {e}", exc_info=True)
        return -1


def assign_materials(booking_id: int, material_ids: List[int]) -> None:
    """
    Inserts the chosen materials into BookingMaterials.
    """
    try:
        logger.info("Assigning materials.")
        if not material_ids:
            return
        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            for material_id in material_ids:
                cursor.execute("""
                               INSERT INTO BookingMaterials (booking_id, material_id)
                               VALUES (?, ?)
                               """, (booking_id, material_id))
            conn.commit()
        logger.info(f"Materials {material_ids} to booking_id assigned successfully to booking {booking_id}")
    except Exception as e:
        logger.error(f"Unexpected error assigning materials {material_ids} to booking_id {booking_id}: {str(e)}", exc_info=True)


def save_signature_image(booking: Booking) -> None:
    """
    Decodes the signature from base64 and saves it as an image.
    """
    try:
        logger.info(f"Saving signature image of booking {booking.first_name + ' ' + booking.last_name}")
        signature = booking.signature
        if ',' in signature:
            # Remove possible 'data:image/png;base64,' prefix
            signature = signature.split(',', 1)[1]

        signature_dir = os.path.join(DB_DIR, 'signatures')
        if not os.path.exists(signature_dir):
            os.makedirs(signature_dir)

        img_data = base64.b64decode(signature)
        file_path = os.path.join(
            signature_dir, f'{booking.last_name}_{booking.first_name}.png'
        )

        with open(file_path, 'wb') as file:
            file.write(img_data)
    except Exception as e:
        logger.error(f"Failed to save the signature image of booking {booking.first_name + ' ' + booking.last_name}: {str(e)}", exc_info=True)


def assign_professions(booking_id: int, profession_ids: List[int]) -> None:
    """
    Inserts the chosen professions into BookingProfessions.
    """
    try:
        if not profession_ids:
            return
        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            for profession_id in profession_ids:
                cursor.execute("""
                               INSERT INTO BookingProfessions (booking_id, profession_id)
                               VALUES (?, ?)
                               """, (booking_id, profession_id))
            conn.commit()
    except Exception as e:
        logger.error(f"Unexpected Error assingin profession ids: {profession_ids} to booking id {booking_id}: {e}", exc_info=True)


def insert_booking(booking: Booking) -> bool:
    """Inserts a booking with comprehensive logging."""
    start_time = time.time()

    try:
        logger.info(f"Starting booking insertion for {booking.first_name} {booking.last_name}")

        if booking_exists(booking):
            logger.warning(f"Duplicate booking attempt for {booking.first_name} {booking.last_name} ({booking.email})")
            return False

        user_id = create_user(booking)
        if user_id == -1:
            logger.error(f"Failed to create user for booking: {booking.first_name} {booking.last_name}")
            return False

        booking_id = create_booking(user_id, booking)
        if booking_id == -1:
            logger.error(f"Failed to create booking for user {user_id}")
            return False

        duration = time.time() - start_time
        logger.info(
            f"Booking insertion completed in {duration:.3f}s for {booking.first_name} {booking.last_name} (ID: {booking_id})")

        if duration > 1.0:
            logger.warning(f"Slow booking insertion: {duration:.3f}s for booking {booking_id}")

        return True

    except Exception as e:
        duration = time.time() - start_time
        logger.error(
            f"Booking insertion failed after {duration:.3f}s for {booking.first_name} {booking.last_name}: {str(e)}",
            exc_info=True)
        return False


def get_all_bookings() -> List[BookingWithTimestamp]:
    """
    Returns all bookings with user + booking info, including material_ids, as a list of BookingWithTimestamp.
    """
    start_time = time.time()

    try:
        logger.debug("Fetching all bookings from database")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            cursor.execute("""
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
                                  b.total_price,
                                  b.Timestamp,
                                  b.signature,
                                  b.is_paid,
                                  b.paid_amount,
                                  b.payment_notes,
                                  b.payment_date
                           FROM Users u
                                    JOIN Bookings b ON u.id = b.user_id
                           """)
            rows = cursor.fetchall()

            bookings: List[BookingWithTimestamp] = []
            for row in rows:
                booking_id = row[0]
                cursor.execute("""
                               SELECT material_id
                               FROM BookingMaterials
                               WHERE booking_id = ?
                               """, (booking_id,))
                material_ids = [item[0] for item in cursor.fetchall()]

                cursor.execute("""
                               SELECT profession_id
                               FROM BookingProfessions
                               WHERE booking_id = ?
                               """, (booking_id,))
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
                    total_price=row[13],
                    timestamp=row[14],
                    signature=row[15] or "",
                    is_paid=True if row[16] == 1 else False,
                    paid_amount= row[17],
                    payment_notes=row[18],
                    payment_date=row[19],
                    profession_ids=profession_ids,
                    material_ids=material_ids
                )
                bookings.append(booking)
            duration = time.time() - start_time
            logger.info(f"Retrieved {len(bookings)} bookings in {duration:.3f}s")

            if duration > 2.0:
                logger.warning(f"Slow booking retrieval: {duration:.3f}s for {len(bookings)} bookings")

            return bookings
    except sqlite3.Error as e:
        duration = time.time() - start_time
        logger.error(f"Database error retrieving bookings after {duration:.3f}s: {e}", exc_info=True)
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

        duration = time.time() - start_time
        logger.debug(f"Form content generated in {duration:.3f}s")

        if duration > 0.5:
            logger.warning(f"Slow form content generation: {duration:.3f}s")

        return result
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Failed to generate form content after {duration:.3f}s: {str(e)}", exc_info=True)
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
                cursor.execute("""
                               UPDATE Users
                               SET first_name   = ?,
                                   last_name    = ?,
                                   email        = ?,
                                   phone_number = ?
                               WHERE id = ?
                               """, (
                                   booking_data['first_name'],
                                   booking_data['last_name'],
                                   booking_data['email'],
                                   booking_data['phone'],
                                   user_id
                               ))

                # Update Booking information
                cursor.execute("""
                               UPDATE Bookings
                               SET ticket_option_id            = ?,
                                   beverage_option_id          = ?,
                                   food_option_id              = ?,
                                   first_priority_timeslot_id  = ?,
                                   second_priority_timeslot_id = ?,
                                   third_priority_timeslot_id  = ?,
                                   amount_shifts               = ?,
                                   supporter_buddy             = ?,
                                   total_price                 = ?
                               WHERE id = ?
                               """, (
                                   booking_data['ticket_id'],
                                   booking_data['beverage_id'],
                                   booking_data['food_id'],
                                   booking_data['timeslot_priority_1'],
                                   booking_data['timeslot_priority_2'],
                                   booking_data['timeslot_priority_3'],
                                   booking_data['amount_shifts'],
                                   booking_data['supporter_buddy'],
                                   booking_data['total_price'],
                                   booking_id
                               ))

                # Handle materials if they were updated
                if 'material_ids' in booking_data:
                    # Delete existing materials first
                    cursor.execute("DELETE FROM BookingMaterials WHERE booking_id = ?", (booking_id,))

                    # Insert new material selections
                    for material_id in booking_data['material_ids']:
                        cursor.execute(
                            "INSERT INTO BookingMaterials (booking_id, material_id) VALUES (?, ?)",
                            (booking_id, material_id)
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
                cursor.execute("""
                               UPDATE Bookings
                               SET is_paid       = ?,
                                   paid_amount   = ?,
                                   payment_notes = ?,
                                   payment_date  = ?
                               WHERE id = ?
                               """, (
                                   payment_data['is_paid'],
                                   payment_data['paid_amount'],
                                   payment_data.get('payment_notes', ''),
                                   payment_data.get('payment_date'),
                                   booking_id
                               ))

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
