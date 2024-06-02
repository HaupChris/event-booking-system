import base64
import sqlite3
from contextlib import closing
from datetime import datetime
from typing import Dict, List
import json
import os
from dataclasses import asdict
from .views import FormContent, Booking, BookingWithTimestamp


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
        new_creation = not os.path.exists(self.db_file_path)

        conn = sqlite3.connect(self.db_file_path)

        with open(os.path.join(self.db_dir, "schema.sql"), 'r') as f:
            conn.executescript(f.read())
            conn.commit()

            if new_creation:
                self._insert_form_content(conn)

        return conn

    def _insert_form_content(self, connection: sqlite3.Connection) -> None:
        # Insert ticket options
        for ticket_option in self.form_content.ticket_options:
            connection.execute("INSERT INTO TicketOptions (id, title, price, amount) VALUES (?, ?, ?, ?)", (
                ticket_option.id, ticket_option.title, ticket_option.price, ticket_option.amount))

        # Insert beverage options
        for beverage_option in self.form_content.beverage_options:
            connection.execute("INSERT INTO BeverageOptions (id, title, description, price) VALUES (?, ?, ?, ?)", (
                beverage_option.id, beverage_option.title, beverage_option.description, beverage_option.price))

        # Insert food options
        for food_option in self.form_content.food_options:
            connection.execute("INSERT INTO FoodOptions (id, title, description, price) VALUES (?, ?, ?, ?)", (
                food_option.id, food_option.title, food_option.description, food_option.price))

        # Insert work shifts
        for work_shift in self.form_content.work_shifts:
            connection.execute("INSERT INTO WorkShifts (id, title, description) VALUES (?, ?, ?)", (
                work_shift.id, work_shift.title, work_shift.description))
            for time_slot in work_shift.time_slots:
                connection.execute(
                    "INSERT INTO TimeSlots (id, title, start_time, end_time, num_needed, workshift_id) VALUES (?, ?, ?, ?, ?, ?)",
                    (
                        time_slot.id, time_slot.title, time_slot.start_time, time_slot.end_time,
                        time_slot.num_needed, work_shift.id))

        # Insert materials
        for material in self.form_content.materials:
            connection.execute("INSERT INTO Materials (id, title, num_needed) VALUES (?, ?, ?)", (
                material.id, material.title, material.num_needed))

        connection.commit()

        #

    def load_form_content(self) -> FormContent:
        with open(self.json_path, 'r') as file:
            data = json.load(file)
        form_content = FormContent.from_dict(data)
        return form_content

    def get_up_to_date_form_content(self) -> Dict:
        """
        Fetches form content based on initial configuration, updated with the bookings from the database.
        Depending on the already happened bookings, form content can be different form the initial state.
        """

        conn = sqlite3.connect(self.db_file_path)
        c = conn.cursor()

        # Get count of booked tickets, beverages, and materials
        c.execute("SELECT ticket_option_id, COUNT(*) FROM Bookings GROUP BY ticket_option_id")
        ticket_bookings = {row[0]: row[1] for row in c.fetchall()}

        c.execute("SELECT beverage_option_id, COUNT(*) FROM Bookings GROUP BY beverage_option_id")
        beverage_bookings = {row[0]: row[1] for row in c.fetchall()}

        c.execute("SELECT food_option_id, COUNT(*) FROM Bookings GROUP BY food_option_id")
        food_bookings = {row[0]: row[1] for row in c.fetchall()}

        c.execute("SELECT material_id, COUNT(*) FROM BookingMaterials GROUP BY material_id")
        material_bookings = {row[0]: row[1] for row in c.fetchall()}

        # Get count of booked timeslots
        c.execute("""
            SELECT first_priority_timeslot_id, COUNT(*) FROM Bookings
            WHERE first_priority_timeslot_id IS NOT NULL
            GROUP BY first_priority_timeslot_id
        """)
        timeslot_bookings_1 = {row[0]: row[1] for row in c.fetchall()}

        c.execute("""
            SELECT second_priority_timeslot_id, COUNT(*) FROM Bookings
            WHERE second_priority_timeslot_id IS NOT NULL
            GROUP BY second_priority_timeslot_id
        """)
        timeslot_bookings_2 = {row[0]: row[1] for row in c.fetchall()}

        c.execute("""
            SELECT third_priority_timeslot_id, COUNT(*) FROM Bookings
            WHERE third_priority_timeslot_id IS NOT NULL
            GROUP BY third_priority_timeslot_id
        """)
        timeslot_bookings_3 = {row[0]: row[1] for row in c.fetchall()}

        conn.close()

        # Adjust form_content with booking data
        form_content_dict = asdict(self.form_content)

        for ticket_option in form_content_dict['ticket_options']:
            ticket_option['num_booked'] = ticket_bookings.get(ticket_option['id'], 0)

        for beverage_option in form_content_dict['beverage_options']:
            beverage_option['num_booked'] = beverage_bookings.get(beverage_option['id'], 0)

        for food_option in form_content_dict['food_options']:
            food_option['num_booked'] = food_bookings.get(food_option['id'], 0)

        for material in form_content_dict['materials']:
            material['num_booked'] = material_bookings.get(material['id'], 0)

        for work_shift in form_content_dict['work_shifts']:
            for timeslot in work_shift['time_slots']:
                timeslot['num_booked'] = timeslot_bookings_1.get(timeslot['id'], 0)

        return form_content_dict

    def insert_booking(self, booking: Booking):
        booking_timestamp = datetime.now().strftime("%Y-%m-%d-%H:%M:%S")

        with closing(sqlite3.connect(self.db_file_path)) as connection:
            cursor = connection.cursor()

            # First, we'll insert the user's information into the Users table
            cursor.execute("""
                INSERT INTO Users (last_name, first_name, email, phone_number) VALUES (?, ?, ?, ?)
                """, (
                booking.last_name, booking.first_name, booking.email,
                booking.phone))

            user_id = cursor.lastrowid  # Get the ID of the last inserted row

            # Then we'll insert the booking into the Bookings table
            cursor.execute("""
                INSERT INTO Bookings (user_id, ticket_option_id, beverage_option_id, food_option_id, first_priority_timeslot_id, second_priority_timeslot_id, third_priority_timeslot_id, amount_shifts, supporter_buddy, signature, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (user_id, booking.ticket_id, booking.beverage_id, booking.food_id, booking.timeslot_priority_1,
                      booking.timeslot_priority_2, booking.timeslot_priority_3, booking.amount_shifts, booking.supporter_buddy,
                      booking.signature, booking.total_price))
            booking_id = cursor.lastrowid

            # Then we'll insert the materials into the Materials table
            for material_id in booking.material_ids:
                cursor.execute("""
                    INSERT INTO BookingMaterials (booking_id, material_id) VALUES (?, ?)
                    """, (booking_id, material_id))

            connection.commit()

            self.save_signature_image(booking)

    def check_email_exists(self, email: str) -> bool:
        with closing(sqlite3.connect(self.db_file_path)) as connection:
            cursor = connection.cursor()

            cursor.execute("SELECT * FROM Users WHERE email=?", (email,))
            return cursor.fetchone() is not None

    def save_signature_image(self, booking: Booking):
        # remove header if exists
        signature = booking.signature.split(',')[1] if ',' in booking.signature else booking.signature

        if not os.path.exists(os.path.join(self.db_dir, 'signatures')):
            os.makedirs(os.path.join(self.db_dir, 'signatures'))

        # decode base64 string
        img_data = base64.b64decode(signature)
        file_path = os.path.join(self.db_dir, 'signatures', f'{booking.last_name}_{booking.first_name}.png')
        # write to a file
        with open(file_path, 'wb') as file:
            file.write(img_data)

    def get_all_bookings(self) -> List[BookingWithTimestamp]:
        with closing(sqlite3.connect(self.db_file_path)) as connection:
            cursor = connection.cursor()

            cursor.execute("""
                SELECT 
                    b.id as booking_id,
                    u.last_name, 
                    u.first_name, 
                    u.email, 
                    u.phone_number, 
                    b.ticket_option_id, 
                    b.beverage_option_id, 
                    b.food_option_id,
                    b.first_priority_timeslot_id, 
                    b.second_priority_timeslot_id, 
                    b.third_priority_timeslot_id, 
                    b.amount_shifts, 
                    b.supporter_buddy,
                    b.total_price,
                    b.Timestamp, 
                    b.signature                    
                FROM Users u
                JOIN Bookings b ON u.id = b.user_id
            """)

            rows = cursor.fetchall()

            bookings = []
            for row in rows:
                # For each row, fetch the material_ids
                cursor.execute("""
                    SELECT material_id 
                    FROM BookingMaterials 
                    WHERE booking_id = ?
                """, (row[0],))

                material_ids = [item[0] for item in cursor.fetchall()]

                booking = BookingWithTimestamp(
                    last_name=row[1],
                    first_name=row[2],
                    email=row[3],
                    phone=row[4],
                    ticket_id=row[5],
                    beverage_id=row[6],
                    food_id=row[7],
                    timeslot_priority_1=row[8],
                    timeslot_priority_2=row[9],
                    timeslot_priority_3=row[10],
                    material_ids=material_ids,
                    amount_shifts=row[11],
                    supporter_buddy=row[12],
                    total_price=row[13],
                    timestamp=row[14],
                    signature=row[15] if row[15] else ''
                )
                bookings.append(booking)

            return bookings


if __name__ == "__main__":
    booking_manager = BookingManager(json_path='../form_content.json', db_dir='../db')

    dummy_booking = Booking(
        last_name="Doe",
        first_name="John",
        street="Doe Street 1",
        postal_code="1234",
        city="Doe City",
        email="j.d@web.de",
        phone="0123456789",
        ticket_id=1,
        beverage_id=1,
        timeslot_priority_1=0,
        timeslot_priority_2=1,
        timeslot_priority_3=2,
        amount_shifts=2,
        total_price=100,
        material_ids=[1, 2, 3]
    )
    booking_manager.insert_booking(dummy_booking)
    for k, v in booking_manager.get_up_to_date_form_content().items():
        print(k, v)
    # booking_manager.get_form_content()