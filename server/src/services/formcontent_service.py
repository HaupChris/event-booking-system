import json
import os
import sqlite3
import time
import logging
from dataclasses import asdict
from typing import Callable

from src.models.datatypes import (
    FormContent,
    TicketOption, BeverageOption, FoodOption, WorkShift, TimeSlot, Material, ArtistMaterial, ArtistFormContent,
    Profession
)

# Initialize logger
logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../data')
FORM_CONTENT_PATH = os.path.join(DATA_DIR, 'form_content.json')


def get_form_content_obj() -> FormContent:
    """
    Loads and returns a FormContent object from JSON (without DB-based booked counts).
    """
    start_time = time.time()

    try:
        logger.debug(f"Loading form content from {FORM_CONTENT_PATH}")

        if not os.path.exists(FORM_CONTENT_PATH):
            logger.error(f"Form content file not found: {FORM_CONTENT_PATH}")
            raise FileNotFoundError(f"Form content file not found: {FORM_CONTENT_PATH}")

        with open(FORM_CONTENT_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)

        logger.debug("Form content JSON loaded successfully")

        # Reconstruct the nested objects with IDs
        # We'll auto-assign IDs in a consistent manner
        ticket_options = [
            TicketOption(id=idx, **ticket)
            for idx, ticket in enumerate(data['ticket_options'])
        ]
        logger.debug(f"Processed {len(ticket_options)} ticket options")

        beverage_options = [
            BeverageOption(id=idx, **bev)
            for idx, bev in enumerate(data['beverage_options'])
        ]
        logger.debug(f"Processed {len(beverage_options)} beverage options")

        food_options = [
            FoodOption(id=idx, **food)
            for idx, food in enumerate(data['food_options'])
        ]
        logger.debug(f"Processed {len(food_options)} food options")

        professions = [
            Profession(id=idx, **profession)
            for idx, profession in enumerate(data.get('professions', []))
        ]
        logger.debug(f"Processed {len(professions)} professions")

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
        logger.debug(f"Processed {len(work_shifts)} work shifts with {timeslot_global_id} total timeslots")

        materials = [
            Material(id=idx, **material)
            for idx, material in enumerate(data['materials'])
        ]
        logger.debug(f"Processed {len(materials)} materials")

        # For artist materials
        artist_materials = [
            ArtistMaterial(id=idx, **am)
            for idx, am in enumerate(data.get('artist_materials', []))
        ]
        logger.debug(f"Processed {len(artist_materials)} artist materials")

        form_content = FormContent(
            ticket_options=ticket_options,
            beverage_options=beverage_options,
            food_options=food_options,
            work_shifts=work_shifts,
            materials=materials,
            artist_materials=artist_materials,
            professions=professions
        )

        duration = time.time() - start_time
        logger.info(f"Form content object created successfully in {duration:.3f}s")

        if duration > 0.5:
            logger.warning(f"Slow form content loading: {duration:.3f}s")

        return form_content

    except FileNotFoundError as e:
        duration = time.time() - start_time
        logger.error(f"Form content file not found after {duration:.3f}s: {str(e)}")
        raise
    except json.JSONDecodeError as e:
        duration = time.time() - start_time
        logger.error(f"Invalid JSON in form content file after {duration:.3f}s: {str(e)}")
        raise
    except KeyError as e:
        duration = time.time() - start_time
        logger.error(f"Missing required key in form content after {duration:.3f}s: {str(e)}")
        raise
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Unexpected error loading form content after {duration:.3f}s: {str(e)}", exc_info=True)
        raise


