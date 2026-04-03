"""
Application Settings Service
============================

Database-backed storage for global runtime settings.
"""

import os
import sqlite3
from contextlib import closing
from datetime import UTC, datetime
from pathlib import Path

from src.utils.logger import get_logger

logger = get_logger(__name__)

IN_DOCKER = os.environ.get("IN_DOCKER", "False").lower() == "true"

if IN_DOCKER:
    DB_FILE_PATH = "/app/user_data/bookings.db"
else:
    DB_DIR = Path(__file__).resolve().parent.parent.parent / "db"
    DB_FILE_PATH = str(DB_DIR / "bookings.db")

PAYMENT_LINK_KEY = "payment_link"
DEFAULT_PAYMENT_LINK = "https://www.paypal.me/Wiesenwahn"
BRANDING_PACK_KEY = "frontend_branding_pack"
DEFAULT_BRANDING_PACK = os.environ.get("FRONTEND_BRANDING_PACK", "ww-2025-circus").strip()
RIDESHARE_ENABLED_KEY = "rideshare_enabled"
DEFAULT_RIDESHARE_ENABLED = os.environ.get("RIDESHARE_ENABLED", "true").strip().lower() not in {
    "0",
    "false",
    "no",
}


def _now_iso() -> str:
    return datetime.now(tz=UTC).isoformat()


def _ensure_table_exists(conn: sqlite3.Connection) -> None:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS AppSettings (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)
    conn.commit()


def _connect_db() -> sqlite3.Connection:
    """Returns a new SQLite connection."""
    try:
        conn = sqlite3.connect(DB_FILE_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"Failed to connect to database: {e}", exc_info=True)
        raise


def get_payment_link() -> str:
    """Get configured payment link, or default value when missing."""
    try:
        with closing(_connect_db()) as conn:
            _ensure_table_exists(conn)
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM AppSettings WHERE key = ?", (PAYMENT_LINK_KEY,))
            row = cursor.fetchone()
            if row:
                value = str(row["value"]).strip()
                if value:
                    return value
    except sqlite3.Error as e:
        logger.error(f"Failed to read payment link from AppSettings: {e}", exc_info=True)

    return DEFAULT_PAYMENT_LINK


def set_payment_link(payment_link: str) -> bool:
    """Persist payment link setting."""
    now = _now_iso()

    try:
        with closing(_connect_db()) as conn:
            _ensure_table_exists(conn)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO AppSettings (key, value, updated_at) "
                "VALUES (?, ?, ?) "
                "ON CONFLICT(key) DO UPDATE SET value = excluded.value, "
                "updated_at = excluded.updated_at",
                (PAYMENT_LINK_KEY, payment_link.strip(), now),
            )
            conn.commit()
            logger.info("Payment link updated via app settings service")
            return True
    except sqlite3.Error as e:
        logger.error(f"Failed to update payment link in AppSettings: {e}", exc_info=True)
        return False


def get_frontend_branding_pack() -> str:
    """Get configured frontend branding pack, or default value when missing."""
    try:
        with closing(_connect_db()) as conn:
            _ensure_table_exists(conn)
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM AppSettings WHERE key = ?", (BRANDING_PACK_KEY,))
            row = cursor.fetchone()
            if row:
                value = str(row["value"]).strip()
                if value:
                    return value
    except sqlite3.Error as e:
        logger.error(f"Failed to read frontend branding pack from AppSettings: {e}", exc_info=True)

    return DEFAULT_BRANDING_PACK


def set_frontend_branding_pack(branding_pack: str) -> bool:
    """Persist frontend branding pack setting."""
    now = _now_iso()

    try:
        with closing(_connect_db()) as conn:
            _ensure_table_exists(conn)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO AppSettings (key, value, updated_at) "
                "VALUES (?, ?, ?) "
                "ON CONFLICT(key) DO UPDATE SET value = excluded.value, "
                "updated_at = excluded.updated_at",
                (BRANDING_PACK_KEY, branding_pack.strip(), now),
            )
            conn.commit()
            logger.info("Frontend branding pack updated via app settings service")
            return True
    except sqlite3.Error as e:
        logger.error(f"Failed to update frontend branding pack in AppSettings: {e}", exc_info=True)
        return False


def get_rideshare_enabled() -> bool:
    """Return whether rideshare is currently enabled."""
    try:
        with closing(_connect_db()) as conn:
            _ensure_table_exists(conn)
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM AppSettings WHERE key = ?", (RIDESHARE_ENABLED_KEY,))
            row = cursor.fetchone()
            if row:
                normalized = row["value"].strip().lower()
                return normalized in {"1", "true", "yes", "on"}
    except sqlite3.Error as e:
        logger.error(f"Failed to read rideshare toggle from AppSettings: {e}", exc_info=True)

    return DEFAULT_RIDESHARE_ENABLED


def set_rideshare_enabled(is_enabled: bool) -> bool:
    """Persist rideshare enabled toggle."""
    now = _now_iso()
    value = "true" if is_enabled else "false"

    try:
        with closing(_connect_db()) as conn:
            _ensure_table_exists(conn)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO AppSettings (key, value, updated_at) "
                "VALUES (?, ?, ?) "
                "ON CONFLICT(key) DO UPDATE SET value = excluded.value, "
                "updated_at = excluded.updated_at",
                (RIDESHARE_ENABLED_KEY, value, now),
            )
            conn.commit()
            logger.info("Rideshare toggle updated via app settings service")
            return True
    except sqlite3.Error as e:
        logger.error(f"Failed to update rideshare toggle in AppSettings: {e}", exc_info=True)
        return False
