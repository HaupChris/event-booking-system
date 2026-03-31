"""
Database Migration: Add Passwords Table
========================================

Creates the Passwords table and seeds it with hashed defaults
for admin ('a'), user ('b'), and artist ('artist') passwords.

Run this script once to migrate the database.
"""

import os
import sqlite3

from werkzeug.security import generate_password_hash

IN_DOCKER = os.environ.get("IN_DOCKER", "False").lower() == "true"

if IN_DOCKER:
    DB_FILE_PATH = "/app/user_data/bookings.db"
else:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    DB_DIR = os.path.join(script_dir, "../../db")
    DB_FILE_PATH = os.path.join(DB_DIR, "bookings.db")

DEFAULT_PASSWORDS = {
    "admin": os.environ.get("ADMIN_PASSWORD", "a"),
    "user": os.environ.get("PASSWORD", "b"),
    "artist": os.environ.get("ARTIST_PASSWORD", "artist"),
}


def migrate():
    """Run the Passwords table migration."""
    print("=" * 60)
    print("Starting Passwords Table Migration")
    print("=" * 60)
    print(f"Database path: {DB_FILE_PATH}")

    conn = sqlite3.connect(DB_FILE_PATH)
    cursor = conn.cursor()

    try:
        print("\n[1/2] Creating Passwords table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Passwords (
                id INTEGER PRIMARY KEY NOT NULL,
                role TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("   Done")

        print("\n[2/2] Seeding default password hashes...")
        for role, plain in DEFAULT_PASSWORDS.items():
            hashed = generate_password_hash(plain, method="pbkdf2:sha256", salt_length=8)
            cursor.execute(
                "INSERT OR IGNORE INTO Passwords (role, password_hash, updated_at) "
                "VALUES (?, ?, CURRENT_TIMESTAMP)",
                (role, hashed),
            )
            print(f"   {role}: seeded")

        conn.commit()

        print("\n" + "=" * 60)
        print("Migration completed successfully!")
        print("=" * 60)

    except Exception as e:
        conn.rollback()
        print(f"\nMigration failed: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
