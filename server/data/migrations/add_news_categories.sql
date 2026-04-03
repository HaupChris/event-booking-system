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