def get_artist_form_content_obj() -> ArtistFormContent:
    """
    Loads and returns an ArtistFormContent object from JSON.
    """
    start_time = time.time()
    ARTIST_FORM_CONTENT_PATH = os.path.join(DATA_DIR, 'artist_form_content.json')

    try:
        logger.debug(f"Loading artist form content from {ARTIST_FORM_CONTENT_PATH}")

        if not os.path.exists(ARTIST_FORM_CONTENT_PATH):
            logger.error(f"Artist form content file not found: {ARTIST_FORM_CONTENT_PATH}")
            raise FileNotFoundError(f"Artist form content file not found: {ARTIST_FORM_CONTENT_PATH}")

        with open(ARTIST_FORM_CONTENT_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)

        logger.debug("Artist form content JSON loaded successfully")

        # Reconstruct the nested objects with IDs
        ticket_options = [
            TicketOption(id=idx, **ticket)
            for idx, ticket in enumerate(data['ticket_options'])
        ]
        logger.debug(f"Processed {len(ticket_options)} artist ticket options")

        beverage_options = [
            BeverageOption(id=idx, **bev)
            for idx, bev in enumerate(data['beverage_options'])
        ]
        logger.debug(f"Processed {len(beverage_options)} artist beverage options")

        food_options = [
            FoodOption(id=idx, **food)
            for idx, food in enumerate(data['food_options'])
        ]
        logger.debug(f"Processed {len(food_options)} artist food options")

        artist_materials = [
            ArtistMaterial(id=idx, **am)
            for idx, am in enumerate(data['artist_materials'])
        ]
        logger.debug(f"Processed {len(artist_materials)} artist materials")

        professions = [
            Profession(id=idx, **profession)
            for idx, profession in enumerate(data.get('professions', []))
        ]
        logger.debug(f"Processed {len(professions)} artist professions")

        artist_form_content = ArtistFormContent(
            ticket_options=ticket_options,
            beverage_options=beverage_options,
            food_options=food_options,
            artist_materials=artist_materials,
            professions=professions
        )

        duration = time.time() - start_time
        logger.info(f"Artist form content object created successfully in {duration:.3f}s")

        if duration > 0.5:
            logger.warning(f"Slow artist form content loading: {duration:.3f}s")

        return artist_form_content

    except FileNotFoundError as e:
        duration = time.time() - start_time
        logger.error(f"Artist form content file not found after {duration:.3f}s: {str(e)}")
        raise
    except json.JSONDecodeError as e:
        duration = time.time() - start_time
        logger.error(f"Invalid JSON in artist form content file after {duration:.3f}s: {str(e)}")
        raise
    except KeyError as e:
        duration = time.time() - start_time
        logger.error(f"Missing required key in artist form content after {duration:.3f}s: {str(e)}")
        raise
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Unexpected error loading artist form content after {duration:.3f}s: {str(e)}", exc_info=True)
        raise


