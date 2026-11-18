"""
Password Service
================

Database-backed password management for role-based authentication.
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
    DB_DIR = os.path.join(os.path.dirname(__file__), "../../db")  # noqa: PTH118, PTH120  # lint-baseline
    DB_FILE_PATH = os.path.join(DB_DIR, "bookings.db")  # noqa: PTH118  # lint-baseline

VALID_ROLES = {"admin", "user", "artist"}
MIN_PASSWORD_LENGTH = 12

ROLE_ENV_VAR_MAP = {
    "admin": "ADMIN_PASSWORD",
    "user": "PASSWORD",
    "artist": "ARTIST_PASSWORD",
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

    logger.error(f"No password hash configured for role '{role}'")
    return False


def update_password(role: str, new_password: str) -> bool:
    """Hash and store a new password for a role. Returns True on success."""
    if role not in VALID_ROLES:
        logger.warning(f"Attempted to update password for invalid role: {role}")
        return False

    if len(new_password) < MIN_PASSWORD_LENGTH:
        logger.warning(
            f"Rejected password update for role '{role}': minimum length is {MIN_PASSWORD_LENGTH}"
        )
        return False

    hashed = generate_password_hash(new_password, method="pbkdf2:sha256", salt_length=16)
    now = datetime.now().isoformat()  # noqa: DTZ005  # lint-baseline

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


def ensure_password_hashes() -> None:
    """
    Ensure password hashes exist for all roles.

    If a role is missing in the DB, this function can bootstrap it from the
    corresponding environment variable. Missing roles without env values fail fast.
    """
    missing_role_envs: list[str] = []

    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS Passwords (
                id INTEGER PRIMARY KEY NOT NULL,
                role TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        for role in sorted(VALID_ROLES):
            cursor.execute("SELECT password_hash FROM Passwords WHERE role = ?", (role,))
            if cursor.fetchone():
                continue

            env_key = ROLE_ENV_VAR_MAP[role]
            raw_password = os.environ.get(env_key, "").strip()
            if len(raw_password) < MIN_PASSWORD_LENGTH:
                missing_role_envs.append(env_key)
                continue

            now = datetime.now().isoformat()  # noqa: DTZ005  # lint-baseline
            hashed = generate_password_hash(raw_password, method="pbkdf2:sha256", salt_length=16)
            cursor.execute(
                "INSERT INTO Passwords (role, password_hash, updated_at) VALUES (?, ?, ?)",
                (role, hashed, now),
            )
            logger.warning(
                f"Bootstrapped missing password hash for role '{role}' from environment variable {env_key}"
            )

        conn.commit()

    if missing_role_envs:
        missing_list = ", ".join(sorted(set(missing_role_envs)))
        raise RuntimeError(
            "Missing password hash configuration for one or more roles. "
            f"Set strong values (>= {MIN_PASSWORD_LENGTH} chars) for: {missing_list}"
        )
