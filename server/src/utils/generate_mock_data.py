
import sqlite3
import random
import json
from datetime import datetime
import argparse
from pathlib import Path

# Ensure imports work when script is run directly
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from src.models.datatypes import Booking, ArtistBooking
from src.services.booking_service import insert_booking, _connect_db, DB_FILE_PATH
from src.services.artist_service import insert_artist_booking
from src.services.formcontent_service import get_form_content_obj, get_artist_form_content_obj


def generate_mock_signature():
    """
    Generates a mock base64 signature placeholder.
    """
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="


def generate_mock_email(first_name, last_name):
    """
    Generates a mock email based on first and last name.
    """
    domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com']
    return f"{first_name.lower()}.{last_name.lower()}@{random.choice(domains)}"


def generate_mock_phone():
    """
    Generates a mock phone number.
    """
    return f"+49 {random.randint(100, 999)} {random.randint(1000000, 9999999)}"


def generate_mock_name():
    """
    Generates a mock first and last name.
    """
    first_names = [
        "Anna", "Max", "Sophie", "Paul", "Emma", "Felix", "Lena", "Tim", "Laura", "Jonas",
        "Julia", "David", "Sarah", "Lukas", "Lisa", "Noah", "Marie", "Leon", "Leonie", "Finn",
        "Hannah", "Jan", "Lara", "Tom", "Amelie", "Lucas", "Lea", "Simon", "Emilia", "Ben",
        "Johanna", "Niklas", "Katharina", "Daniel", "Charlotte", "Philipp", "Sophia", "Fabian",
        "Maria", "Alexander", "Lina", "Florian", "Nele", "Julian", "Mia", "Michael", "Antonia",
        "Maximilian", "Helena", "Christopher", "Olivia", "Jakob", "Emily", "Leo", "Lotta"
    ]

    last_names = [
        "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker",
        "Schulz", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder",
        "Neumann", "Schwarz", "Zimmermann", "Braun", "Krüger", "Hofmann", "Hartmann", "Lange",
        "Schmitt", "Werner", "Schmitz", "Krause", "Meier", "Lehmann", "Schmid", "Schulze", "Maier",
        "Köhler", "Herrmann", "König", "Walter", "Mayer", "Huber", "Kaiser", "Fuchs", "Peters",
        "Lang", "Scholz", "Möller", "Weiß", "Jung", "Hahn", "Schubert", "Vogel", "Friedrich"
    ]

    return random.choice(first_names), random.choice(last_names)


def generate_mock_artists_data(num_artists, form_content):
    """
    Generates mock artist bookings.
    """
    artists = []

    # Extract options from form content
    ticket_options = form_content['ticket_options']
    beverage_options = form_content['beverage_options']
    food_options = form_content['food_options']
    artist_materials = form_content['artist_materials']
    professions = form_content.get('professions', [])

    for _ in range(num_artists):
        first_name, last_name = generate_mock_name()

        # Generate performance details as JSON
        genres = ['Rock', 'Pop', 'Electronic', 'Hip Hop', 'Folk', 'Jazz', 'Classical', 'Indie', 'Metal', 'Reggae',
                  'Funk']
        days = ['Donnerstag', 'Freitag', 'Samstag']
        times = ['Nachmittag', 'Abend', 'Nacht']
        durations = [30, 45, 60, 90, 120]

        performance_details = {
            "preferredDay": random.choice(days),
            "preferredTime": random.choice(times),
            "duration": random.choice(durations),
            "genre": random.choice(genres),
            "description": f"Mock performance by {first_name} {last_name}",
            "bandMembers": random.randint(1, 5)
        }

        # Choose random options
        ticket_id = random.choice(ticket_options).id
        beverage_id = random.choice(beverage_options).id
        food_id = random.choice(food_options).id

        # Random selection of materials
        num_materials = random.randint(0, min(5, len(artist_materials)))
        material_ids = random.sample([m.id for m in artist_materials], num_materials) if num_materials > 0 else []

        # Random selection of professions
        num_professions = random.randint(0, min(3, len(professions)))
        profession_ids = random.sample([p.id for p in professions], num_professions) if num_professions > 0 else []

        # Calculate price
        ticket_price = next((t.price for t in ticket_options if t.id == ticket_id), 0)
        beverage_price = next((b.price for b in beverage_options if b.id == beverage_id), 0)
        food_price = next((f.price for f in food_options if f.id == food_id), 0)
        total_price = ticket_price + beverage_price + food_price

        # Create artist booking
        artist = ArtistBooking(
            first_name=first_name,
            last_name=last_name,
            email=generate_mock_email(first_name, last_name),
            phone=generate_mock_phone(),
            ticket_id=ticket_id,
            beverage_id=beverage_id,
            food_id=food_id,
            artist_material_ids=material_ids,
            profession_ids=profession_ids,
            total_price=total_price,
            signature=generate_mock_signature(),
            is_paid=random.choice([True, False]),
            paid_amount=total_price if random.random() > 0.3 else 0,
            payment_notes="",
            payment_date=datetime.now().strftime("%Y-%m-%d") if random.random() > 0.3 else "",
            equipment=f"Mock equipment needs for {first_name} {last_name}",
            special_requests=f"Mock special requests for {first_name} {last_name}" if random.random() > 0.7 else "",
            performance_details=json.dumps(performance_details)
        )

        artists.append(artist)

    return artists