def update_form_content_with_db_counts(
        form_content_obj: FormContent,
        db_connect_func: Callable[[], sqlite3.Connection]
) -> dict:
    """
    Given a loaded FormContent object and a DB connection function,
    queries the DB for existing bookings, updates num_booked fields,
    and returns a dictionary.
    """
    start_time = time.time()

    try:
        logger.debug("Starting form content database count update")

        conn = db_connect_func()
        cursor = conn.cursor()

        # TICKETS
        logger.debug("Querying ticket booking counts")
        cursor.execute("SELECT ticket_option_id, COUNT(*) FROM Bookings GROUP BY ticket_option_id")
        ticket_bookings = dict(cursor.fetchall())
        logger.debug(f"Found booking counts for {len(ticket_bookings)} ticket options")

        # BEVERAGE
        logger.debug("Querying beverage booking counts")
        cursor.execute("SELECT beverage_option_id, COUNT(*) FROM Bookings GROUP BY beverage_option_id")
        beverage_bookings = dict(cursor.fetchall())
        logger.debug(f"Found booking counts for {len(beverage_bookings)} beverage options")

        # FOOD
        logger.debug("Querying food booking counts")
        cursor.execute("SELECT food_option_id, COUNT(*) FROM Bookings GROUP BY food_option_id")
        food_bookings = dict(cursor.fetchall())
        logger.debug(f"Found booking counts for {len(food_bookings)} food options")

        # MATERIAL
        logger.debug("Querying material booking counts")
        cursor.execute("SELECT material_id, COUNT(*) FROM BookingMaterials GROUP BY material_id")
        material_bookings = dict(cursor.fetchall())
        logger.debug(f"Found booking counts for {len(material_bookings)} materials")

        # ARTIST MATERIAL
        logger.debug("Querying artist material booking counts")
        cursor.execute("SELECT artist_material_id, COUNT(*) FROM BookingArtistMaterials GROUP BY artist_material_id")
        artist_material_bookings = dict(cursor.fetchall())
        logger.debug(f"Found booking counts for {len(artist_material_bookings)} artist materials")

        # Update the in-memory object section, add after the Materials section:
        # Artist Materials
        for am in form_content_obj.artist_materials:
            am.num_booked = artist_material_bookings.get(am.id, 0)

        # TIMESLOT: first priority
        logger.debug("Querying first priority timeslot counts")
        cursor.execute("""
                       SELECT first_priority_timeslot_id, COUNT(*)
                       FROM Bookings
                       WHERE first_priority_timeslot_id IS NOT NULL
                       GROUP BY first_priority_timeslot_id
                       """)
        timeslot_bookings_1 = dict(cursor.fetchall())
        logger.debug(f"Found first priority counts for {len(timeslot_bookings_1)} timeslots")

        # second priority
        logger.debug("Querying second priority timeslot counts")
        cursor.execute("""
                       SELECT second_priority_timeslot_id, COUNT(*)
                       FROM Bookings
                       WHERE second_priority_timeslot_id IS NOT NULL
                         AND amount_shifts >= 2
                       GROUP BY second_priority_timeslot_id
                       """)
        timeslot_bookings_2 = dict(cursor.fetchall())
        logger.debug(f"Found second priority counts for {len(timeslot_bookings_2)} timeslots")

        # third priority
        logger.debug("Querying third priority timeslot counts")
        cursor.execute("""
                       SELECT third_priority_timeslot_id, COUNT(*)
                       FROM Bookings
                       WHERE third_priority_timeslot_id IS NOT NULL
                         AND amount_shifts >= 3
                       GROUP BY third_priority_timeslot_id
                       """)
        timeslot_bookings_3 = dict(cursor.fetchall())
        logger.debug(f"Found third priority counts for {len(timeslot_bookings_3)} timeslots")

        conn.close()
        logger.debug("Database connection closed")

        # Now update the in-memory object
        # Ticket
        updated_tickets = 0
        for t in form_content_obj.ticket_options:
            old_count = getattr(t, 'num_booked', 0)
            t.num_booked = ticket_bookings.get(t.id, 0)
            if t.num_booked != old_count:
                updated_tickets += 1
        logger.debug(f"Updated booking counts for {updated_tickets} ticket options")

        # Beverage
        updated_beverages = 0
        for b in form_content_obj.beverage_options:
            old_count = getattr(b, 'num_booked', 0)
            b.num_booked = beverage_bookings.get(b.id, 0)
            if b.num_booked != old_count:
                updated_beverages += 1
        logger.debug(f"Updated booking counts for {updated_beverages} beverage options")

        # Food
        updated_food = 0
        for f in form_content_obj.food_options:
            old_count = getattr(f, 'num_booked', 0)
            f.num_booked = food_bookings.get(f.id, 0)
            if f.num_booked != old_count:
                updated_food += 1
        logger.debug(f"Updated booking counts for {updated_food} food options")

        # Materials
        updated_materials = 0
        for m in form_content_obj.materials:
            old_count = getattr(m, 'num_booked', 0)
            m.num_booked = material_bookings.get(m.id, 0)
            if m.num_booked != old_count:
                updated_materials += 1
        logger.debug(f"Updated booking counts for {updated_materials} materials")

        # Timeslots
        updated_timeslots = 0
        total_timeslots = 0
        for ws in form_content_obj.work_shifts:
            for ts in ws.time_slots:
                total_timeslots += 1
                old_count = getattr(ts, 'num_booked', 0)
                num1 = timeslot_bookings_1.get(ts.id, 0)
                num2 = timeslot_bookings_2.get(ts.id, 0)
                num3 = timeslot_bookings_3.get(ts.id, 0)
                ts.num_booked = num1 + num2 + num3
                if ts.num_booked != old_count:
                    updated_timeslots += 1
        logger.debug(f"Updated booking counts for {updated_timeslots}/{total_timeslots} timeslots")

        result = asdict(form_content_obj)

        duration = time.time() - start_time
        logger.info(f"Form content database counts updated successfully in {duration:.3f}s")

        if duration > 1.0:
            logger.warning(f"Slow form content database update: {duration:.3f}s")

        return result

    except sqlite3.Error as e:
        duration = time.time() - start_time
        logger.error(f"Database error updating form content counts after {duration:.3f}s: {str(e)}", exc_info=True)
        # Return the form content without updated counts as fallback
        try:
            conn.close()
        except:
            pass
        return asdict(form_content_obj)
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Unexpected error updating form content counts after {duration:.3f}s: {str(e)}", exc_info=True)
        # Return the form content without updated counts as fallback
        try:
            conn.close()
        except:
            pass
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
    start_time = time.time()

    try:
        logger.debug("Starting artist form content database count update")

        conn = db_connect_func()
        cursor = conn.cursor()

        # TICKETS
        logger.debug("Querying artist ticket booking counts")
        cursor.execute("SELECT ticket_option_id, COUNT(*) FROM ArtistBookings GROUP BY ticket_option_id")
        ticket_bookings = dict(cursor.fetchall())
        logger.debug(f"Found artist booking counts for {len(ticket_bookings)} ticket options")

        # BEVERAGE
        logger.debug("Querying artist beverage booking counts")
        cursor.execute("SELECT beverage_option_id, COUNT(*) FROM ArtistBookings GROUP BY beverage_option_id")
        beverage_bookings = dict(cursor.fetchall())
        logger.debug(f"Found artist booking counts for {len(beverage_bookings)} beverage options")

        # FOOD
        logger.debug("Querying artist food booking counts")
        cursor.execute("SELECT food_option_id, COUNT(*) FROM ArtistBookings GROUP BY food_option_id")
        food_bookings = dict(cursor.fetchall())
        logger.debug(f"Found artist booking counts for {len(food_bookings)} food options")

        # ARTIST MATERIALS
        logger.debug("Querying artist material booking counts")
        cursor.execute("SELECT artist_material_id, COUNT(*) FROM ArtistBookingMaterials GROUP BY artist_material_id")
        artist_material_bookings = dict(cursor.fetchall())
        logger.debug(f"Found artist booking counts for {len(artist_material_bookings)} artist materials")

        # Update the in-memory object section, add after the Materials section:
        # Artist Materials
        updated_artist_materials = 0
        for am in form_content_obj.artist_materials:
            old_count = getattr(am, 'num_booked', 0)
            am.num_booked = artist_material_bookings.get(am.id, 0)
            if am.num_booked != old_count:
                updated_artist_materials += 1
        logger.debug(f"Updated artist booking counts for {updated_artist_materials} artist materials")

        conn.close()
        logger.debug("Database connection closed")

        # Now update the in-memory object
        # Ticket
        updated_tickets = 0
        for t in form_content_obj.ticket_options:
            old_count = getattr(t, 'num_booked', 0)
            t.num_booked = ticket_bookings.get(t.id, 0)
            if t.num_booked != old_count:
                updated_tickets += 1
        logger.debug(f"Updated artist booking counts for {updated_tickets} ticket options")

        # Beverage
        updated_beverages = 0
        for b in form_content_obj.beverage_options:
            old_count = getattr(b, 'num_booked', 0)
            b.num_booked = beverage_bookings.get(b.id, 0)
            if b.num_booked != old_count:
                updated_beverages += 1
        logger.debug(f"Updated artist booking counts for {updated_beverages} beverage options")

        # Food
        updated_food = 0
        for f in form_content_obj.food_options:
            old_count = getattr(f, 'num_booked', 0)
            f.num_booked = food_bookings.get(f.id, 0)
            if f.num_booked != old_count:
                updated_food += 1
        logger.debug(f"Updated artist booking counts for {updated_food} food options")

        # Materials
        updated_materials = 0
        for m in form_content_obj.artist_materials:
            old_count = getattr(m, 'num_booked', 0)
            m.num_booked = artist_material_bookings.get(m.id, 0)
            if m.num_booked != old_count:
                updated_materials += 1
        logger.debug(f"Updated artist booking counts for {updated_materials} artist materials")

        result = asdict(form_content_obj)

        duration = time.time() - start_time
        logger.info(f"Artist form content database counts updated successfully in {duration:.3f}s")

        if duration > 1.0:
            logger.warning(f"Slow artist form content database update: {duration:.3f}s")

        return result

    except sqlite3.Error as e:
        duration = time.time() - start_time
        logger.error(f"Database error updating artist form content counts after {duration:.3f}s: {str(e)}",
                     exc_info=True)
        # Return the form content without updated counts as fallback
        try:
            conn.close()
        except:
            pass
        return asdict(form_content_obj)
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Unexpected error updating artist form content counts after {duration:.3f}s: {str(e)}",
                     exc_info=True)
        # Return the form content without updated counts as fallback
        try:
            conn.close()
        except:
            pass
        return asdict(form_content_obj)