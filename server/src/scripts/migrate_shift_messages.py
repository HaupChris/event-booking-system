#!/usr/bin/env python3
"""
Database Migration Script: Add ShiftMessages table
"""

import os
import sqlite3
import sys
from pathlib import Path

IN_DOCKER = os.environ.get("IN_DOCKER", "False").lower() == "true"

if IN_DOCKER:
    DB_PATH = "/app/user_data/bookings.db"
else:
    DB_PATH = Path(__file__).parent.parent.parent / "db" / "bookings.db"

MIGRATION_FILE = (
    Path(__file__).parent.parent.parent / "data" / "migrations" / "add_shift_messages.sql"
)


def run_migration() -> bool:
    if not MIGRATION_FILE.exists():
        print(f"Migration file not found: {MIGRATION_FILE}")
        return False

    if not Path(DB_PATH).exists():
        print(f"Database not found: {DB_PATH}")
        return False

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.executescript(MIGRATION_FILE.read_text())
            conn.commit()

            cursor.execute("PRAGMA table_info(ShiftMessages)")
            columns = [row[1] for row in cursor.fetchall()]
            required = {"id", "timeslot_id", "title", "category", "content", "created_date"}
            missing = required - set(columns)
            if missing:
                print(f"Migration incomplete. Missing columns: {', '.join(sorted(missing))}")
                return False

        print("ShiftMessages migration completed successfully.")
        return True
    except Exception as exc:
        print(f"Migration failed: {exc}")
        return False


if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
