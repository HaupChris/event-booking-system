import base64
import os
import sqlite3
from contextlib import closing
from typing import List, Optional

from src.models.datatypes import ArtistBooking, ArtistBookingWithTimestamp
from src.services.booking_service import DB_FILE_PATH, DB_DIR
from src.services.formcontent_service import get_artist_form_content_obj, update_artist_form_content_with_db_counts


def get_all_artist_bookings() -> List[ArtistBookingWithTimestamp]:
    """
    Returns all artist bookings with artist + booking info, including material_ids.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
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
                   b.equipment,
                   b.special_requests,
                   b.performance_details
            FROM Artists a
            JOIN ArtistBookings b ON a.id = b.artist_id
            """)
        rows = cursor.fetchall()

        bookings: List[ArtistBookingWithTimestamp] = []
        for row in rows:
            booking_id = row[0]
            cursor.execute("""
                SELECT artist_material_id
                FROM ArtistBookingMaterials
                WHERE booking_id = ?
                """, (booking_id,))
            material_ids = [item[0] for item in cursor.fetchall()]

            cursor.execute("""
                           SELECT profession_id
                           FROM ArtistBookingProfessions
                           WHERE booking_id = ?
                           """, (booking_id,))
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
                signature=row[10] or "",
                is_paid=True if row[11] == 1 else False,
                paid_amount=row[12],
                payment_notes=row[13],
                payment_date=row[14],
                equipment=row[15],
                special_requests=row[16],
                performance_details=row[17],
                artist_material_ids=material_ids,
                profession_ids=profession_ids
            )
            bookings.append(booking)
        return bookings


def get_artist_booking_by_id(booking_id: int) -> Optional[ArtistBookingWithTimestamp]:
    """Returns a specific artist booking by ID."""
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
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
                              b.equipment,
                              b.special_requests,
                              b.performance_details
                       FROM Artists a
                                JOIN ArtistBookings b ON a.id = b.artist_id
                       WHERE b.id = ?
                       """, (booking_id,))
        row = cursor.fetchone()

        if not row:
            return None

        cursor.execute("""
                       SELECT artist_material_id
                       FROM ArtistBookingMaterials
                       WHERE booking_id = ?
                       """, (booking_id,))
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
            signature=row[10] or "",
            is_paid=True if row[11] == 1 else False,
            paid_amount=row[12],
            payment_notes=row[13],
            payment_date=row[14],
            equipment=row[15],
            special_requests=row[16],
            performance_details=row[17],
            artist_material_ids=material_ids
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
            cursor.execute("""
                           UPDATE Artists
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
                               artist_id
                           ))

            # Update ArtistBooking information
            cursor.execute("""
                           UPDATE ArtistBookings
                           SET ticket_option_id    = ?,
                               beverage_option_id  = ?,
                               food_option_id      = ?,
                               total_price         = ?,
                               equipment           = ?,
                               special_requests    = ?,
                               performance_details = ?,
                               is_paid             = ?,
                               paid_amount         = ?,
                               payment_notes       = ?,
                               payment_date        = ?
                           WHERE id = ?
                           """, (
                               booking_data['ticket_id'],
                               booking_data['beverage_id'],
                               booking_data['food_id'],
                               booking_data['total_price'],
                               booking_data.get('equipment', ''),
                               booking_data.get('special_requests', ''),
                               booking_data.get('performance_details', ''),
                               1 if booking_data.get('is_paid', False) else 0,
                               booking_data.get('paid_amount', 0),
                               booking_data.get('payment_notes', ''),
                               booking_data.get('payment_date', ''),
                               booking_id
                           ))

            # Handle materials if they were updated
            if 'artist_material_ids' in booking_data:
                # Delete existing materials first
                cursor.execute("DELETE FROM ArtistBookingMaterials WHERE booking_id = ?", (booking_id,))

                # Insert new material selections
                for material_id in booking_data['artist_material_ids']:
                    cursor.execute(
                        "INSERT INTO ArtistBookingMaterials (booking_id, artist_material_id) VALUES (?, ?)",
                        (booking_id, material_id)
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
            cursor.execute("""
                           UPDATE ArtistBookings
                           SET is_paid       = ?,
                               paid_amount   = ?,
                               payment_notes = ?,
                               payment_date  = ?
                           WHERE id = ?
                           """, (
                               1 if payment_data['is_paid'] else 0,
                               payment_data['paid_amount'],
                               payment_data.get('payment_notes', ''),
                               payment_data.get('payment_date'),
                               booking_id
                           ))

            conn.commit()
            return True

        except Exception as e:
            print(f"Error updating artist payment: {e}")
            return False


def insert_artist_booking(booking: ArtistBooking) -> bool:
    """
    Inserts an artist booking if it does not already exist. Returns True if inserted, False if duplicate.
    """
    if _artist_booking_exists(booking):
        return False

    artist_id = _create_artist(booking)
    booking_id = _create_artist_booking(artist_id, booking)
    _assign_artist_materials(booking_id, booking.artist_material_ids)
    _assign_artist_professions(booking_id, booking.profession_ids)  # Add this line
    # Save signature as a file
    _save_artist_signature_image(booking)
    return True


def get_up_to_date_artist_form_content() -> dict:
    """
    Returns the current form content (dict) with booking counts updated based on the DB state.
    """
    form_content_obj = get_artist_form_content_obj()
    return update_artist_form_content_with_db_counts(form_content_obj, _connect_db)




################## helper methods

def _connect_db() -> sqlite3.Connection:
    """
    Returns a new SQLite connection.
    """
    return sqlite3.connect(DB_FILE_PATH)

def _artist_booking_exists(booking: ArtistBooking) -> bool:
    """
    Checks if an artist booking already exists with the same name and email.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*)
            FROM Artists a 
            JOIN ArtistBookings b ON a.id = b.artist_id
            WHERE a.first_name = ? 
            AND a.last_name = ? 
            AND a.email = ?
            """, (booking.first_name, booking.last_name, booking.email))
        return cursor.fetchone()[0] > 0


