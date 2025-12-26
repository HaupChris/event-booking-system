"""
Database Migration: Add Profile UUID Support
============================================

This migration adds profile_uuid columns to Bookings and ArtistBookings tables,
creates News and NewsReadStatus tables, and extends ShiftAssignments for
shift acceptance workflow.

Run this script once to migrate the database.
"""

import os
import sqlite3
import uuid

# Determine database path
IN_DOCKER = os.environ.get('IN_DOCKER', 'False').lower() == 'true'

if IN_DOCKER:
    DB_FILE_PATH = '/app/user_data/bookings.db'
else:
    # Local development path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    DB_DIR = os.path.join(script_dir, '../../db')
    DB_FILE_PATH = os.path.join(DB_DIR, 'bookings.db')


def migrate():
    """Run the migration"""
    print("=" * 60)
    print("Starting Profile UUID Migration")
    print("=" * 60)
    print(f"Database path: {DB_FILE_PATH}")

    conn = sqlite3.connect(DB_FILE_PATH)
    cursor = conn.cursor()

    try:
        # ===================================================================
        # 1. MIGRATE BOOKINGS TABLE
        # ===================================================================
        print("\n[1/6] Migrating Bookings table...")

        # Create new Bookings table with profile_uuid
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Bookings_new (
                id INTEGER PRIMARY KEY NOT NULL,
                Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                user_id INTEGER,
                ticket_option_id INTEGER,
                beverage_option_id INTEGER,
                food_option_id INTEGER,
                first_priority_timeslot_id INTEGER,
                second_priority_timeslot_id INTEGER,
                third_priority_timeslot_id INTEGER,
                amount_shifts INTEGER,
                supporter_buddy TEXT,
                signature BLOB,
                total_price REAL,
                is_paid INTEGER DEFAULT 0,
                paid_amount REAL DEFAULT 0.0,
                payment_notes TEXT DEFAULT '',
                payment_date TEXT DEFAULT NULL,
                profile_uuid TEXT UNIQUE,
                FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY(ticket_option_id) REFERENCES TicketOptions(id) ON DELETE SET NULL,
                FOREIGN KEY(beverage_option_id) REFERENCES BeverageOptions(id) ON DELETE SET NULL,
                FOREIGN KEY(food_option_id) REFERENCES FoodOptions(id) ON DELETE SET NULL,
                FOREIGN KEY(first_priority_timeslot_id) REFERENCES WorkShifts(id) ON DELETE SET NULL,
                FOREIGN KEY(second_priority_timeslot_id) REFERENCES WorkShifts(id) ON DELETE SET NULL,
                FOREIGN KEY(third_priority_timeslot_id) REFERENCES WorkShifts(id) ON DELETE SET NULL
            )
        """)

        # Copy data from old table and generate UUIDs
        cursor.execute("SELECT * FROM Bookings")
        columns = [description[0] for description in cursor.description]
        bookings = cursor.fetchall()

        booking_count = len(bookings)
        print(f"   Found {booking_count} existing bookings")

        for booking in bookings:
            profile_uuid = str(uuid.uuid4())
            # Append profile_uuid to the row data
            cursor.execute(f"""
                INSERT INTO Bookings_new ({', '.join(columns)}, profile_uuid)
                VALUES ({', '.join(['?'] * len(columns))}, ?)
            """, (*booking, profile_uuid))

        # Drop old table and rename
        cursor.execute("DROP TABLE Bookings")
        cursor.execute("ALTER TABLE Bookings_new RENAME TO Bookings")

        # Recreate junction tables with foreign key references
        # Note: These tables reference Bookings, so need to be recreated after Bookings table change

        # Backup BookingMaterials data
        cursor.execute("SELECT * FROM BookingMaterials")
        booking_materials = cursor.fetchall()

        cursor.execute("DROP TABLE IF EXISTS BookingMaterials")
        cursor.execute("""
            CREATE TABLE BookingMaterials (
                id INTEGER PRIMARY KEY NOT NULL,
                booking_id INTEGER,
                material_id INTEGER,
                FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
                FOREIGN KEY(material_id) REFERENCES Materials(id) ON DELETE CASCADE
            )
        """)

        # Restore BookingMaterials data
        for row in booking_materials:
            cursor.execute("INSERT INTO BookingMaterials VALUES (?, ?, ?)", row)

        # Backup BookingProfessions data
        cursor.execute("SELECT * FROM BookingProfessions")
        booking_professions = cursor.fetchall()

        cursor.execute("DROP TABLE IF EXISTS BookingProfessions")
        cursor.execute("""
            CREATE TABLE BookingProfessions (
                id INTEGER PRIMARY KEY NOT NULL,
                booking_id INTEGER,
                profession_id INTEGER,
                FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
                FOREIGN KEY(profession_id) REFERENCES Professions(id) ON DELETE CASCADE
            )
        """)

        # Restore BookingProfessions data
        for row in booking_professions:
            cursor.execute("INSERT INTO BookingProfessions VALUES (?, ?, ?)", row)

        # Backup BookingArtistMaterials data
        cursor.execute("SELECT * FROM BookingArtistMaterials")
        booking_artist_materials = cursor.fetchall()

        cursor.execute("DROP TABLE IF EXISTS BookingArtistMaterials")
        cursor.execute("""
            CREATE TABLE BookingArtistMaterials (
                id INTEGER PRIMARY KEY NOT NULL,
                booking_id INTEGER,
                artist_material_id INTEGER,
                FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
                FOREIGN KEY(artist_material_id) REFERENCES ArtistMaterials(id) ON DELETE CASCADE
            )
        """)

        # Restore BookingArtistMaterials data
        for row in booking_artist_materials:
            cursor.execute("INSERT INTO BookingArtistMaterials VALUES (?, ?, ?)", row)

        # Create index on profile_uuid
        cursor.execute("CREATE INDEX idx_bookings_profile_uuid ON Bookings(profile_uuid)")

        print(f"   ✓ Migrated {booking_count} bookings with generated UUIDs")

        # ===================================================================
        # 2. MIGRATE ARTISTBOOKINGS TABLE
        # ===================================================================
        print("\n[2/6] Migrating ArtistBookings table...")

        # Create new ArtistBookings table with profile_uuid
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ArtistBookings_new (
                id INTEGER PRIMARY KEY NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                artist_id INTEGER,
                ticket_option_id INTEGER,
                beverage_option_id INTEGER,
                food_option_id INTEGER,
                signature BLOB,
                total_price REAL,
                is_paid INTEGER DEFAULT 0,
                paid_amount REAL DEFAULT 0.0,
                payment_notes TEXT DEFAULT '',
                payment_date TEXT DEFAULT NULL,
                equipment TEXT DEFAULT '',
                special_requests TEXT DEFAULT '',
                performance_details TEXT DEFAULT '',
                profile_uuid TEXT UNIQUE,
                FOREIGN KEY(artist_id) REFERENCES Artists(id) ON DELETE CASCADE,
                FOREIGN KEY(ticket_option_id) REFERENCES TicketOptions(id) ON DELETE SET NULL,
                FOREIGN KEY(beverage_option_id) REFERENCES BeverageOptions(id) ON DELETE SET NULL,
                FOREIGN KEY(food_option_id) REFERENCES FoodOptions(id) ON DELETE SET NULL
            )
        """)

        # Copy data from old table and generate UUIDs
        cursor.execute("SELECT * FROM ArtistBookings")
        artist_columns = [description[0] for description in cursor.description]
        artist_bookings = cursor.fetchall()

        artist_count = len(artist_bookings)
        print(f"   Found {artist_count} existing artist bookings")

        for booking in artist_bookings:
            profile_uuid = str(uuid.uuid4())
            cursor.execute(f"""
                INSERT INTO ArtistBookings_new ({', '.join(artist_columns)}, profile_uuid)
                VALUES ({', '.join(['?'] * len(artist_columns))}, ?)
            """, (*booking, profile_uuid))

        # Drop old table and rename
        cursor.execute("DROP TABLE ArtistBookings")
        cursor.execute("ALTER TABLE ArtistBookings_new RENAME TO ArtistBookings")

        # Recreate ArtistBookingMaterials
        cursor.execute("SELECT * FROM ArtistBookingMaterials")
        artist_booking_materials = cursor.fetchall()

        cursor.execute("DROP TABLE IF EXISTS ArtistBookingMaterials")
        cursor.execute("""
            CREATE TABLE ArtistBookingMaterials (
                id INTEGER PRIMARY KEY NOT NULL,
                booking_id INTEGER,
                artist_material_id INTEGER,
                FOREIGN KEY(booking_id) REFERENCES ArtistBookings(id) ON DELETE CASCADE,
                FOREIGN KEY(artist_material_id) REFERENCES ArtistMaterials(id) ON DELETE CASCADE
            )
        """)

        for row in artist_booking_materials:
            cursor.execute("INSERT INTO ArtistBookingMaterials VALUES (?, ?, ?)", row)

        # Recreate ArtistBookingProfessions
        cursor.execute("SELECT * FROM ArtistBookingProfessions")
        artist_booking_professions = cursor.fetchall()

        cursor.execute("DROP TABLE IF EXISTS ArtistBookingProfessions")
        cursor.execute("""
            CREATE TABLE ArtistBookingProfessions (
                id INTEGER PRIMARY KEY NOT NULL,
                booking_id INTEGER,
                profession_id INTEGER,
                FOREIGN KEY(booking_id) REFERENCES ArtistBookings(id) ON DELETE CASCADE,
                FOREIGN KEY(profession_id) REFERENCES Professions(id) ON DELETE CASCADE
            )
        """)

        for row in artist_booking_professions:
            cursor.execute("INSERT INTO ArtistBookingProfessions VALUES (?, ?, ?)", row)

        # Create index on profile_uuid
        cursor.execute("CREATE INDEX idx_artist_bookings_profile_uuid ON ArtistBookings(profile_uuid)")

        print(f"   ✓ Migrated {artist_count} artist bookings with generated UUIDs")

        # ===================================================================
        # 3. EXTEND SHIFTASSIGNMENTS TABLE
        # ===================================================================
        print("\n[3/6] Extending ShiftAssignments table...")

        # Check if columns already exist
        cursor.execute("PRAGMA table_info(ShiftAssignments)")
        existing_columns = [column[1] for column in cursor.fetchall()]

        if 'status' not in existing_columns:
            # Need to recreate table to add columns
            cursor.execute("SELECT * FROM ShiftAssignments")
            shift_assignments = cursor.fetchall()

            cursor.execute("DROP TABLE IF EXISTS ShiftAssignments")
            cursor.execute("""
                CREATE TABLE ShiftAssignments (
                    id INTEGER PRIMARY KEY NOT NULL,
                    booking_id INTEGER NOT NULL,
                    timeslot_id INTEGER NOT NULL,
                    is_confirmed INTEGER DEFAULT 1,
                    assignment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    admin_notes TEXT,
                    status TEXT DEFAULT 'pending',
                    rejection_reason TEXT,
                    alternative_preferences TEXT,
                    response_date DATETIME,
                    FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
                    FOREIGN KEY(timeslot_id) REFERENCES TimeSlots(id) ON DELETE CASCADE,
                    UNIQUE(booking_id, timeslot_id)
                )
            """)

            # Restore data
            for row in shift_assignments:
                cursor.execute("""
                    INSERT INTO ShiftAssignments
                    (id, booking_id, timeslot_id, is_confirmed, assignment_date, admin_notes, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'pending')
                """, row)

            print("   ✓ Extended ShiftAssignments with acceptance workflow columns")
        else:
            print("   ✓ ShiftAssignments already has new columns")

        # ===================================================================
        # 4. CREATE NEWS TABLE
        # ===================================================================
        print("\n[4/6] Creating News table...")

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS News (
                id INTEGER PRIMARY KEY NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT,
                published_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                author TEXT,
                is_active INTEGER DEFAULT 1
            )
        """)

        print("   ✓ Created News table")

        # ===================================================================
        # 5. CREATE NEWSREADSTATUS TABLE
        # ===================================================================
        print("\n[5/6] Creating NewsReadStatus table...")

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS NewsReadStatus (
                id INTEGER PRIMARY KEY NOT NULL,
                booking_id INTEGER NOT NULL,
                news_id INTEGER NOT NULL,
                read_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
                FOREIGN KEY(news_id) REFERENCES News(id) ON DELETE CASCADE,
                UNIQUE(booking_id, news_id)
            )
        """)

        print("   ✓ Created NewsReadStatus table")

        # ===================================================================
        # 6. UPDATE SCHEMA FILE
        # ===================================================================
        print("\n[6/6] Migration complete!")

        conn.commit()

        # ===================================================================
        # PRINT SAMPLE DATA FOR TESTING
        # ===================================================================
        print("\n" + "=" * 60)
        print("Migration Summary")
        print("=" * 60)
        print(f"✓ Migrated {booking_count} regular bookings")
        print(f"✓ Migrated {artist_count} artist bookings")
        print("✓ Extended ShiftAssignments table")
        print("✓ Created News and NewsReadStatus tables")

        # Print sample profile UUIDs for testing
        cursor.execute("SELECT id, profile_uuid FROM Bookings LIMIT 3")
        sample_bookings = cursor.fetchall()

        if sample_bookings:
            print("\nSample Profile UUIDs for testing:")
            print("-" * 60)
            for booking_id, profile_uuid in sample_bookings:
                print(f"  Booking ID {booking_id}: {profile_uuid}")
                print(f"  → http://localhost:3000/profile/{profile_uuid}")

        print("\n" + "=" * 60)
        print("✓ Migration completed successfully!")
        print("=" * 60)

    except Exception as e:
        conn.rollback()
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    migrate()
