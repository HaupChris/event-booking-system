"""Workshift and timeslot service for admin CRUD and validation."""

import os
import sqlite3
from contextlib import closing
from pathlib import Path
from typing import Any

from src.utils.logger import get_logger

logger = get_logger(__name__)

IN_DOCKER = os.environ.get("IN_DOCKER", "False").lower() == "true"

if IN_DOCKER:
    DB_FILE_PATH = "/app/user_data/bookings.db"
else:
    DB_DIR = (Path(__file__).resolve().parent / "../../db").resolve()
    DB_FILE_PATH = str(DB_DIR / "bookings.db")

ALLOWED_SCHEMA_TABLES = {"WorkShifts", "TimeSlots", "Bookings", "ShiftAssignments", "ShiftMessages"}


def _assert_allowed_schema_table(table_name: str) -> str:
    if table_name not in ALLOWED_SCHEMA_TABLES:
        raise ValueError(f"Unexpected schema table name: {table_name}")
    return table_name


def _connect_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _table_has_column(cursor: sqlite3.Cursor, table_name: str, column_name: str) -> bool:
    table_name = _assert_allowed_schema_table(table_name)
    cursor.execute(f"PRAGMA table_info({table_name})")
    return any(row[1] == column_name for row in cursor.fetchall())


def _normalize_positive_int(value: Any, default: int = 1) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    return parsed if parsed >= 1 else default


def _ensure_schema(conn: sqlite3.Connection) -> None:
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS WorkShifts (
            id INTEGER PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            working_title TEXT,
            description TEXT,
            multiple_selection_possible INTEGER NOT NULL DEFAULT 1
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS TimeSlots (
            id INTEGER PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            working_title TEXT,
            start_time TEXT,
            end_time TEXT,
            num_needed INTEGER,
            workshift_id INTEGER,
            FOREIGN KEY(workshift_id) REFERENCES WorkShifts(id) ON DELETE CASCADE
        )
        """
    )

    if not _table_has_column(cursor, "WorkShifts", "working_title"):
        cursor.execute("ALTER TABLE WorkShifts ADD COLUMN working_title TEXT")

    if not _table_has_column(cursor, "WorkShifts", "multiple_selection_possible"):
        cursor.execute(
            "ALTER TABLE WorkShifts ADD COLUMN multiple_selection_possible INTEGER NOT NULL DEFAULT 1"
        )

    if not _table_has_column(cursor, "TimeSlots", "working_title"):
        cursor.execute("ALTER TABLE TimeSlots ADD COLUMN working_title TEXT")

    cursor.execute(
        """
        UPDATE WorkShifts
        SET working_title = title
        WHERE working_title IS NULL OR TRIM(working_title) = ''
        """
    )
    cursor.execute(
        """
        UPDATE WorkShifts
        SET multiple_selection_possible = 1
        WHERE multiple_selection_possible IS NULL OR multiple_selection_possible < 1
        """
    )
    cursor.execute(
        """
        UPDATE TimeSlots
        SET working_title = title
        WHERE working_title IS NULL OR TRIM(working_title) = ''
        """
    )
    conn.commit()


def ensure_workshift_schema() -> None:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)


def get_workshifts_with_timeslots() -> list[dict[str, Any]]:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, title, working_title, description, multiple_selection_possible
            FROM WorkShifts
            ORDER BY id ASC
            """
        )
        workshift_rows = cursor.fetchall()

        result: list[dict[str, Any]] = []
        for ws in workshift_rows:
            cursor.execute(
                """
                SELECT id, title, working_title, start_time, end_time, num_needed, workshift_id
                FROM TimeSlots
                WHERE workshift_id = ?
                ORDER BY id ASC
                """,
                (ws["id"],),
            )
            timeslots = [
                {
                    "id": row["id"],
                    "title": row["title"],
                    "working_title": row["working_title"],
                    "start_time": row["start_time"] or "",
                    "end_time": row["end_time"] or "",
                    "num_needed": _normalize_positive_int(row["num_needed"]),
                    "workshift_id": row["workshift_id"],
                }
                for row in cursor.fetchall()
            ]
            result.append(
                {
                    "id": ws["id"],
                    "title": ws["title"],
                    "working_title": ws["working_title"] or ws["title"],
                    "description": ws["description"] or "",
                    "multiple_selection_possible": _normalize_positive_int(
                        ws["multiple_selection_possible"]
                    ),
                    "time_slots": timeslots,
                }
            )

        return result


