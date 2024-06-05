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
    is_paid INTEGER,
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

-- -- Insert dummy data into Users
-- INSERT INTO Users (last_name, first_name, email, phone_number) VALUES
-- ('Müller', 'Hans', 'h.mueller@example.com', '0123456789'),
-- ('Schmidt', 'Anna', 'a.schmidt@example.com', '0123456789'),
-- ('Schneider', 'Peter', 'p.schneider@example.com', '0123456789'),
-- ('Fischer', 'Laura', 'l.fischer@example.com', '0123456789'),
-- ('Weber', 'Daniel', 'd.weber@example.com', '0123456789');
--
-- -- Insert dummy data into Bookings
-- INSERT INTO Bookings (user_id, ticket_option_id, beverage_option_id, food_option_id, first_priority_timeslot_id, second_priority_timeslot_id, third_priority_timeslot_id, amount_shifts, supporter_buddy, signature, total_price, is_paid) VALUES
-- (1, 1, 1, 1, 1, 2, 3, 2, 'Buddy 1', 'SGVucnkgTXVsbGVy', 100.0, 1),
-- (2, 2, 2, 2, 4, 5, 6, 3, 'Buddy 2', 'QW5uYSBTY2htaWR0', 90.0, 1),
-- (3, 3, 3, 3, 7, 8, 9, 1, 'Buddy 3', 'UGV0ZXIgU2NobmVpZGVy', 80.0, 1),
-- (4, 4, 1, 1, 10, 11, 12, 2, 'Buddy 4', 'TGF1cmEgRmlzY2hlcg==', 70.0, 1),
-- (5, 5, 2, 2, 13, 14, 15, 3, 'Buddy 5', 'RGFuaWVsIFdlYmVy', 60.0, 1);
--
-- -- Insert dummy data into BookingMaterials
-- INSERT INTO BookingMaterials (booking_id, material_id) VALUES
-- (1, 1),
-- (1, 2),
-- (2, 3),
-- (2, 4),
-- (3, 5),
-- (3, 6),
-- (4, 7),
-- (4, 8),
-- (5, 9),
-- (5, 10);