def _create_artist(booking: ArtistBooking) -> int:
    """
    Creates an artist in the Artists table and returns the artist_id.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Artists (last_name, first_name, email, phone_number)
            VALUES (?, ?, ?, ?)
            """, (booking.last_name, booking.first_name, booking.email, booking.phone))
        conn.commit()
        return cursor.lastrowid


def _create_artist_booking(artist_id: int, booking: ArtistBooking) -> int:
    """
    Creates an artist booking in the ArtistBookings table and returns the booking_id.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO ArtistBookings (
                artist_id, ticket_option_id, beverage_option_id, food_option_id,
                signature, total_price, is_paid, paid_amount, payment_notes, payment_date,
                equipment, special_requests, performance_details
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                artist_id, booking.ticket_id, booking.beverage_id, booking.food_id,
                booking.signature, booking.total_price, booking.is_paid,
                booking.paid_amount, booking.payment_notes, booking.payment_date,
                booking.equipment, booking.special_requests, booking.performance_details
            ))
        conn.commit()
        return cursor.lastrowid


def _assign_artist_materials(booking_id: int, material_ids: List[int]) -> None:
    """
    Inserts the chosen artist materials into ArtistBookingMaterials.
    """
    if not material_ids:
        return
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        for material_id in material_ids:
            cursor.execute("""
                INSERT INTO ArtistBookingMaterials (booking_id, artist_material_id)
                VALUES (?, ?)
                """, (booking_id, material_id))
        conn.commit()


def _assign_artist_professions(booking_id: int, profession_ids: List[int]) -> None:
    """
    Inserts the chosen professions into ArtistBookingProfessions.
    """
    if not profession_ids:
        return
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        for profession_id in profession_ids:
            cursor.execute("""
                INSERT INTO ArtistBookingProfessions (booking_id, profession_id)
                VALUES (?, ?)
                """, (booking_id, profession_id))
        conn.commit()

def _save_artist_signature_image(booking: ArtistBooking) -> None:
    """
    Decodes the signature from base64 and saves it as an image.
    """
    signature = booking.signature
    if ',' in signature:
        # Remove possible 'data:image/png;base64,' prefix
        signature = signature.split(',', 1)[1]

    signature_dir = os.path.join(DB_DIR, 'artist_signatures')
    if not os.path.exists(signature_dir):
        os.makedirs(signature_dir)

    img_data = base64.b64decode(signature)
    file_path = os.path.join(
        signature_dir, f'artist_{booking.last_name}_{booking.first_name}.png'
    )

    with open(file_path, 'wb') as file:
        file.write(img_data)






