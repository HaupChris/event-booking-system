import sqlite3
from contextlib import closing
from typing import List, Dict
from src.models.datatypes import ShiftAssignment, ShiftAssignmentWithDetails
from src.services.booking_service import _connect_db


def get_all_shift_assignments() -> List[ShiftAssignmentWithDetails]:
    """
    Returns all shift assignments with detailed information.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
                       SELECT sa.id,
                              sa.booking_id,
                              sa.timeslot_id,
                              sa.is_confirmed,
                              sa.admin_notes,
                              sa.assignment_date,
                              u.first_name,
                              u.last_name,
                              u.email,
                              u.phone_number,
                              ws.title as workshift_title,
                              ts.title as timeslot_title,
                              ts.start_time,
                              ts.end_time,
                              CASE
                                  WHEN b.first_priority_timeslot_id = sa.timeslot_id THEN 1
                                  WHEN b.second_priority_timeslot_id = sa.timeslot_id THEN 2
                                  WHEN b.third_priority_timeslot_id = sa.timeslot_id THEN 3
                                  ELSE 0
                                  END  as priority
                       FROM ShiftAssignments sa
                                JOIN Bookings b ON sa.booking_id = b.id
                                JOIN Users u ON b.user_id = u.id
                                JOIN TimeSlots ts ON sa.timeslot_id = ts.id
                                JOIN WorkShifts ws ON ts.workshift_id = ws.id
                       """)

        assignments = []
        for row in cursor.fetchall():
            assignment = ShiftAssignmentWithDetails(
                id=row[0],
                booking_id=row[1],
                timeslot_id=row[2],
                is_confirmed=bool(row[3]),
                admin_notes=row[4] or "",
                assignment_date=row[5],
                first_name=row[6],
                last_name=row[7],
                email=row[8],
                phone=row[9],
                workshift_title=row[10],
                timeslot_title=row[11],
                timeslot_start=row[12] or "",
                timeslot_end=row[13] or "",
                priority=row[14]
            )
            assignments.append(assignment)

        return assignments


def get_assignments_by_timeslot(timeslot_id: int) -> List[ShiftAssignmentWithDetails]:
    """
    Returns all assignments for a specific timeslot.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
                       SELECT sa.id,
                              sa.booking_id,
                              sa.timeslot_id,
                              sa.is_confirmed,
                              sa.admin_notes,
                              sa.assignment_date,
                              u.first_name,
                              u.last_name,
                              u.email,
                              u.phone_number,
                              ws.title as workshift_title,
                              ts.title as timeslot_title,
                              ts.start_time,
                              ts.end_time,
                              CASE
                                  WHEN b.first_priority_timeslot_id = sa.timeslot_id THEN 1
                                  WHEN b.second_priority_timeslot_id = sa.timeslot_id THEN 2
                                  WHEN b.third_priority_timeslot_id = sa.timeslot_id THEN 3
                                  ELSE 0
                                  END  as priority
                       FROM ShiftAssignments sa
                                JOIN Bookings b ON sa.booking_id = b.id
                                JOIN Users u ON b.user_id = u.id
                                JOIN TimeSlots ts ON sa.timeslot_id = ts.id
                                JOIN WorkShifts ws ON ts.workshift_id = ws.id
                       WHERE sa.timeslot_id = ?
                       """, (timeslot_id,))

        assignments = []
        for row in cursor.fetchall():
            assignment = ShiftAssignmentWithDetails(
                id=row[0],
                booking_id=row[1],
                timeslot_id=row[2],
                is_confirmed=bool(row[3]),
                admin_notes=row[4] or "",
                assignment_date=row[5],
                first_name=row[6],
                last_name=row[7],
                email=row[8],
                phone=row[9],
                workshift_title=row[10],
                timeslot_title=row[11],
                timeslot_start=row[12] or "",
                timeslot_end=row[13] or "",
                priority=row[14]
            )
            assignments.append(assignment)

        return assignments


