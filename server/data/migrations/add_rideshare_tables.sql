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
