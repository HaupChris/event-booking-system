#!/usr/bin/env python3
"""
Database Migration Script
==========================

Applies migration to add status tracking fields to ShiftAssignments table.

Usage:
    python migrate_database.py

The script will:
1. Locate the database file (dev or Docker environment)
2. Apply the migration SQL
3. Verify the new columns were added
4. Report on the number of existing assignments updated
"""

import os
import sqlite3
import sys
from pathlib import Path

# Determine database path based on environment
IN_DOCKER = os.environ.get("IN_DOCKER", "False").lower() == "true"

if IN_DOCKER:
    DB_PATH = "/app/user_data/bookings.db"
else:
    # Navigate from server/src/scripts/ to server/db/
    DB_DIR = Path(__file__).parent.parent.parent / "db"
    DB_PATH = DB_DIR / "bookings.db"

# Migration file path (from server/src/scripts/ to server/data/migrations/)
MIGRATION_FILE = (
    Path(__file__).parent.parent.parent / "data" / "migrations" / "add_shift_status_fields.sql"
)


def run_migration() -> bool:
    """Execute the migration SQL file and verify success."""

    # Validate migration file exists
    if not MIGRATION_FILE.exists():
        print(f"❌ ERROR: Migration file not found: {MIGRATION_FILE}")
        print(f"   Expected location: {MIGRATION_FILE.absolute()}")
        return False

    # Validate database exists
    if not Path(DB_PATH).exists():
        print(f"❌ ERROR: Database not found: {DB_PATH}")
        print(f"   Expected location: {Path(DB_PATH).absolute()}")
        return False

    print("=" * 70)
    print("DATABASE MIGRATION: Add Shift Status Fields")
    print("=" * 70)
    print(f"Database:  {DB_PATH}")
    print(f"Migration: {MIGRATION_FILE}")
    print("-" * 70)

    try:
        # Connect to database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Read and execute migration SQL
        with open(MIGRATION_FILE, "r") as f:
            migration_sql = f.read()

        print("\n📝 Executing migration SQL...")
        cursor.executescript(migration_sql)
        conn.commit()
        print("✓ Migration SQL executed successfully")

        # Verify migration by checking table schema
        print("\n🔍 Verifying migration...")
        cursor.execute("PRAGMA table_info(ShiftAssignments)")
        columns = [col[1] for col in cursor.fetchall()]

        required_columns = ["status", "rejection_reason", "alternative_preferences", "response_date"]
        missing = [col for col in required_columns if col not in columns]

        if missing:
            print(f"❌ ERROR: Migration incomplete. Missing columns: {', '.join(missing)}")
            print(f"   Found columns: {', '.join(columns)}")
            conn.close()
            return False

        print("✓ All required columns added:")
        for col in required_columns:
            print(f"  • {col}")

        # Report on updated assignments
        cursor.execute("SELECT COUNT(*) FROM ShiftAssignments")
        count = cursor.fetchone()[0]

        print(f"\n📊 Updated {count} existing shift assignment(s)")

        # Show sample of updated data (if any exists)
        if count > 0:
            cursor.execute(
                """
                SELECT id, booking_id, timeslot_id, status, response_date
                FROM ShiftAssignments
                LIMIT 3
            """
            )
            print("\n📋 Sample assignments (first 3):")
            for row in cursor.fetchall():
                print(
                    f"  • ID {row[0]}: booking_id={row[1]}, timeslot_id={row[2]}, "
                    f"status={row[3]}, response_date={row[4]}"
                )

        conn.close()

        print("\n" + "=" * 70)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        return True

    except sqlite3.Error as e:
        print(f"\n❌ ERROR: Database error during migration")
        print(f"   {e}")
        return False
    except FileNotFoundError as e:
        print(f"\n❌ ERROR: File not found")
        print(f"   {e}")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: Unexpected error during migration")
        print(f"   {e}")
        return False


if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)