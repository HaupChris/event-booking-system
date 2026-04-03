import os
import sqlite3
from sqlite3 import Connection

from src.models.datatypes import FormContent


def init_db(db_file_path: str, schema_paths: list[str], form_content: FormContent) -> None:
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
        with open(schema_path) as f:
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
                """
                INSERT INTO TicketOptions (id, title, working_title, price, amount, requires_workshift)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    idx,
                    ticket.title,
                    ticket.working_title or ticket.title,
                    ticket.price,
                    ticket.amount,
                    1 if ticket.requires_workshift else 0,
                ),
            )

        # Insert BeverageOptions
        for idx, beverage in enumerate(form_content.beverage_options):
            cursor.execute(
                """
                INSERT INTO BeverageOptions (id, title, working_title, description, price)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    idx,
                    beverage.title,
                    beverage.working_title or beverage.title,
                    beverage.description,
                    beverage.price,
                ),
            )

        # Insert FoodOptions
        for idx, food in enumerate(form_content.food_options):
            cursor.execute(
                """
                INSERT INTO FoodOptions (id, title, working_title, description, price)
                VALUES (?, ?, ?, ?, ?)
                """,
                (idx, food.title, food.working_title or food.title, food.description, food.price),
            )

        # Insert Materials
        for idx, material in enumerate(form_content.materials):
            cursor.execute(
                "INSERT INTO Materials (id, title, num_needed) VALUES (?, ?, ?)",
                (idx, material.title, material.num_needed),
            )

        # Insert WorkShifts and TimeSlots
        for ws_idx, workshift in enumerate(form_content.work_shifts):
            # Insert WorkShift
            cursor.execute(
                """
                INSERT INTO WorkShifts (id, title, working_title, description, multiple_selection_possible)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    ws_idx,
                    workshift.title,
                    workshift.working_title,
                    workshift.description,
                    workshift.multiple_selection_possible,
                ),
            )

            # Insert TimeSlots for this WorkShift
            for ts_idx, timeslot in enumerate(workshift.time_slots):
                cursor.execute(
                    """
                    INSERT INTO TimeSlots
                        (id, title, working_title, start_time, end_time, num_needed, workshift_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        timeslot.id,
                        timeslot.title,
                        timeslot.working_title,
                        timeslot.start_time,
                        timeslot.end_time,
                        timeslot.num_needed,
                        ws_idx,
                    ),
                )

        connection.commit()
        print("Database initialized with data from form_content.json")

    except Exception as e:
        connection.rollback()
        print(f"Error initializing database: {e}")
    finally:
        connection.close()
