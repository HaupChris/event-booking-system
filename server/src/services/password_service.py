"""
Password Service
================

Database-backed password management for role-based authentication.
Falls back to environment variable defaults if no DB row exists.
"""

import os
import sqlite3
from contextlib import closing
from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from src.utils.logger import get_logger

logger = get_logger(__name__)

IN_DOCKER = os.environ.get("IN_DOCKER", "False").lower() == "true"

if IN_DOCKER:
    DB_FILE_PATH = "/app/user_data/bookings.db"
else:
    DB_DIR = os.path.join(os.path.dirname(__file__), "../../db")
    DB_FILE_PATH = os.path.join(DB_DIR, "bookings.db")

VALID_ROLES = {"admin", "user", "artist"}

ENV_DEFAULTS = {
    "admin": os.environ.get("ADMIN_PASSWORD", "a"),
    "user": os.environ.get("PASSWORD", "b"),
    "artist": os.environ.get("ARTIST_PASSWORD", "artist"),
}


def _connect_db() -> sqlite3.Connection:
    """Returns a new SQLite connection."""
    try:
        conn = sqlite3.connect(DB_FILE_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"Failed to connect to database: {e}", exc_info=True)
        raise


def get_password_hash(role: str) -> str | None:
    """Fetch the stored password hash for a role, or None if not found."""
    try:
        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT password_hash FROM Passwords WHERE role = ?", (role,))
            row = cursor.fetchone()
            return row["password_hash"] if row else None
    except sqlite3.Error as e:
        logger.error(f"Error fetching password hash for {role}: {e}", exc_info=True)
        return None


def verify_password(role: str, password: str) -> bool:
    """Verify a plaintext password against the stored hash for a role."""
    stored_hash = get_password_hash(role)
    if stored_hash:
        return check_password_hash(stored_hash, password)

    # Fallback: compare against env var default
    logger.warning(f"No DB password for role '{role}', falling back to env var")
    default = ENV_DEFAULTS.get(role)
    if default is None:
        return False
    return password == default


def update_password(role: str, new_password: str) -> bool:
    """Hash and store a new password for a role. Returns True on success."""
    if role not in VALID_ROLES:
        logger.warning(f"Attempted to update password for invalid role: {role}")
        return False

    hashed = generate_password_hash(new_password, method="pbkdf2:sha256", salt_length=8)
    now = datetime.now().isoformat()

    try:
        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO Passwords (role, password_hash, updated_at) "
                "VALUES (?, ?, ?) "
                "ON CONFLICT(role) DO UPDATE SET password_hash = excluded.password_hash, "
                "updated_at = excluded.updated_at",
                (role, hashed, now),
            )
            conn.commit()
            logger.info(f"Password updated for role '{role}'")
            return True
    except sqlite3.Error as e:
        logger.error(f"Error updating password for {role}: {e}", exc_info=True)
        return False