def get_assignments_by_booking(booking_id: int) -> List[ShiftAssignmentWithDetails]:
    """
    Returns all assignments for a specific booking (participant).
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
                       SELECT sa.id,
                              sa.booking_id,
                              sa.timeslot_id,
                              sa.is_confirmed,
                              sa.admin_notes,
                              sa.assignment_date,
                              u.first_name,
                              u.last_name,
                              u.email,
                              u.phone_number,
                              ws.title as workshift_title,
                              ts.title as timeslot_title,
                              ts.start_time,
                              ts.end_time,
                              CASE
                                  WHEN b.first_priority_timeslot_id = sa.timeslot_id THEN 1
                                  WHEN b.second_priority_timeslot_id = sa.timeslot_id THEN 2
                                  WHEN b.third_priority_timeslot_id = sa.timeslot_id THEN 3
                                  ELSE 0
                                  END  as priority
                       FROM ShiftAssignments sa
                                JOIN Bookings b ON sa.booking_id = b.id
                                JOIN Users u ON b.user_id = u.id
                                JOIN TimeSlots ts ON sa.timeslot_id = ts.id
                                JOIN WorkShifts ws ON ts.workshift_id = ws.id
                       WHERE sa.booking_id = ?
                       """, (booking_id,))

        assignments = []
        for row in cursor.fetchall():
            assignment = ShiftAssignmentWithDetails(
                id=row[0],
                booking_id=row[1],
                timeslot_id=row[2],
                is_confirmed=bool(row[3]),
                admin_notes=row[4] or "",
                assignment_date=row[5],
                first_name=row[6],
                last_name=row[7],
                email=row[8],
                phone=row[9],
                workshift_title=row[10],
                timeslot_title=row[11],
                timeslot_start=row[12] or "",
                timeslot_end=row[13] or "",
                priority=row[14]
            )
            assignments.append(assignment)

        return assignments


def create_assignment(assignment: ShiftAssignment) -> int:
    """
    Creates a new shift assignment. Returns the assignment ID on success.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()

        try:
            # Check if booking already has this timeslot assigned
            cursor.execute(
                "SELECT COUNT(*) FROM ShiftAssignments WHERE booking_id = ? AND timeslot_id = ?",
                (assignment.booking_id, assignment.timeslot_id)
            )
            if cursor.fetchone()[0] > 0:
                return -1  # Already exists

            cursor.execute("""
                           INSERT INTO ShiftAssignments
                               (booking_id, timeslot_id, is_confirmed, admin_notes)
                           VALUES (?, ?, ?, ?)
                           """, (
                               assignment.booking_id,
                               assignment.timeslot_id,
                               1 if assignment.is_confirmed else 0,
                               assignment.admin_notes
                           ))
            conn.commit()
            return cursor.lastrowid
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return -1


def update_assignment(assignment_id: int, assignment: ShiftAssignment) -> bool:
    """
    Updates an existing shift assignment. Returns True on success.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()

        try:
            cursor.execute("""
                           UPDATE ShiftAssignments
                           SET is_confirmed = ?,
                               admin_notes  = ?
                           WHERE id = ?
                           """, (
                               1 if assignment.is_confirmed else 0,
                               assignment.admin_notes,
                               assignment_id
                           ))
            conn.commit()
            return cursor.rowcount > 0
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return False


def delete_assignment(assignment_id: int) -> bool:
    """
    Deletes a shift assignment. Returns True on success.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()

        try:
            cursor.execute(
                "DELETE FROM ShiftAssignments WHERE id = ?",
                (assignment_id,)
            )
            conn.commit()
            return cursor.rowcount > 0
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return False


def get_booking_shift_count(booking_id: int) -> int:
    """
    Returns the number of shifts currently assigned to a booking.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT COUNT(*) FROM ShiftAssignments WHERE booking_id = ?",
            (booking_id,)
        )
        return cursor.fetchone()[0]


def get_booking_max_shifts(booking_id: int) -> int:
    """
    Returns the maximum number of shifts a booking requested.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT amount_shifts FROM Bookings WHERE id = ?",
            (booking_id,)
        )
        result = cursor.fetchone()
        return result[0] if result else 0


def get_timeslot_capacity(timeslot_id: int) -> int:
    """
    Returns the capacity (num_needed) of a timeslot.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT num_needed FROM TimeSlots WHERE id = ?",
            (timeslot_id,)
        )
        result = cursor.fetchone()
        return result[0] if result else 0


