"""
Profile Service
==============

Business logic for profile page operations including:
- Profile data retrieval by UUID
- Work shift management (accept/decline)
- Profile recovery by email
"""

import sqlite3
import os
from contextlib import closing
from typing import Dict, List, Optional, Any
from datetime import datetime

from src.utils.logger import get_logger

logger = get_logger(__name__)

IN_DOCKER = os.environ.get('IN_DOCKER', 'False').lower() == 'true'

if IN_DOCKER:
    DB_FILE_PATH = '/app/user_data/bookings.db'
else:
    DB_DIR = os.path.join(os.path.dirname(__file__), '../../db')
    DB_FILE_PATH = os.path.join(DB_DIR, 'bookings.db')


def _connect_db() -> sqlite3.Connection:
    """Returns a new SQLite connection."""
    try:
        conn = sqlite3.connect(DB_FILE_PATH)
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        return conn
    except sqlite3.Error as e:
        logger.error(f"Failed to connect to database: {e}", exc_info=True)
        raise


def get_profile_by_uuid(profile_uuid: str) -> Optional[Dict[str, Any]]:
    """
    Get complete profile data by profile UUID.

    Returns:
        Dictionary containing:
        - user: User information
        - booking: Booking details with ticket, food, beverage info
        - materials: Selected materials
        - professions: Selected professions
        - shifts: Assigned work shifts with status
        - payment: Payment status information
    """
    try:
        logger.debug(f"Fetching profile data for UUID: {profile_uuid}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            # First, try to find booking in regular Bookings table
            cursor.execute("""
                SELECT
                    b.id as booking_id,
                    b.timestamp,
                    b.total_price,
                    b.is_paid,
                    b.paid_amount,
                    b.payment_notes,
                    b.payment_date,
                    b.amount_shifts,
                    b.supporter_buddy,
                    b.profile_uuid,
                    u.id as user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone_number,
                    t.id as ticket_id,
                    t.title as ticket_title,
                    t.price as ticket_price,
                    f.id as food_id,
                    f.title as food_title,
                    f.description as food_description,
                    f.price as food_price,
                    bv.id as beverage_id,
                    bv.title as beverage_title,
                    bv.description as beverage_description,
                    bv.price as beverage_price,
                    ts1.id as priority_1_timeslot_id,
                    ts1.title as priority_1_timeslot_title,
                    ts2.id as priority_2_timeslot_id,
                    ts2.title as priority_2_timeslot_title,
                    ts3.id as priority_3_timeslot_id,
                    ts3.title as priority_3_timeslot_title
                FROM Bookings b
                LEFT JOIN Users u ON b.user_id = u.id
                LEFT JOIN TicketOptions t ON b.ticket_option_id = t.id
                LEFT JOIN FoodOptions f ON b.food_option_id = f.id
                LEFT JOIN BeverageOptions bv ON b.beverage_option_id = bv.id
                LEFT JOIN TimeSlots ts1 ON b.first_priority_timeslot_id = ts1.id
                LEFT JOIN TimeSlots ts2 ON b.second_priority_timeslot_id = ts2.id
                LEFT JOIN TimeSlots ts3 ON b.third_priority_timeslot_id = ts3.id
                WHERE b.profile_uuid = ?
            """, (profile_uuid,))

            row = cursor.fetchone()

            if not row:
                # Try artist bookings
                cursor.execute("""
                    SELECT
                        ab.id as booking_id,
                        ab.timestamp,
                        ab.total_price,
                        ab.is_paid,
                        ab.paid_amount,
                        ab.payment_notes,
                        ab.payment_date,
                        ab.equipment,
                        ab.special_requests,
                        ab.performance_details,
                        ab.profile_uuid,
                        a.id as user_id,
                        a.first_name,
                        a.last_name,
                        a.email,
                        a.phone_number,
                        t.id as ticket_id,
                        t.title as ticket_title,
                        t.price as ticket_price,
                        f.id as food_id,
                        f.title as food_title,
                        f.description as food_description,
                        f.price as food_price,
                        bv.id as beverage_id,
                        bv.title as beverage_title,
                        bv.description as beverage_description,
                        bv.price as beverage_price
                    FROM ArtistBookings ab
                    LEFT JOIN Artists a ON ab.artist_id = a.id
                    LEFT JOIN TicketOptions t ON ab.ticket_option_id = t.id
                    LEFT JOIN FoodOptions f ON ab.food_option_id = f.id
                    LEFT JOIN BeverageOptions bv ON ab.beverage_option_id = bv.id
                    WHERE ab.profile_uuid = ?
                """, (profile_uuid,))

                row = cursor.fetchone()

                if not row:
                    logger.warning(f"No profile found for UUID: {profile_uuid}")
                    return None

                # Artist profile
                is_artist = True
            else:
                is_artist = False

            # Build user info
            user = {
                'id': row['user_id'],
                'first_name': row['first_name'],
                'last_name': row['last_name'],
                'email': row['email'],
                'phone_number': row['phone_number'],
                'is_artist': is_artist
            }

            # Build booking info
            booking = {
                'id': row['booking_id'],
                'timestamp': row['timestamp'],
                'total_price': row['total_price'],
                'profile_uuid': row['profile_uuid'],
                'ticket': {
                    'id': row['ticket_id'],
                    'title': row['ticket_title'],
                    'price': row['ticket_price']
                } if row['ticket_id'] else None,
                'food': {
                    'id': row['food_id'],
                    'title': row['food_title'],
                    'description': row['food_description'],
                    'price': row['food_price']
                } if row['food_id'] else None,
                'beverage': {
                    'id': row['beverage_id'],
                    'title': row['beverage_title'],
                    'description': row['beverage_description'],
                    'price': row['beverage_price']
                } if row['beverage_id'] else None
            }

            if is_artist:
                booking['equipment'] = row['equipment']
                booking['special_requests'] = row['special_requests']
                booking['performance_details'] = row['performance_details']
            else:
                booking['amount_shifts'] = row['amount_shifts']
                booking['supporter_buddy'] = row['supporter_buddy']
                booking['work_shift_priorities'] = []

                if row['priority_1_timeslot_id']:
                    booking['work_shift_priorities'].append({
                        'priority': 1,
                        'timeslot_id': row['priority_1_timeslot_id'],
                        'timeslot_title': row['priority_1_timeslot_title']
                    })
                if row['priority_2_timeslot_id']:
                    booking['work_shift_priorities'].append({
                        'priority': 2,
                        'timeslot_id': row['priority_2_timeslot_id'],
                        'timeslot_title': row['priority_2_timeslot_title']
                    })
                if row['priority_3_timeslot_id']:
                    booking['work_shift_priorities'].append({
                        'priority': 3,
                        'timeslot_id': row['priority_3_timeslot_id'],
                        'timeslot_title': row['priority_3_timeslot_title']
                    })

            # Payment info
            payment = {
                'is_paid': bool(row['is_paid']),
                'paid_amount': row['paid_amount'],
                'payment_notes': row['payment_notes'],
                'payment_date': row['payment_date']
            }

            # Get materials
            materials = []
            if is_artist:
                cursor.execute("""
                    SELECT am.id, am.title, am.num_needed
                    FROM ArtistBookingMaterials abm
                    JOIN ArtistMaterials am ON abm.artist_material_id = am.id
                    WHERE abm.booking_id = ?
                """, (row['booking_id'],))
            else:
                cursor.execute("""
                    SELECT m.id, m.title, m.num_needed
                    FROM BookingMaterials bm
                    JOIN Materials m ON bm.material_id = m.id
                    WHERE bm.booking_id = ?
                """, (row['booking_id'],))

            materials = [dict(m) for m in cursor.fetchall()]

            # Get professions
            if is_artist:
                cursor.execute("""
                    SELECT p.id, p.title
                    FROM ArtistBookingProfessions abp
                    JOIN Professions p ON abp.profession_id = p.id
                    WHERE abp.booking_id = ?
                """, (row['booking_id'],))
            else:
                cursor.execute("""
                    SELECT p.id, p.title
                    FROM BookingProfessions bp
                    JOIN Professions p ON bp.profession_id = p.id
                    WHERE bp.booking_id = ?
                """, (row['booking_id'],))

            professions = [dict(p) for p in cursor.fetchall()]

            # Get assigned shifts (only for regular users)
            shifts = []
            if not is_artist:
                shifts = get_assigned_shifts(row['booking_id'])

            logger.info(f"Successfully retrieved profile for UUID: {profile_uuid}")

            return {
                'user': user,
                'booking': booking,
                'materials': materials,
                'professions': professions,
                'shifts': shifts,
                'payment': payment
            }

    except sqlite3.Error as e:
        logger.error(f"Database error fetching profile {profile_uuid}: {e}", exc_info=True)
        raise


def get_assigned_shifts(booking_id: int) -> List[Dict[str, Any]]:
    """Get all assigned work shifts for a booking."""
    try:
        logger.debug(f"Fetching assigned shifts for booking {booking_id}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            cursor.execute("""
                SELECT
                    sa.id as assignment_id,
                    sa.status,
                    sa.is_confirmed,
                    sa.assignment_date,
                    sa.response_date,
                    sa.rejection_reason,
                    sa.alternative_preferences,
                    sa.admin_notes,
                    ts.id as timeslot_id,
                    ts.title as timeslot_title,
                    ts.start_time,
                    ts.end_time,
                    ts.num_needed,
                    ws.id as workshift_id,
                    ws.title as workshift_title,
                    ws.description as workshift_description
                FROM ShiftAssignments sa
                JOIN TimeSlots ts ON sa.timeslot_id = ts.id
                JOIN WorkShifts ws ON ts.workshift_id = ws.id
                WHERE sa.booking_id = ?
                ORDER BY ts.start_time
            """, (booking_id,))

            shifts = []
            for row in cursor.fetchall():
                shifts.append({
                    'assignment_id': row['assignment_id'],
                    'status': row['status'] or 'pending',
                    'is_confirmed': bool(row['is_confirmed']),
                    'assignment_date': row['assignment_date'],
                    'response_date': row['response_date'],
                    'rejection_reason': row['rejection_reason'],
                    'alternative_preferences': row['alternative_preferences'],
                    'admin_notes': row['admin_notes'],
                    'timeslot': {
                        'id': row['timeslot_id'],
                        'title': row['timeslot_title'],
                        'start_time': row['start_time'],
                        'end_time': row['end_time'],
                        'num_needed': row['num_needed']
                    },
                    'workshift': {
                        'id': row['workshift_id'],
                        'title': row['workshift_title'],
                        'description': row['workshift_description']
                    }
                })

            logger.debug(f"Found {len(shifts)} assigned shifts for booking {booking_id}")
            return shifts

    except sqlite3.Error as e:
        logger.error(f"Database error fetching shifts for booking {booking_id}: {e}", exc_info=True)
        raise


def accept_shift(profile_uuid: str, assignment_id: int) -> bool:
    """Mark a shift assignment as accepted."""
    try:
        logger.debug(f"Accepting shift assignment {assignment_id} for profile {profile_uuid}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            # Verify the assignment belongs to this profile
            cursor.execute("""
                SELECT sa.id
                FROM ShiftAssignments sa
                JOIN Bookings b ON sa.booking_id = b.id
                WHERE sa.id = ? AND b.profile_uuid = ?
            """, (assignment_id, profile_uuid))

            if not cursor.fetchone():
                logger.warning(f"Shift assignment {assignment_id} not found for profile {profile_uuid}")
                return False

            # Update status
            cursor.execute("""
                UPDATE ShiftAssignments
                SET status = 'accepted',
                    response_date = ?
                WHERE id = ?
            """, (datetime.now().isoformat(), assignment_id))

            conn.commit()

            logger.info(f"Shift assignment {assignment_id} accepted by profile {profile_uuid}")
            return True

    except sqlite3.Error as e:
        logger.error(f"Database error accepting shift {assignment_id}: {e}", exc_info=True)
        raise


def decline_shift(profile_uuid: str, assignment_id: int, rejection_reason: str = None,
                  alternative_preferences: str = None) -> bool:
    """Mark a shift assignment as declined with optional reason and alternatives."""
    try:
        logger.debug(f"Declining shift assignment {assignment_id} for profile {profile_uuid}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            # Verify the assignment belongs to this profile
            cursor.execute("""
                SELECT sa.id
                FROM ShiftAssignments sa
                JOIN Bookings b ON sa.booking_id = b.id
                WHERE sa.id = ? AND b.profile_uuid = ?
            """, (assignment_id, profile_uuid))

            if not cursor.fetchone():
                logger.warning(f"Shift assignment {assignment_id} not found for profile {profile_uuid}")
                return False

            # Update status
            cursor.execute("""
                UPDATE ShiftAssignments
                SET status = 'declined',
                    response_date = ?,
                    rejection_reason = ?,
                    alternative_preferences = ?
                WHERE id = ?
            """, (datetime.now().isoformat(), rejection_reason, alternative_preferences, assignment_id))

            conn.commit()

            logger.info(f"Shift assignment {assignment_id} declined by profile {profile_uuid}")
            return True

    except sqlite3.Error as e:
        logger.error(f"Database error declining shift {assignment_id}: {e}", exc_info=True)
        raise


def get_profile_uuids_by_email(email: str) -> List[Dict[str, str]]:
    """
    Get all profile UUIDs associated with an email address.
    Returns list of dicts with profile_uuid, name, and booking_type.
    """
    try:
        logger.debug(f"Searching for profiles with email: {email}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            profiles = []

            # Check regular bookings
            cursor.execute("""
                SELECT b.profile_uuid, u.first_name, u.last_name, b.timestamp
                FROM Bookings b
                JOIN Users u ON b.user_id = u.id
                WHERE u.email = ?
                ORDER BY b.timestamp DESC
            """, (email,))

            for row in cursor.fetchall():
                profiles.append({
                    'profile_uuid': row['profile_uuid'],
                    'name': f"{row['first_name']} {row['last_name']}",
                    'booking_type': 'regular',
                    'timestamp': row['timestamp']
                })

            # Check artist bookings
            cursor.execute("""
                SELECT ab.profile_uuid, a.first_name, a.last_name, ab.timestamp
                FROM ArtistBookings ab
                JOIN Artists a ON ab.artist_id = a.id
                WHERE a.email = ?
                ORDER BY ab.timestamp DESC
            """, (email,))

            for row in cursor.fetchall():
                profiles.append({
                    'profile_uuid': row['profile_uuid'],
                    'name': f"{row['first_name']} {row['last_name']}",
                    'booking_type': 'artist',
                    'timestamp': row['timestamp']
                })

            logger.info(f"Found {len(profiles)} profile(s) for email: {email}")
            return profiles

    except sqlite3.Error as e:
        logger.error(f"Database error searching profiles for email {email}: {e}", exc_info=True)
        raise
