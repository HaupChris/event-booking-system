"""
Application Settings Service
============================

Database-backed storage for global runtime settings.
"""

import os
import sqlite3
from contextlib import closing
from datetime import datetime

from src.utils.logger import get_logger

logger = get_logger(__name__)

IN_DOCKER = os.environ.get("IN_DOCKER", "False").lower() == "true"

if IN_DOCKER:
    DB_FILE_PATH = "/app/user_data/bookings.db"
else:
    DB_DIR = os.path.join(os.path.dirname(__file__), "../../db")
    DB_FILE_PATH = os.path.join(DB_DIR, "bookings.db")

PAYMENT_LINK_KEY = "payment_link"
DEFAULT_PAYMENT_LINK = "https://www.paypal.me/Wiesenwahn"


def _ensure_table_exists(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS AppSettings (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
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
            if row and row["value"].strip():
                return row["value"].strip()
    except sqlite3.Error as e:
        logger.error(f"Failed to read payment link from AppSettings: {e}", exc_info=True)

    return DEFAULT_PAYMENT_LINK


def set_payment_link(payment_link: str) -> bool:
    """Persist payment link setting."""
    now = datetime.now().isoformat()

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