def get_timeslot_assignment_count(timeslot_id: int) -> int:
    """
    Returns the number of people currently assigned to a timeslot.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT COUNT(*) FROM ShiftAssignments WHERE timeslot_id = ?",
            (timeslot_id,)
        )
        return cursor.fetchone()[0]


def get_booking_assignments_summary() -> List[Dict]:
    """
    Returns a summary of bookings with their assignment status.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
                       SELECT b.id            as booking_id,
                              u.first_name,
                              u.last_name,
                              b.amount_shifts as max_shifts,
                              COUNT(sa.id)    as assigned_shifts
                       FROM Bookings b
                                JOIN Users u ON b.user_id = u.id
                                LEFT JOIN ShiftAssignments sa ON b.id = sa.booking_id
                       GROUP BY b.id
                       """)

        summaries = []
        for row in cursor.fetchall():
            summary = {
                'booking_id': row[0],
                'first_name': row[1],
                'last_name': row[2],
                'max_shifts': row[3],
                'assigned_shifts': row[4],
                'is_fully_assigned': row[4] >= row[3]
            }
            summaries.append(summary)

        return summaries


def get_timeslot_summary() -> List[Dict]:
    """
    Returns a summary of timeslots with their assignment status.
    """
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute("""
                       SELECT ts.id        as timeslot_id,
                              ws.title     as workshift_title,
                              ts.title     as timeslot_title,
                              ts.start_time,
                              ts.end_time,
                              ts.num_needed,
                              COUNT(sa.id) as assigned_count
                       FROM TimeSlots ts
                                JOIN WorkShifts ws ON ts.workshift_id = ws.id
                                LEFT JOIN ShiftAssignments sa ON ts.id = sa.timeslot_id
                       GROUP BY ts.id
                       """)

        summaries = []
        for row in cursor.fetchall():
            capacity = row[5] or 0
            assigned = row[6]

            summary = {
                'timeslot_id': row[0],
                'workshift_title': row[1],
                'timeslot_title': row[2],
                'start_time': row[3] or "",
                'end_time': row[4] or "",
                'capacity': capacity,
                'assigned_count': assigned,
                'remaining': max(0, capacity - assigned),
                'is_filled': assigned >= capacity,
                'fill_percentage': (assigned / capacity * 100) if capacity > 0 else 0
            }
            summaries.append(summary)

        return summaries


def run_auto_assignment(strategy: str = 'priority') -> Dict:
    """
    Automatically assigns participants to shifts based on the specified strategy.
    Returns statistics about the result.

    Strategies:
    - priority: Assign people to their highest priority shifts first
    - fill: Fill up shifts to their capacity, starting with most needed
    """
    conn = _connect_db()

    try:
        conn.execute("BEGIN TRANSACTION")
        cursor = conn.cursor()

        # Clear existing assignments if requested
        cursor.execute("DELETE FROM ShiftAssignments")

        # Get all bookings with their priorities
        cursor.execute("""
                       SELECT id,
                              first_priority_timeslot_id,
                              second_priority_timeslot_id,
                              third_priority_timeslot_id,
                              amount_shifts
                       FROM Bookings
                       WHERE amount_shifts > 0
                       """)
        bookings = cursor.fetchall()

        # Get all timeslots with their capacities
        cursor.execute("""
                       SELECT id, num_needed
                       FROM TimeSlots
                       """)
        timeslots = {ts[0]: ts[1] for ts in cursor.fetchall()}

        # Keep track of assignments
        assignments_made = 0
        bookings_fully_assigned = 0
        timeslots_filled = 0
        timeslot_assignments = {ts_id: 0 for ts_id in timeslots}

        if strategy == 'priority':
            # Priority-based assignment (1st, 2nd, 3rd choices)
            for priority_level in range(1, 4):
                for booking in bookings:
                    booking_id = booking[0]
                    max_shifts = booking[4]
                    current_shifts = 0

                    # Get count of already assigned shifts for this booking
                    cursor.execute(
                        "SELECT COUNT(*) FROM ShiftAssignments WHERE booking_id = ?",
                        (booking_id,)
                    )
                    current_shifts = cursor.fetchone()[0]

                    # Skip if already at max shifts
                    if current_shifts >= max_shifts:
                        continue

                    # Get the appropriate priority timeslot
                    timeslot_id = booking[priority_level]

                    # Skip if no timeslot preference at this level
                    if timeslot_id <= 0:
                        continue

                    # Skip if timeslot already assigned to this booking
                    cursor.execute(
                        "SELECT COUNT(*) FROM ShiftAssignments WHERE booking_id = ? AND timeslot_id = ?",
                        (booking_id, timeslot_id)
                    )
                    if cursor.fetchone()[0] > 0:
                        continue

                    # Skip if timeslot is full
                    if timeslot_assignments[timeslot_id] >= timeslots[timeslot_id]:
                        continue

                    # Create the assignment
                    cursor.execute(
                        "INSERT INTO ShiftAssignments (booking_id, timeslot_id, is_confirmed) VALUES (?, ?, 1)",
                        (booking_id, timeslot_id)
                    )

                    # Update tracking
                    assignments_made += 1
                    timeslot_assignments[timeslot_id] += 1

        elif strategy == 'fill':
            # Fill-based assignment (prioritize filling up shifts)
            # Sort timeslots by percentage filled (least to most)
            sorted_timeslots = sorted(
                [(ts_id, timeslots[ts_id], timeslot_assignments[ts_id]) for ts_id in timeslots],
                key=lambda x: x[2] / x[1] if x[1] > 0 else 1
            )

            for ts_id, capacity, _ in sorted_timeslots:
                # Skip if already filled
                if timeslot_assignments[ts_id] >= capacity:
                    continue

                # Find bookings that have this timeslot as a preference
                eligible_bookings = []
                for booking in bookings:
                    booking_id = booking[0]
                    max_shifts = booking[4]

                    # Get count of already assigned shifts
                    cursor.execute(
                        "SELECT COUNT(*) FROM ShiftAssignments WHERE booking_id = ?",
                        (booking_id,)
                    )
                    current_shifts = cursor.fetchone()[0]

                    # Skip if already at max shifts
                    if current_shifts >= max_shifts:
                        continue

                    # Check if this timeslot is in their preferences
                    if ts_id in booking[1:4]:
                        # Calculate priority level (1, 2, or 3)
                        priority = 1
                        if booking[1] == ts_id:
                            priority = 1
                        elif booking[2] == ts_id:
                            priority = 2
                        elif booking[3] == ts_id:
                            priority = 3

                        eligible_bookings.append((booking_id, priority))

                # Sort eligible bookings by priority level
                eligible_bookings.sort(key=lambda x: x[1])

                # Assign until filled or no more eligible bookings
                for booking_id, _ in eligible_bookings:
                    # Skip if timeslot is now full
                    if timeslot_assignments[ts_id] >= capacity:
                        break

                    # Skip if already assigned to this timeslot
                    cursor.execute(
                        "SELECT COUNT(*) FROM ShiftAssignments WHERE booking_id = ? AND timeslot_id = ?",
                        (booking_id, ts_id)
                    )
                    if cursor.fetchone()[0] > 0:
                        continue

                    # Create the assignment
                    cursor.execute(
                        "INSERT INTO ShiftAssignments (booking_id, timeslot_id, is_confirmed) VALUES (?, ?, 1)",
                        (booking_id, ts_id)
                    )

                    # Update tracking
                    assignments_made += 1
                    timeslot_assignments[ts_id] += 1

        # Calculate final statistics
        for booking in bookings:
            booking_id = booking[0]
            max_shifts = booking[4]

            cursor.execute(
                "SELECT COUNT(*) FROM ShiftAssignments WHERE booking_id = ?",
                (booking_id,)
            )
            assigned_shifts = cursor.fetchone()[0]

            if assigned_shifts >= max_shifts:
                bookings_fully_assigned += 1

        for ts_id, capacity in timeslots.items():
            if timeslot_assignments[ts_id] >= capacity:
                timeslots_filled += 1

        conn.commit()

        return {
            'assignments_made': assignments_made,
            'bookings_total': len(bookings),
            'bookings_fully_assigned': bookings_fully_assigned,
            'timeslots_total': len(timeslots),
            'timeslots_filled': timeslots_filled
        }

    except sqlite3.Error as e:
        conn.rollback()
        print(f"Database error during auto-assignment: {e}")
        return {
            'error': str(e),
            'assignments_made': 0,
            'bookings_fully_assigned': 0,
            'timeslots_filled': 0
        }
    finally:
        conn.close()