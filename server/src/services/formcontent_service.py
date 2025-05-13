import json
import os
import sqlite3
from dataclasses import asdict
from typing import Callable

from src.models.datatypes import (
    FormContent,
    TicketOption, BeverageOption, FoodOption, WorkShift, TimeSlot, Material, ArtistMaterial, ArtistFormContent,
    Profession
)

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../data')
FORM_CONTENT_PATH = os.path.join(DATA_DIR, 'form_content.json')


def get_form_content_obj() -> FormContent:
    """
    Loads and returns a FormContent object from JSON (without DB-based booked counts).
    """
    with open(FORM_CONTENT_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Reconstruct the nested objects with IDs
    # We'll auto-assign IDs in a consistent manner
    ticket_options = [
        TicketOption(id=idx, **ticket)
        for idx, ticket in enumerate(data['ticket_options'])
    ]
    beverage_options = [
        BeverageOption(id=idx, **bev)
        for idx, bev in enumerate(data['beverage_options'])
    ]
    food_options = [
        FoodOption(id=idx, **food)
        for idx, food in enumerate(data['food_options'])
    ]

    professions = [
        Profession(id=idx, **profession)
        for idx, profession in enumerate(data.get('professions', []))
    ]

    # For work_shifts, we also auto-assign shift.id and timeslot.id
    work_shifts: list[WorkShift] = []
    timeslot_global_id = 0
    for ws_id, ws_data in enumerate(data['work_shifts']):
        timeslots_list = []
        for ts_data in ws_data['time_slots']:
            ts = TimeSlot(
                id=timeslot_global_id,
                title=ts_data['title'],
                start_time=ts_data['start_time'],
                end_time=ts_data['end_time'],
                num_needed=ts_data['num_needed']
            )
            timeslot_global_id += 1
            timeslots_list.append(ts)
        work_shifts.append(
            WorkShift(
                id=ws_id,
                title=ws_data['title'],
                description=ws_data['description'],
                time_slots=timeslots_list
            )
        )

    materials = [
        Material(id=idx, **material)
        for idx, material in enumerate(data['materials'])
    ]

    # For artist materials
    artist_materials = [
        ArtistMaterial(id=idx, **am)
        for idx, am in enumerate(data.get('artist_materials', []))
    ]

    return FormContent(
        ticket_options=ticket_options,
        beverage_options=beverage_options,
        food_options=food_options,
        work_shifts=work_shifts,
        materials=materials,
        artist_materials=artist_materials,
        professions=professions
    )


def get_artist_form_content_obj() -> ArtistFormContent:
    """
    Loads and returns an ArtistFormContent object from JSON.
    """
    ARTIST_FORM_CONTENT_PATH = os.path.join(DATA_DIR, 'artist_form_content.json')

    with open(ARTIST_FORM_CONTENT_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Reconstruct the nested objects with IDs
    ticket_options = [
        TicketOption(id=idx, **ticket)
        for idx, ticket in enumerate(data['ticket_options'])
    ]
    beverage_options = [
        BeverageOption(id=idx, **bev)
        for idx, bev in enumerate(data['beverage_options'])
    ]
    food_options = [
        FoodOption(id=idx, **food)
        for idx, food in enumerate(data['food_options'])
    ]

    artist_materials = [
        ArtistMaterial(id=idx, **am)
        for idx, am in enumerate(data['artist_materials'])
    ]

    professions = [
        Profession(id=idx, **profession)
        for idx, profession in enumerate(data.get('professions', []))
    ]

    return ArtistFormContent(
        ticket_options=ticket_options,
        beverage_options=beverage_options,
        food_options=food_options,
        artist_materials=artist_materials,
        professions=professions
    )


def update_form_content_with_db_counts(
        form_content_obj: FormContent,
        db_connect_func: Callable[[], sqlite3.Connection]
) -> dict:
    """
    Given a loaded FormContent object and a DB connection function,
    queries the DB for existing bookings, updates num_booked fields,
    and returns a dictionary.
    """
    conn = db_connect_func()
    cursor = conn.cursor()

    # TICKETS
    cursor.execute("SELECT ticket_option_id, COUNT(*) FROM Bookings GROUP BY ticket_option_id")
    ticket_bookings = dict(cursor.fetchall())

    # BEVERAGE
    cursor.execute("SELECT beverage_option_id, COUNT(*) FROM Bookings GROUP BY beverage_option_id")
    beverage_bookings = dict(cursor.fetchall())

    # FOOD
    cursor.execute("SELECT food_option_id, COUNT(*) FROM Bookings GROUP BY food_option_id")
    food_bookings = dict(cursor.fetchall())

    # MATERIAL
    cursor.execute("SELECT material_id, COUNT(*) FROM BookingMaterials GROUP BY material_id")
    material_bookings = dict(cursor.fetchall())

    # ARTIST MATERIAL
    cursor.execute("SELECT artist_material_id, COUNT(*) FROM BookingArtistMaterials GROUP BY artist_material_id")
    artist_material_bookings = dict(cursor.fetchall())

    # Update the in-memory object section, add after the Materials section:

    # Artist Materials
    for am in form_content_obj.artist_materials:
        am.num_booked = artist_material_bookings.get(am.id, 0)

    # TIMESLOT: first priority
    cursor.execute("""
                   SELECT first_priority_timeslot_id, COUNT(*)
                   FROM Bookings
                   WHERE first_priority_timeslot_id IS NOT NULL
                   GROUP BY first_priority_timeslot_id
                   """)
    timeslot_bookings_1 = dict(cursor.fetchall())

    # second priority
    cursor.execute("""
                   SELECT second_priority_timeslot_id, COUNT(*)
                   FROM Bookings
                   WHERE second_priority_timeslot_id IS NOT NULL
                     AND amount_shifts >= 2
                   GROUP BY second_priority_timeslot_id
                   """)
    timeslot_bookings_2 = dict(cursor.fetchall())

    # third priority
    cursor.execute("""
                   SELECT third_priority_timeslot_id, COUNT(*)
                   FROM Bookings
                   WHERE third_priority_timeslot_id IS NOT NULL
                     AND amount_shifts >= 3
                   GROUP BY third_priority_timeslot_id
                   """)
    timeslot_bookings_3 = dict(cursor.fetchall())

    conn.close()

    # Now update the in-memory object
    # Ticket
    for t in form_content_obj.ticket_options:
        t.num_booked = ticket_bookings.get(t.id, 0)

    # Beverage
    for b in form_content_obj.beverage_options:
        b.num_booked = beverage_bookings.get(b.id, 0)

    # Food
    for f in form_content_obj.food_options:
        f.num_booked = food_bookings.get(f.id, 0)

    # Materials
    for m in form_content_obj.materials:
        m.num_booked = material_bookings.get(m.id, 0)

    # Timeslots
    for ws in form_content_obj.work_shifts:
        for ts in ws.time_slots:
            num1 = timeslot_bookings_1.get(ts.id, 0)
            num2 = timeslot_bookings_2.get(ts.id, 0)
            num3 = timeslot_bookings_3.get(ts.id, 0)
            ts.num_booked = num1 + num2 + num3

    return asdict(form_content_obj)


def update_artist_form_content_with_db_counts(
        form_content_obj: FormContent,
        db_connect_func: Callable[[], sqlite3.Connection]
) -> dict:
    """
    Given a loaded FormContent object and a DB connection function,
    queries the DB for existing bookings, updates num_booked fields,
    and returns a dictionary.
    """
    conn = db_connect_func()
    cursor = conn.cursor()

    # TICKETS
    cursor.execute("SELECT ticket_option_id, COUNT(*) FROM ArtistBookings GROUP BY ticket_option_id")
    ticket_bookings = dict(cursor.fetchall())

    # BEVERAGE
    cursor.execute("SELECT beverage_option_id, COUNT(*) FROM ArtistBookings GROUP BY beverage_option_id")
    beverage_bookings = dict(cursor.fetchall())

    # FOOD
    cursor.execute("SELECT food_option_id, COUNT(*) FROM ArtistBookings GROUP BY food_option_id")
    food_bookings = dict(cursor.fetchall())

    # ARTISTMAterials
    cursor.execute("SELECT artist_material_id, COUNT(*) FROM ArtistBookingMaterials GROUP BY artist_material_id")
    artist_material_bookings = dict(cursor.fetchall())

    # Update the in-memory object section, add after the Materials section:

    # Artist Materials
    for am in form_content_obj.artist_materials:
        am.num_booked = artist_material_bookings.get(am.id, 0)

    conn.close()

    # Now update the in-memory object
    # Ticket
    for t in form_content_obj.ticket_options:
        t.num_booked = ticket_bookings.get(t.id, 0)

    # Beverage
    for b in form_content_obj.beverage_options:
        b.num_booked = beverage_bookings.get(b.id, 0)

    # Food
    for f in form_content_obj.food_options:
        f.num_booked = food_bookings.get(f.id, 0)

    # Materials
    for m in form_content_obj.artist_materials:
        m.num_booked = artist_material_bookings.get(m.id, 0)

    return asdict(form_content_obj)
