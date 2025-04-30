import os
import sqlite3
from typing import List


def init_db(db_file_path: str, schema_paths: List[str]) -> None:
    """
    Creates the SQLite database and applies the schema if not already done.
    """
    # Ensure the directory exists
    db_dir = os.path.dirname(db_file_path)
    os.makedirs(db_dir, exist_ok=True)

    # Connect to the DB
    conn = sqlite3.connect(db_file_path)

    # Read schema.sql
    for schema_path in schema_paths:
        with open(schema_path, 'r') as f:
            schema_script = f.read()
            conn.executescript(schema_script)
            conn.commit()

    conn.close()
