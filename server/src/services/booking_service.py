import base64
import os
import sqlite3
from contextlib import closing
from datetime import datetime
from typing import List

from src.models.datatypes import Booking, BookingWithTimestamp
from src.services.formcontent_service import get_form_content_obj, update_form_content_with_db_counts
from src.models.schema import init_db

DB_DIR = os.path.join(os.path.dirname(__file__), '../../db')
DB_FILE_PATH = os.path.join(DB_DIR, 'bookings.db')
SCHEMA_PATH = os.path.join(DB_DIR, 'schema.sql')

# Ensure database is initialized on import
if not os.path.exists(DB_FILE_PATH):
    init_db(DB_FILE_PATH, SCHEMA_PATH)
else:
    # Even if it exists, optionally re-apply schema if you want. Usually you'd skip reinit in production.
    init_db(DB_FILE_PATH, SCHEMA_PATH)


def _connect_db() -> sqlite3.Connection:
    """
    Returns a new SQLite connection.
    """
    return sqlite3.connect(DB_FILE_PATH)


def booking_exists(booking: Booking) -> bool:
    """
    Checks if a booking already exists with the same first name, last name, and email.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) FROM Users u
            JOIN Bookings b ON u.id = b.user_id
            WHERE u.first_name = ? AND u.last_name = ? AND u.email = ?
        """, (booking.first_name, booking.last_name, booking.email))
        return cursor.fetchone()[0] > 0


def create_user(booking: Booking) -> int:
    """
    Creates a user in the Users table and returns the user_id.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Users (last_name, first_name, email, phone_number) 
            VALUES (?, ?, ?, ?)
        """, (booking.last_name, booking.first_name, booking.email, booking.phone))
        conn.commit()
        return cursor.lastrowid


def create_booking(user_id: int, booking: Booking) -> int:
    """
    Creates a booking in the Bookings table and returns the booking_id.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Bookings (
                user_id, ticket_option_id, beverage_option_id, food_option_id,
                first_priority_timeslot_id, second_priority_timeslot_id, third_priority_timeslot_id,
                amount_shifts, supporter_buddy, signature, total_price
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            booking.total_price
        ))
        conn.commit()
        return cursor.lastrowid


def assign_materials(booking_id: int, material_ids: List[int]) -> None:
    """
    Inserts the chosen materials into BookingMaterials.
    """
    if not material_ids:
        return
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        for material_id in material_ids:
            cursor.execute("""
                INSERT INTO BookingMaterials (booking_id, material_id) VALUES (?, ?)
            """, (booking_id, material_id))
        conn.commit()


def save_signature_image(booking: Booking) -> None:
    """
    Decodes the signature from base64 and saves it as an image.
    """
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


def insert_booking(booking: Booking) -> bool:
    """
    Inserts a booking if it does not already exist. Returns True if inserted, False if duplicate.
    """
    if booking_exists(booking):
        return False

    user_id = create_user(booking)
    booking_id = create_booking(user_id, booking)
    assign_materials(booking_id, booking.material_ids)

    # Save signature as a file
    save_signature_image(booking)
    return True


def get_all_bookings() -> List[BookingWithTimestamp]:
    """
    Returns all bookings with user + booking info, including material_ids, as a list of BookingWithTimestamp.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                b.id as booking_id,
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
                b.signature
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

            booking = BookingWithTimestamp(
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
                material_ids=material_ids
            )
            bookings.append(booking)
        return bookings


def check_email_exists(email: str) -> bool:
    """
    Returns True if there's already a user with the specified email.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Users WHERE email=?", (email,))
        return cursor.fetchone() is not None


def get_up_to_date_form_content() -> dict:
    """
    Returns the current form content (dict) with booking counts updated based on the DB state.
    """
    form_content_obj = get_form_content_obj()
    return update_form_content_with_db_counts(form_content_obj, _connect_db)
