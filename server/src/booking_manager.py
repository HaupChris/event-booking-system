import sqlite3
from contextlib import closing
from typing import Dict
import json
import os
from dataclasses import asdict
from views import FormContent, Booking


# define your table schema here

class BookingManager:
    def __init__(self, json_path: str, db_dir: str):
        self.json_path = json_path
        self.db_dir = db_dir
        self.db_file_path = os.path.join(self.db_dir, 'bookings.db')
        self.form_content = self.load_form_content()
        self.db_connection = self.connect_db()


    def connect_db(self) -> sqlite3.Connection:
        """
        This function connects to the sqlite database using sqlite3. If it does not exist, it is created using the schema {self.db_dir}/schema.sql.
        """
        new_creation = True

        conn = sqlite3.connect(self.db_file_path)

        with open(os.path.join(self.db_dir, "schema.sql"), 'r') as f:
            conn.executescript(f.read())
            conn.commit()

            if new_creation:
                self._insert_form_content(conn)

        return conn

    def _insert_form_content(self, connection: sqlite3.Connection) -> None:
        # Insert ticket options
        for idx, ticket_option in enumerate(self.form_content.ticket_options):
            connection.execute("INSERT INTO TicketOptions (id, title, price, amount) VALUES (?, ?, ?, ?)", (
                idx, ticket_option.title, ticket_option.price, ticket_option.amount))

        # Insert beverage options
        for idx, beverage_option in enumerate(self.form_content.beverage_options):
            connection.execute("INSERT INTO BeverageOptions (title, description, price) VALUES (?, ?, ?, ?)", (
                idx, beverage_option.title, beverage_option.description, beverage_option.price))

        # Insert work shifts
        for idx, work_shift in enumerate(self.form_content.work_shifts):
            connection.execute("INSERT INTO WorkShifts (id, title, description) VALUES (?, ?, ?)", (
                idx, work_shift.title, work_shift.description))
            for timeslot_idx, time_slot in work_shift.time_slots:
                connection.execute("INSERT INTO TimeSlots (id, title, start_time, end_time, needed_workers, taken_workers, workshift_id) VALUES (?, ?, ?, ?, ?, ?, ?)", (
                    timeslot_idx, time_slot.title, time_slot.start_time, time_slot.end_time, time_slot.needed_workers, time_slot.taken_workers, idx))


        # Insert materials
        for material in self.form_content.materials:
            connection.execute("INSERT INTO Materials (title, num_needed) VALUES (?, ?)", (
                material.title, material.num_needed))



        connection.commit()

        #

    def load_form_content(self) -> FormContent:
        with open(self.json_path, 'r') as file:
            data = json.load(file)
        form_content = FormContent.from_dict(data)
        return form_content

    def get_form_content(self) -> Dict:
        """
        This function should fetch form content based on initial configuration and bookings from the database.
        Here you would fetch data from your database and adjust self.form_content accordingly.
        For simplicity, it just returns the initial form content now.
        """

        # TODO: Fetch data from the database and adjust form_content here

        return asdict(self.form_content)

    def insert_booking(self, booking: Booking):
        with closing(sqlite3.connect('bookings.db')) as connection:
            cursor = connection.cursor()

            # First, we'll insert the user's information into the Users table
            cursor.execute(
                "INSERT INTO Users (last_name, first_name, street, postal_code, city, phone_number) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    booking.last_name, booking.first_name, booking.street, booking.postal_code, booking.city,
                    booking.phone))

            user_id = cursor.lastrowid

            # Next, we'll get the IDs for the selected ticket option, beverage option, and work shifts
            ticket_option_id = \
                cursor.execute("SELECT id FROM TicketOptions WHERE title = ?", (booking.ticket_title,)).fetchone()[0]
            beverage_option_id = \
                cursor.execute('SELECT id FROM BeverageOptions WHERE title = ?', (booking.beverage_title,)).fetchone()[
                    0]
            work_shift_priority_1_id = \
                cursor.execute('SELECT id FROM WorkShifts WHERE title = ?',
                               (booking.work_shift_priority_1,)).fetchone()[0]
            work_shift_priority_2_id = \
                cursor.execute('SELECT id FROM WorkShifts WHERE title = ?',
                               (booking.work_shift_priority_2,)).fetchone()[0]
            work_shift_priority_3_id = \
                cursor.execute('SELECT id FROM WorkShifts WHERE title = ?',
                               (booking.work_shift_priority_3,)).fetchone()[0]

            # Then, we'll insert the booking itself into the Bookings table
            cursor.execute('''
                INSERT INTO Bookings (user_id, ticket_option_id, beverage_option_id, first_priority_workshift_id, second_priority_workshift_id, third_priority_workshift_id, amount_shifts, signature, total_price, is_paid)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
            ''', (user_id, ticket_option_id, beverage_option_id, work_shift_priority_1_id, work_shift_priority_2_id,
                  work_shift_priority_3_id, booking.amount_shifts, booking.signature, booking.total_price))

            connection.commit()


if __name__ == "__main__":
    booking_manager = BookingManager(json_path='../form_content.json', db_dir='../db')
    print(booking_manager.get_form_content())
