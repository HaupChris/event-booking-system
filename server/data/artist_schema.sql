-- artist_schema.sql
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

-- New table for artist materials
CREATE TABLE IF NOT EXISTS ArtistMaterials (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    num_needed INTEGER NOT NULL
);