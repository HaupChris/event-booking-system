"""Orga Team service for inviter list management."""

import os
import sqlite3
from contextlib import closing
from datetime import UTC, datetime
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

ALLOWED_SCHEMA_TABLES = {"OrgaTeamInviters", "Bookings", "ArtistBookings"}


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


def _ensure_schema(conn: sqlite3.Connection) -> None:
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS OrgaTeamInviters (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL UNIQUE,
            is_active INTEGER DEFAULT 1,
            display_order INTEGER NOT NULL DEFAULT 0,
            created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_date DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    if not _table_has_column(cursor, "Bookings", "invited_by_id"):
        cursor.execute("ALTER TABLE Bookings ADD COLUMN invited_by_id INTEGER")

    if not _table_has_column(cursor, "ArtistBookings", "invited_by_id"):
        cursor.execute("ALTER TABLE ArtistBookings ADD COLUMN invited_by_id INTEGER")

    conn.commit()


def ensure_orga_team_schema() -> None:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)


def get_orga_team_members(include_inactive: bool = True) -> list[dict[str, Any]]:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()

        query = (
            "SELECT id, name, is_active, display_order, created_date, updated_date "
            "FROM OrgaTeamInviters"
        )
        params: tuple[Any, ...] = ()
        if not include_inactive:
            query += " WHERE is_active = 1"
        query += " ORDER BY display_order ASC, name COLLATE NOCASE ASC"

        cursor.execute(query, params)
        return [
            {
                "id": row["id"],
                "name": row["name"],
                "is_active": bool(row["is_active"]),
                "display_order": row["display_order"],
                "created_date": row["created_date"],
                "updated_date": row["updated_date"],
            }
            for row in cursor.fetchall()
        ]


def get_active_orga_team_members() -> list[dict[str, Any]]:
    members = get_orga_team_members(include_inactive=False)
    return [{"id": member["id"], "name": member["name"]} for member in members]


def create_orga_team_member(name: str, display_order: int | None = None) -> int:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()

        normalized_name = name.strip()
        if display_order is None:
            cursor.execute("SELECT COALESCE(MAX(display_order), -1) + 1 FROM OrgaTeamInviters")
            row = cursor.fetchone()
            display_order = int(row[0]) if row and row[0] is not None else 0

        now = datetime.now(UTC).isoformat()
        cursor.execute(
            """
            INSERT INTO OrgaTeamInviters (name, is_active, display_order, created_date, updated_date)
            VALUES (?, 1, ?, ?, ?)
            """,
            (normalized_name, display_order, now, now),
        )
        conn.commit()
        row_id = cursor.lastrowid
        return row_id if row_id is not None else -1


def update_orga_team_member(
    member_id: int,
    name: str | None = None,
    is_active: bool | None = None,
    display_order: int | None = None,
) -> bool:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()

        updates: list[str] = []
        values: list[Any] = []

        if name is not None:
            updates.append("name = ?")
            values.append(name.strip())

        if is_active is not None:
            updates.append("is_active = ?")
            values.append(1 if is_active else 0)

        if display_order is not None:
            updates.append("display_order = ?")
            values.append(display_order)

        if not updates:
            return False

        updates.append("updated_date = ?")
        values.append(datetime.now(UTC).isoformat())
        values.append(member_id)

        cursor.execute(
            f"UPDATE OrgaTeamInviters SET {', '.join(updates)} WHERE id = ?",
            tuple(values),
        )
        conn.commit()

        return cursor.rowcount > 0


def deactivate_orga_team_member(member_id: int) -> bool:
    return update_orga_team_member(member_id=member_id, is_active=False)


def is_valid_active_orga_team_member(member_id: int) -> bool:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id FROM OrgaTeamInviters WHERE id = ? AND is_active = 1",
            (member_id,),
        )
        return cursor.fetchone() is not None


ensure_orga_team_schema()