def generate_mock_bookings_data(num_bookings, form_content):
    """
    Generates mock regular participant bookings.
    """
    bookings = []

    # Extract options from form content
    ticket_options = form_content['ticket_options']
    beverage_options = form_content['beverage_options']
    food_options = form_content['food_options']
    materials = form_content['materials']
    work_shifts = form_content['work_shifts']
    professions = form_content.get('professions', [])

    # Flatten timeslots for easier selection
    all_timeslots = []
    for shift in work_shifts:
        for timeslot in shift.time_slots:
            all_timeslots.append(timeslot.id)

    for _ in range(num_bookings):
        first_name, last_name = generate_mock_name()

        # Choose random options
        ticket_id = random.choice(ticket_options).id
        beverage_id = random.choice(beverage_options).id
        food_id = random.choice(food_options).id

        # Random selection of materials
        num_materials = random.randint(0, min(3, len(materials)))
        material_ids = random.sample([m.id for m in materials], num_materials) if num_materials > 0 else []

        # Random selection of professions
        num_professions = random.randint(0, min(2, len(professions)))
        profession_ids = random.sample([p.id for p in professions], num_professions) if num_professions > 0 else []

        # Random work shift preferences (1-3 unique timeslots)
        amount_shifts = random.randint(1, 3)

        # Ensure unique timeslots for preferences
        if len(all_timeslots) >= 3:
            timeslot_preferences = random.sample(all_timeslots, 3)
            timeslot_priority_1 = timeslot_preferences[0]
            timeslot_priority_2 = timeslot_preferences[1]
            timeslot_priority_3 = timeslot_preferences[2]
        else:
            # Fallback if not enough timeslots
            timeslot_priority_1 = random.choice(all_timeslots) if all_timeslots else -1
            timeslot_priority_2 = -1
            timeslot_priority_3 = -1

        # Calculate price
        ticket_price = next((t.price for t in ticket_options if t.id == ticket_id), 0)
        beverage_price = next((b.price for b in beverage_options if b.id == beverage_id), 0)
        food_price = next((f.price for f in food_options if f.id == food_id), 0)
        total_price = ticket_price + beverage_price + food_price

        # Maybe add a supporter buddy
        supporter_buddy = ""
        if random.random() > 0.7:
            buddy_first, buddy_last = generate_mock_name()
            supporter_buddy = f"{buddy_first} {buddy_last}"

        # Create booking
        booking = Booking(
            first_name=first_name,
            last_name=last_name,
            email=generate_mock_email(first_name, last_name),
            phone=generate_mock_phone(),
            ticket_id=ticket_id,
            beverage_id=beverage_id,
            food_id=food_id,
            timeslot_priority_1=timeslot_priority_1,
            timeslot_priority_2=timeslot_priority_2,
            timeslot_priority_3=timeslot_priority_3,
            material_ids=material_ids,
            profession_ids=profession_ids,
            amount_shifts=amount_shifts,
            supporter_buddy=supporter_buddy,
            total_price=total_price,
            signature=generate_mock_signature(),
            is_paid=random.choice([True, False]),
            paid_amount=total_price if random.random() > 0.3 else 0,
            payment_notes="",
            payment_date=datetime.now().strftime("%Y-%m-%d") if random.random() > 0.3 else "",
            artist_material_ids=[]  # Not used for regular bookings
        )

        bookings.append(booking)

    return bookings


def main():
    parser = argparse.ArgumentParser(description='Generate mock data for testing')
    parser.add_argument('--participants', type=int, default=150, help='Number of participants to generate')
    parser.add_argument('--artists', type=int, default=20, help='Number of artists to generate')
    parser.add_argument('--force', action='store_true', help='Force overwrite existing bookings')
    args = parser.parse_args()

    # Connect to database
    conn = _connect_db()
    cursor = conn.cursor()

    # Check if bookings already exist
    cursor.execute("SELECT COUNT(*) FROM Bookings")
    booking_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM ArtistBookings")
    artist_booking_count = cursor.fetchone()[0]

    if (booking_count > 0 or artist_booking_count > 0) and not args.force:
        print(f"Database already contains {booking_count} bookings and {artist_booking_count} artist bookings.")
        print("Use --force to overwrite existing data.")
        return

    # Clear existing data if --force
    if args.force:
        print("Clearing existing bookings data...")
        cursor.execute("DELETE FROM BookingMaterials")
        cursor.execute("DELETE FROM BookingProfessions")
        cursor.execute("DELETE FROM BookingArtistMaterials")
        cursor.execute("DELETE FROM Bookings")
        cursor.execute("DELETE FROM Users")
        cursor.execute("DELETE FROM ArtistBookingMaterials")
        cursor.execute("DELETE FROM ArtistBookingProfessions")
        cursor.execute("DELETE FROM ArtistBookings")
        cursor.execute("DELETE FROM Artists")

        # Also clear any existing shift assignments
        try:
            cursor.execute("DELETE FROM ShiftAssignments")
        except sqlite3.OperationalError:
            print("ShiftAssignments table doesn't exist yet (that's ok)")

        conn.commit()

    print(f"Generating {args.participants} participant bookings and {args.artists} artist bookings...")

    # Load form content for options
    form_content = get_form_content_obj()
    form_content_dict = vars(form_content)

    artist_form_content = get_artist_form_content_obj()
    artist_form_content_dict = vars(artist_form_content)

    # Generate mock data
    bookings = generate_mock_bookings_data(args.participants, form_content_dict)
    artists = generate_mock_artists_data(args.artists, artist_form_content_dict)

    # Insert mock bookings
    successful_bookings = 0
    for booking in bookings:
        if insert_booking(booking):
            successful_bookings += 1

    # Insert mock artist bookings
    successful_artists = 0
    for artist in artists:
        if insert_artist_booking(artist):
            successful_artists += 1

    print(f"Successfully created {successful_bookings}/{args.participants} participant bookings")
    print(f"Successfully created {successful_artists}/{args.artists} artist bookings")

    # Close database connection
    conn.close()


if __name__ == "__main__":
    main()