import sqlite3
from typing import List


def apply_migration(db_file_path: str) -> None:
    """
    Applies a migration SQL script to the database.
    """
    # Connect to the DB
    conn = sqlite3.connect(db_file_path)
    cursor = conn.cursor()

    # For SQLite, we need to check if columns exist before adding them
    # Get current columns in the Bookings table
    cursor.execute("PRAGMA table_info(Bookings)")
    existing_columns = [col[1] for col in cursor.fetchall()]

    # Check and add each column if it doesn't exist
    columns_to_add = [
        ("is_paid", "INTEGER DEFAULT 0"),
        ("paid_amount", "REAL DEFAULT 0.0"),
        ("payment_notes", "TEXT DEFAULT ''"),
        ("payment_date", "TEXT DEFAULT NULL")
    ]

    for col_name, col_def in columns_to_add:
        if col_name not in existing_columns:
            try:
                cursor.execute(f"ALTER TABLE Bookings ADD COLUMN {col_name} {col_def}")
                print(f"Added column {col_name} to Bookings table")
            except Exception as e:
                print(f"Error adding column {col_name}: {e}")

    conn.commit()
    conn.close()

def init_db(db_file_path: str, schema_paths: List[str]) -> None:
    """
    Creates the SQLite database and applies the schema if not already done.
    """
    # Connect to the DB
    conn = sqlite3.connect(db_file_path)

    # Read schema.sql
    for schema_path in schema_paths:
        with open(schema_path, 'r') as f:
            schema_script = f.read()
            conn.executescript(schema_script)
            conn.commit()

    conn.close()