def create_workshift(
    title: str,
    description: str = "",
    working_title: str | None = None,
    multiple_selection_possible: int = 1,
) -> int:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()
        display_title = title.strip()
        planning_title = (working_title or display_title).strip()
        cursor.execute(
            """
            INSERT INTO WorkShifts (title, working_title, description, multiple_selection_possible)
            VALUES (?, ?, ?, ?)
            """,
            (
                display_title,
                planning_title,
                description.strip(),
                _normalize_positive_int(multiple_selection_possible),
            ),
        )
        conn.commit()
        row_id = cursor.lastrowid
        return row_id if row_id is not None else -1


def update_workshift(
    workshift_id: int,
    title: str | None = None,
    description: str | None = None,
    working_title: str | None = None,
    multiple_selection_possible: int | None = None,
) -> bool:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()

        updates: list[str] = []
        values: list[Any] = []

        if title is not None:
            updates.append("title = ?")
            values.append(title.strip())

        if description is not None:
            updates.append("description = ?")
            values.append(description.strip())

        if working_title is not None:
            updates.append("working_title = ?")
            values.append(working_title.strip())

        if multiple_selection_possible is not None:
            updates.append("multiple_selection_possible = ?")
            values.append(_normalize_positive_int(multiple_selection_possible))

        if not updates:
            return False

        values.append(workshift_id)
        cursor.execute(
            f"UPDATE WorkShifts SET {', '.join(updates)} WHERE id = ?",
            tuple(values),
        )
        conn.commit()
        return cursor.rowcount > 0


def _get_timeslot_usage_count(cursor: sqlite3.Cursor, timeslot_id: int) -> int:
    usage_queries = [
        "SELECT COUNT(*) FROM Bookings WHERE first_priority_timeslot_id = ?",
        "SELECT COUNT(*) FROM Bookings WHERE second_priority_timeslot_id = ?",
        "SELECT COUNT(*) FROM Bookings WHERE third_priority_timeslot_id = ?",
        "SELECT COUNT(*) FROM ShiftAssignments WHERE timeslot_id = ?",
        "SELECT COUNT(*) FROM ShiftMessages WHERE timeslot_id = ?",
    ]

    usage_count = 0
    for query in usage_queries:
        try:
            cursor.execute(query, (timeslot_id,))
            usage_count += int(cursor.fetchone()[0])
        except sqlite3.OperationalError:
            continue

    return usage_count


def delete_workshift(workshift_id: int) -> tuple[bool, str]:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM WorkShifts WHERE id = ?", (workshift_id,))
        if not cursor.fetchone():
            return False, "Workshift not found"

        cursor.execute("SELECT id FROM TimeSlots WHERE workshift_id = ?", (workshift_id,))
        timeslot_ids = [row[0] for row in cursor.fetchall()]
        for timeslot_id in timeslot_ids:
            if _get_timeslot_usage_count(cursor, timeslot_id) > 0:
                return False, "Workshift is in use and cannot be deleted"

        cursor.execute("DELETE FROM TimeSlots WHERE workshift_id = ?", (workshift_id,))
        cursor.execute("DELETE FROM WorkShifts WHERE id = ?", (workshift_id,))
        conn.commit()
        return True, "Workshift deleted"


