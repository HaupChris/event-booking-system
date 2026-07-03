CREATE TABLE IF NOT EXISTS Users  (
    id INTEGER PRIMARY KEY NOT NULL,
    last_name TEXT NOT NULL,
    first_name TEXT,
    email TEXT NOT NULL,
    phone_number TEXT
);

CREATE TABLE IF NOT EXISTS OrgaTeamInviters (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    is_active INTEGER DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS TicketOptions  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    working_title TEXT,
    price REAL NOT NULL,
    amount INTEGER NOT NULL,
    requires_workshift INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS BeverageOptions  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    working_title TEXT,
    description TEXT,
    price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS FoodOptions  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    working_title TEXT,
    description TEXT,
    price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS ArtistTicketOptions  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    working_title TEXT,
    price REAL NOT NULL,
    amount INTEGER NOT NULL,
    requires_workshift INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ArtistBeverageOptions  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    working_title TEXT,
    description TEXT,
    price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS ArtistFoodOptions  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    working_title TEXT,
    description TEXT,
    price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS WorkShifts  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    working_title TEXT,
    description TEXT,
    multiple_selection_possible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS TimeSlots  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    working_title TEXT,
    start_time TEXT,
    end_time TEXT,
    num_needed INTEGER,
    workshift_id INTEGER,
    FOREIGN KEY(workshift_id) REFERENCES WorkShifts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Materials  (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    working_title TEXT,
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
    invited_by_id INTEGER,
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
    FOREIGN KEY(invited_by_id) REFERENCES OrgaTeamInviters(id) ON DELETE SET NULL,
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
    profile_uuid TEXT UNIQUE,
    invited_by_id INTEGER,
    equipment TEXT DEFAULT '',
    special_requests TEXT DEFAULT '',
    performance_details TEXT DEFAULT '',
    FOREIGN KEY(artist_id) REFERENCES Artists(id) ON DELETE CASCADE,
    FOREIGN KEY(ticket_option_id) REFERENCES TicketOptions(id) ON DELETE SET NULL,
    FOREIGN KEY(beverage_option_id) REFERENCES BeverageOptions(id) ON DELETE SET NULL,
    FOREIGN KEY(food_option_id) REFERENCES FoodOptions(id) ON DELETE SET NULL,
    FOREIGN KEY(invited_by_id) REFERENCES OrgaTeamInviters(id) ON DELETE SET NULL
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
    working_title TEXT,
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

CREATE TABLE IF NOT EXISTS News (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    published_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    author TEXT,
    is_active INTEGER DEFAULT 1,
    display_order INTEGER
);

CREATE TABLE IF NOT EXISTS NewsReadStatus (
    id INTEGER PRIMARY KEY NOT NULL,
    booking_id INTEGER NOT NULL,
    news_id INTEGER NOT NULL,
    read_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY(news_id) REFERENCES News(id) ON DELETE CASCADE,
    UNIQUE(booking_id, news_id)
);

CREATE TABLE IF NOT EXISTS NewsCategories (
    id INTEGER PRIMARY KEY NOT NULL,
    category_key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'announcement',
    is_active INTEGER DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO NewsCategories (category_key, label, icon, is_active)
VALUES ('announcement', 'Ankuendigung', 'announcement', 1);
INSERT OR IGNORE INTO NewsCategories (category_key, label, icon, is_active)
VALUES ('timetable', 'Zeitplan', 'calendar', 1);
INSERT OR IGNORE INTO NewsCategories (category_key, label, icon, is_active)
VALUES ('workshop', 'Workshop', 'workshop', 1);
INSERT OR IGNORE INTO NewsCategories (category_key, label, icon, is_active)
VALUES ('anreise', 'Anreise', 'travel', 1);
INSERT OR IGNORE INTO NewsCategories (category_key, label, icon, is_active)
VALUES ('general', 'Allgemein', 'info', 1);

CREATE TABLE IF NOT EXISTS ShiftAssignments (
    id INTEGER PRIMARY KEY NOT NULL,
    booking_id INTEGER NOT NULL,
    timeslot_id INTEGER NOT NULL,
    is_confirmed INTEGER DEFAULT 1,
    assignment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    admin_notes TEXT,
    status TEXT DEFAULT 'pending',
    rejection_reason TEXT,
    alternative_preferences TEXT,
    response_date TEXT,
    FOREIGN KEY(booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY(timeslot_id) REFERENCES TimeSlots(id) ON DELETE CASCADE,
    UNIQUE(booking_id, timeslot_id)
);

CREATE TABLE IF NOT EXISTS ShiftMessages (
    id INTEGER PRIMARY KEY NOT NULL,
    timeslot_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    content TEXT NOT NULL,
    created_by TEXT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY(timeslot_id) REFERENCES TimeSlots(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS RideSharePosts (
    id INTEGER PRIMARY KEY NOT NULL,
    owner_profile_uuid TEXT NOT NULL,
    post_type TEXT NOT NULL CHECK(post_type IN ('offer', 'request')),
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    seats_total INTEGER,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'cancelled')),
    is_completed INTEGER NOT NULL DEFAULT 0,
    completed_date TEXT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rideshare_posts_owner
    ON RideSharePosts(owner_profile_uuid);

CREATE INDEX IF NOT EXISTS idx_rideshare_posts_type_status
    ON RideSharePosts(post_type, status);

CREATE INDEX IF NOT EXISTS idx_rideshare_posts_departure
    ON RideSharePosts(departure_time);

CREATE TABLE IF NOT EXISTS RideShareJoinRequests (
    id INTEGER PRIMARY KEY NOT NULL,
    post_id INTEGER NOT NULL,
    requester_profile_uuid TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled')),
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_date TEXT,
    FOREIGN KEY(post_id) REFERENCES RideSharePosts(id) ON DELETE CASCADE,
    UNIQUE(post_id, requester_profile_uuid)
);

CREATE INDEX IF NOT EXISTS idx_rideshare_join_post_status
    ON RideShareJoinRequests(post_id, status);

CREATE INDEX IF NOT EXISTS idx_rideshare_join_requester
    ON RideShareJoinRequests(requester_profile_uuid);

CREATE TABLE IF NOT EXISTS FAQCategories (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS FAQs (
    id INTEGER PRIMARY KEY NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES FAQCategories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Passwords (
    id INTEGER PRIMARY KEY NOT NULL,
    role TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS AppSettings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
