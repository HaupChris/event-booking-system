import sqlite3


def init_db(db_file_path: str, schema_path: str) -> None:
    """
    Creates the SQLite database and applies the schema if not already done.
    """
    # Connect to the DB
    conn = sqlite3.connect(db_file_path)

    # Read schema.sql
    with open(schema_path, 'r') as f:
        schema_script = f.read()
        conn.executescript(schema_script)
        conn.commit()

    conn.close()
