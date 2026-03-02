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

CREATE INDEX IF NOT EXISTS idx_shift_messages_timeslot_id
    ON ShiftMessages(timeslot_id);

CREATE INDEX IF NOT EXISTS idx_shift_messages_created_date
    ON ShiftMessages(created_date DESC);
