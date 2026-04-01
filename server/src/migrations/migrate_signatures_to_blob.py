"""
Database Migration: Convert signatures to BLOB values
=====================================================

Converts legacy base64/text signatures in Bookings and ArtistBookings
to binary BLOB values.
"""

import os
import sqlite3

from src.utils.signature import decode_signature_to_blob

IN_DOCKER = os.environ.get("IN_DOCKER", "False").lower() == "true"

if IN_DOCKER:
    DB_FILE_PATH = "/app/user_data/bookings.db"
else:
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    DB_DIR = os.path.join(SCRIPT_DIR, "../../db")
    DB_FILE_PATH = os.path.join(DB_DIR, "bookings.db")


def migrate() -> None:
    print("=" * 60)
    print("Starting signature BLOB migration")
    print("=" * 60)
    print(f"Database path: {DB_FILE_PATH}")

    conn = sqlite3.connect(DB_FILE_PATH)
    cursor = conn.cursor()

    converted_count = 0
    skipped_count = 0

    try:
        for table_name in ("Bookings", "ArtistBookings"):
            print(f"\nMigrating table: {table_name}")
            cursor.execute(f"SELECT id, signature FROM {table_name} WHERE signature IS NOT NULL")

            for row_id, signature_value in cursor.fetchall():
                if isinstance(signature_value, bytes):
                    skipped_count += 1
                    continue

                if not isinstance(signature_value, str):
                    skipped_count += 1
                    continue

                signature_text = signature_value.strip()
                if not signature_text:
                    skipped_count += 1
                    continue

                try:
                    blob_value = decode_signature_to_blob(signature_text)
                except ValueError:
                    skipped_count += 1
                    continue

                cursor.execute(
                    f"UPDATE {table_name} SET signature = ? WHERE id = ?",
                    (sqlite3.Binary(blob_value), row_id),
                )
                converted_count += 1

        conn.commit()

        print("\n" + "=" * 60)
        print("Signature migration completed")
        print("=" * 60)
        print(f"Converted rows: {converted_count}")
        print(f"Skipped rows: {skipped_count}")

    except Exception as exc:
        conn.rollback()
        print(f"\nMigration failed: {exc}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
