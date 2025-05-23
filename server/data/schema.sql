CREATE TABLE IF NOT EXISTS Users  (
    id INTEGER PRIMARY KEY NOT NULL,
    last_name TEXT NOT NULL,
    first_name TEXT,
    email TEXT NOT NULL,
    phone_number TEXT
);

CREATE TABLE IF NOT EXISTS TicketOptions  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    amount INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS BeverageOptions  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS FoodOptions  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS WorkShifts  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS TimeSlots  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    num_needed INTEGER,
    workshift_id INTEGER,
    FOREIGN KEY(workshift_id) REFERENCES WorkShifts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Materials  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    num_needed INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Bookings  (
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
    FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY(ticket_option_id) REFERENCES TicketOptions(id) ON DELETE SET NULL,
    FOREIGN KEY(beverage_option_id) REFERENCES BeverageOptions(id) ON DELETE SET NULL,
    FOREIGN KEY(food_option_id) REFERENCES FoodOptions(id) ON DELETE SET NULL,
    FOREIGN KEY(first_priority_timeslot_id) REFERENCES WorkShifts(id) ON DELETE SET NULL,
    FOREIGN KEY(second_priority_timeslot_id) REFERENCES WorkShifts(id) ON DELETE SET NULL,
    FOREIGN KEY(third_priority_timeslot_id) REFERENCES WorkShifts(id) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS BookingMaterials  (
    id INTEGER PRIMARY KEY NOT NULL,
    booking_id INTEGER,
    material_id INTEGER,
    FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY(material_id) REFERENCES Materials(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Professions (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS BookingProfessions (
    id INTEGER PRIMARY KEY NOT NULL,
    booking_id INTEGER,
    profession_id INTEGER,
    FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY(profession_id) REFERENCES Professions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Artists (
    id INTEGER PRIMARY KEY NOT NULL,
    last_name TEXT NOT NULL,
    first_name TEXT,
    email TEXT NOT NULL,
    phone_number TEXT
);

CREATE TABLE IF NOT EXISTS ArtistBookings (
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
    FOREIGN KEY(artist_id) REFERENCES Artists(id) ON DELETE CASCADE,
    FOREIGN KEY(ticket_option_id) REFERENCES TicketOptions(id) ON DELETE SET NULL,
    FOREIGN KEY(beverage_option_id) REFERENCES BeverageOptions(id) ON DELETE SET NULL,
    FOREIGN KEY(food_option_id) REFERENCES FoodOptions(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ArtistBookingMaterials (
    id INTEGER PRIMARY KEY NOT NULL,
    booking_id INTEGER,
    artist_material_id INTEGER,
    FOREIGN KEY(booking_id) REFERENCES ArtistBookings(id) ON DELETE CASCADE,
    FOREIGN KEY(artist_material_id) REFERENCES ArtistMaterials(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS BookingArtistMaterials  (
    id INTEGER PRIMARY KEY NOT NULL,
    booking_id INTEGER,
    artist_material_id INTEGER,
    FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY(artist_material_id) REFERENCES ArtistMaterials(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ArtistMaterials (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    num_needed INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ArtistBookingProfessions
(
    id            INTEGER PRIMARY KEY NOT NULL,
    booking_id    INTEGER,
    profession_id INTEGER,
    FOREIGN KEY (booking_id) REFERENCES ArtistBookings (id) ON DELETE CASCADE,
    FOREIGN KEY (profession_id) REFERENCES Professions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ShiftAssignments (
    id INTEGER PRIMARY KEY NOT NULL,
    booking_id INTEGER NOT NULL,
    timeslot_id INTEGER NOT NULL,
    is_confirmed INTEGER DEFAULT 1,
    assignment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    admin_notes TEXT,
    FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY(timeslot_id) REFERENCES TimeSlots(id) ON DELETE CASCADE,
    UNIQUE(booking_id, timeslot_id)
);

