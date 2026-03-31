import sqlite3
from contextlib import closing
from typing import Any

from src.services.booking_service import _connect_db


def _ensure_shift_messages_table(cursor: sqlite3.Cursor) -> None:
    cursor.executescript(
        """
        CREATE TABLE IF NOT EXISTS ShiftMessages (
            id INTEGER PRIMARY KEY NOT NULL,
            timeslot_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            category TEXT,
            content TEXT NOT NULL,
            created_by TEXT,
            created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY(timeslot_id) REFERENCES TimeSlots(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_shift_messages_timeslot_id
            ON ShiftMessages(timeslot_id);
        CREATE INDEX IF NOT EXISTS idx_shift_messages_created_date
            ON ShiftMessages(created_date DESC);
        """
    )


def create_shift_message(
    timeslot_id: int,
    title: str,
    content: str,
    category: str | None = None,
    created_by: str | None = None,
) -> int:
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        try:
            _ensure_shift_messages_table(cursor)
            cursor.execute("SELECT id FROM TimeSlots WHERE id = ?", (timeslot_id,))
            if not cursor.fetchone():
                return -1

            cursor.execute(
                """
                INSERT INTO ShiftMessages (timeslot_id, title, category, content, created_by)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    timeslot_id,
                    title,
                    category.strip() if category else None,
                    content,
                    created_by,
                ),
            )
            conn.commit()
            return cursor.lastrowid if cursor.lastrowid is not None else 0
        except sqlite3.Error:
            return 0


def create_shift_messages(
    timeslot_ids: list[int],
    title: str,
    content: str,
    category: str | None = None,
    created_by: str | None = None,
) -> tuple[int, list[int]]:
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        try:
            _ensure_shift_messages_table(cursor)
            created_ids: list[int] = []
            failed_timeslot_ids: list[int] = []
            for timeslot_id in timeslot_ids:
                cursor.execute("SELECT id FROM TimeSlots WHERE id = ?", (timeslot_id,))
                if not cursor.fetchone():
                    failed_timeslot_ids.append(timeslot_id)
                    continue

                cursor.execute(
                    """
                    INSERT INTO ShiftMessages (timeslot_id, title, category, content, created_by)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        timeslot_id,
                        title,
                        category.strip() if category else None,
                        content,
                        created_by,
                    ),
                )
                if cursor.lastrowid is not None:
                    created_ids.append(int(cursor.lastrowid))
            conn.commit()
            return (len(created_ids), failed_timeslot_ids)
        except sqlite3.Error:
            return (0, timeslot_ids)


def delete_shift_message(message_id: int) -> bool:
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        try:
            _ensure_shift_messages_table(cursor)
            cursor.execute(
                """
                UPDATE ShiftMessages
                SET is_active = 0
                WHERE id = ?
                """,
                (message_id,),
            )
            conn.commit()
            return cursor.rowcount > 0
        except sqlite3.Error:
            return False


def get_shift_messages_grouped() -> list[dict[str, Any]]:
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        _ensure_shift_messages_table(cursor)
        cursor.execute(
            """
            SELECT
                sm.id,
                sm.timeslot_id,
                sm.title,
                sm.category,
                sm.content,
                sm.created_by,
                sm.created_date,
                ws.title as workshift_title,
                ts.title as timeslot_title,
                ts.start_time as timeslot_start,
                ts.end_time as timeslot_end
            FROM ShiftMessages sm
            JOIN TimeSlots ts ON sm.timeslot_id = ts.id
            JOIN WorkShifts ws ON ts.workshift_id = ws.id
            WHERE sm.is_active = 1
            ORDER BY workshift_title ASC, ts.start_time ASC, sm.created_date DESC
            """
        )

        grouped: dict[int, dict[str, Any]] = {}
        for row in cursor.fetchall():
            timeslot_id = int(row[1])
            if timeslot_id not in grouped:
                grouped[timeslot_id] = {
                    "timeslot_id": timeslot_id,
                    "workshift_title": row[7],
                    "timeslot_title": row[8],
                    "timeslot_start": row[9],
                    "timeslot_end": row[10],
                    "messages": [],
                }

            grouped[timeslot_id]["messages"].append(
                {
                    "id": row[0],
                    "title": row[2],
                    "category": row[3],
                    "content": row[4],
                    "created_by": row[5],
                    "created_date": row[6],
                }
            )

        return list(grouped.values())


def get_shift_messages_for_booking(booking_id: int) -> list[dict[str, Any]]:
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        _ensure_shift_messages_table(cursor)
        cursor.execute(
            """
            SELECT DISTINCT
                sm.id,
                sm.title,
                sm.category,
                sm.content,
                sm.created_by,
                sm.created_date,
                COALESCE(NULLIF(TRIM(ws.working_title), ''), ws.title) as workshift_title,
                COALESCE(NULLIF(TRIM(ts.working_title), ''), ts.title) as timeslot_title,
                ts.start_time as timeslot_start,
                ts.end_time as timeslot_end
            FROM ShiftMessages sm
            JOIN TimeSlots ts ON sm.timeslot_id = ts.id
            JOIN WorkShifts ws ON ts.workshift_id = ws.id
            JOIN ShiftAssignments sa ON sa.timeslot_id = sm.timeslot_id
            WHERE sm.is_active = 1
              AND sa.booking_id = ?
              AND sa.status = 'accepted'
            ORDER BY sm.created_date DESC
            """,
            (booking_id,),
        )

        return [
            {
                "id": row[0],
                "title": row[1],
                "category": row[2],
                "content": row[3],
                "created_by": row[4],
                "created_date": row[5],
                "workshift_title": row[6],
                "timeslot_title": row[7],
                "timeslot_start": row[8],
                "timeslot_end": row[9],
            }
            for row in cursor.fetchall()
        ]
