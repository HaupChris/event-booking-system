import os
import sqlite3
from sqlite3 import Connection
from typing import List

from src.models.datatypes import FormContent


def init_db(db_file_path: str, schema_paths: List[str], form_content: FormContent) -> None:
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

        _init_db_data(conn, form_content)

    conn.close()


def _init_db_data(connection: Connection, form_content: FormContent):
    """
    Initialize the database with data from form_content.json
    This ensures tables like WorkShifts, TimeSlots, etc. are populated
    """
    cursor = connection.cursor()

    try:
        # Check if data already exists
        cursor.execute("SELECT COUNT(*) FROM WorkShifts")
        if cursor.fetchone()[0] > 0:
            print("WorkShifts table already has data. Skipping initialization.")
            return

        # Load form content

        # Begin transaction
        connection.execute("BEGIN TRANSACTION")

        # Insert TicketOptions
        for idx, ticket in enumerate(form_content.ticket_options):
            cursor.execute(
                "INSERT INTO TicketOptions (id, title, price, amount) VALUES (?, ?, ?, ?)",
                (idx, ticket.title, ticket.price, ticket.amount)
            )

        # Insert BeverageOptions
        for idx, beverage in enumerate(form_content.beverage_options):
            cursor.execute(
                "INSERT INTO BeverageOptions (id, title, description, price) VALUES (?, ?, ?, ?)",
                (idx, beverage.title, beverage.description, beverage.price)
            )

        # Insert FoodOptions
        for idx, food in enumerate(form_content.food_options):
            cursor.execute(
                "INSERT INTO FoodOptions (id, title, description, price) VALUES (?, ?, ?, ?)",
                (idx, food.title, food.description, food.price)
            )

        # Insert Materials
        for idx, material in enumerate(form_content.materials):
            cursor.execute(
                "INSERT INTO Materials (id, title, num_needed) VALUES (?, ?, ?)",
                (idx, material.title, material.num_needed)
            )

        # Insert WorkShifts and TimeSlots
        for ws_idx, workshift in enumerate(form_content.work_shifts):
            # Insert WorkShift
            cursor.execute(
                "INSERT INTO WorkShifts (id, title, description) VALUES (?, ?, ?)",
                (ws_idx, workshift.title, workshift.description)
            )

            # Insert TimeSlots for this WorkShift
            for ts_idx, timeslot in enumerate(workshift.time_slots):
                global_ts_idx = int(f"{ws_idx}{ts_idx}")  # Create a unique ID
                cursor.execute(
                    """
                    INSERT INTO TimeSlots
                        (id, title, start_time, end_time, num_needed, workshift_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        global_ts_idx,
                        timeslot.title,
                        timeslot.start_time,
                        timeslot.end_time,
                        timeslot.num_needed,
                        ws_idx
                    )
                )

        connection.commit()
        print("Database initialized with data from form_content.json")

    except Exception as e:
        connection.rollback()
        print(f"Error initializing database: {e}")
    finally:
        connection.close()