def create_timeslot(
    workshift_id: int,
    title: str,
    start_time: str,
    end_time: str,
    num_needed: int,
    working_title: str | None = None,
) -> int:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM WorkShifts WHERE id = ?", (workshift_id,))
        if not cursor.fetchone():
            return -1

        display_title = title.strip()
        planning_title = (working_title or display_title).strip()
        cursor.execute(
            """
            INSERT INTO TimeSlots (title, working_title, start_time, end_time, num_needed, workshift_id)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                display_title,
                planning_title,
                start_time.strip(),
                end_time.strip(),
                _normalize_positive_int(num_needed),
                workshift_id,
            ),
        )
        conn.commit()
        row_id = cursor.lastrowid
        return row_id if row_id is not None else -1


def update_timeslot(
    timeslot_id: int,
    title: str | None = None,
    start_time: str | None = None,
    end_time: str | None = None,
    num_needed: int | None = None,
    working_title: str | None = None,
) -> bool:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()

        updates: list[str] = []
        values: list[Any] = []

        if title is not None:
            updates.append("title = ?")
            values.append(title.strip())

        if working_title is not None:
            updates.append("working_title = ?")
            values.append(working_title.strip())

        if start_time is not None:
            updates.append("start_time = ?")
            values.append(start_time.strip())

        if end_time is not None:
            updates.append("end_time = ?")
            values.append(end_time.strip())

        if num_needed is not None:
            updates.append("num_needed = ?")
            values.append(_normalize_positive_int(num_needed))

        if not updates:
            return False

        values.append(timeslot_id)
        cursor.execute(
            f"UPDATE TimeSlots SET {', '.join(updates)} WHERE id = ?",
            tuple(values),
        )
        conn.commit()
        return cursor.rowcount > 0


def delete_timeslot(timeslot_id: int) -> tuple[bool, str]:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM TimeSlots WHERE id = ?", (timeslot_id,))
        if not cursor.fetchone():
            return False, "Timeslot not found"

        if _get_timeslot_usage_count(cursor, timeslot_id) > 0:
            return False, "Timeslot is in use and cannot be deleted"

        cursor.execute("DELETE FROM TimeSlots WHERE id = ?", (timeslot_id,))
        conn.commit()
        return True, "Timeslot deleted"


def validate_booking_timeslot_selection(timeslot_ids: list[int]) -> tuple[bool, str]:
    if len(timeslot_ids) == 0:
        return False, "No timeslot priorities provided"

    normalized_ids: list[int] = []
    for raw_id in timeslot_ids:
        try:
            normalized_ids.append(int(raw_id))
        except (TypeError, ValueError):
            return False, "Invalid timeslot id"

    if any(timeslot_id < 0 for timeslot_id in normalized_ids):
        return False, "All timeslot priorities must be selected"

    if len(set(normalized_ids)) != len(normalized_ids):
        return False, "A timeslot can only be selected once"

    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()

        placeholders = ", ".join(["?"] * len(normalized_ids))
        cursor.execute(
            f"""
            SELECT ts.id, ts.workshift_id, ws.multiple_selection_possible
            FROM TimeSlots ts
            JOIN WorkShifts ws ON ts.workshift_id = ws.id
            WHERE ts.id IN ({placeholders})
            """,
            tuple(normalized_ids),
        )
        rows = cursor.fetchall()

        if len(rows) != len(normalized_ids):
            return False, "One or more selected timeslots do not exist"

        selected_count_per_workshift: dict[int, int] = {}
        max_per_workshift: dict[int, int] = {}
        for row in rows:
            workshift_id = int(row["workshift_id"])
            selected_count_per_workshift[workshift_id] = (
                selected_count_per_workshift.get(workshift_id, 0) + 1
            )
            max_per_workshift[workshift_id] = _normalize_positive_int(
                row["multiple_selection_possible"],
                default=1,
            )

        for workshift_id, selected_count in selected_count_per_workshift.items():
            if selected_count > max_per_workshift.get(workshift_id, 1):
                return (
                    False,
                    "Selected too many timeslots for a single workshift",
                )

    return True, ""


ensure_workshift_schema()
