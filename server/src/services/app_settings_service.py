"""
Application Settings Service
============================

Database-backed storage for global runtime settings.
"""

import os
import sqlite3
from contextlib import closing
from datetime import UTC, datetime
from typing import Literal
from urllib.parse import urlsplit

from flask import has_request_context, request

from src.utils.logger import get_logger
from src.utils.paths import get_db_file_path

logger = get_logger(__name__)

DB_FILE_PATH = get_db_file_path()

PAYMENT_LINK_KEY = "payment_link"
DEFAULT_PAYMENT_LINK = "https://www.paypal.me/Wiesenwahn"
PUBLIC_APP_URL_KEY = "public_app_url"
DEFAULT_PUBLIC_APP_URL = (
    os.environ.get("PUBLIC_APP_URL")
    or os.environ.get("APP_BASE_URL")
    or os.environ.get("FRONTEND_URL")
    or "http://localhost:3000"
).strip()
BRANDING_PACK_KEY = "frontend_branding_pack"
DEFAULT_BRANDING_PACK = os.environ.get("FRONTEND_BRANDING_PACK", "ww-2025-circus").strip()
RIDESHARE_ENABLED_KEY = "rideshare_enabled"
DEFAULT_RIDESHARE_ENABLED = os.environ.get("RIDESHARE_ENABLED", "true").strip().lower() not in {
    "0",
    "false",
    "no",
}
FormStepScope = Literal["regular", "artist"]
FormStepType = Literal["ticket", "beverage", "food", "material"]
FORM_STEP_TYPES: tuple[FormStepType, ...] = ("ticket", "beverage", "food", "material")


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


def _normalize_http_url(value: str) -> str:
    return value.strip().rstrip("/")


def _is_local_development_url(value: str) -> bool:
    hostname = urlsplit(value).hostname
    return hostname in {"localhost", "127.0.0.1", "frontend", "backend"}


def _get_request_public_app_url() -> str:
    if not has_request_context():
        return ""

    return _normalize_http_url(request.url_root)


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


def get_public_app_url() -> str:
    """Get configured public frontend URL, or default value when missing."""
    request_public_app_url = _get_request_public_app_url()

    try:
        with closing(_connect_db()) as conn:
            _ensure_table_exists(conn)
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM AppSettings WHERE key = ?", (PUBLIC_APP_URL_KEY,))
            row = cursor.fetchone()
            if row:
                value = _normalize_http_url(str(row["value"] or ""))
                if value:
                    if (
                        request_public_app_url
                        and _is_local_development_url(value)
                        and not _is_local_development_url(request_public_app_url)
                    ):
                        logger.warning(
                            "Ignoring local development public app URL '%s' in favor of request origin '%s'",
                            value,
                            request_public_app_url,
                        )
                        return request_public_app_url

                    return value
    except sqlite3.Error as e:
        logger.error(f"Failed to read public app URL from AppSettings: {e}", exc_info=True)

    if request_public_app_url:
        return request_public_app_url

    return _normalize_http_url(DEFAULT_PUBLIC_APP_URL)


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


def set_public_app_url(public_app_url: str) -> bool:
    """Persist public frontend URL setting."""
    now = _now_iso()
    normalized_url = _normalize_http_url(public_app_url)

    try:
        with closing(_connect_db()) as conn:
            _ensure_table_exists(conn)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO AppSettings (key, value, updated_at) "
                "VALUES (?, ?, ?) "
                "ON CONFLICT(key) DO UPDATE SET value = excluded.value, "
                "updated_at = excluded.updated_at",
                (PUBLIC_APP_URL_KEY, normalized_url, now),
            )
            conn.commit()
            logger.info("Public app URL updated via app settings service")
            return True
    except sqlite3.Error as e:
        logger.error(f"Failed to update public app URL in AppSettings: {e}", exc_info=True)
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


def _get_form_step_description_key(scope: FormStepScope, step_type: FormStepType) -> str:
    return f"form_step_description:{scope}:{step_type}"


def get_form_step_description(scope: FormStepScope, step_type: FormStepType) -> str:
    """Return persisted description override for a configurable form step."""
    try:
        with closing(_connect_db()) as conn:
            _ensure_table_exists(conn)
            cursor = conn.cursor()
            cursor.execute(
                "SELECT value FROM AppSettings WHERE key = ?",
                (_get_form_step_description_key(scope, step_type),),
            )
            row = cursor.fetchone()
            if row:
                return str(row["value"] or "").strip()
    except sqlite3.Error as e:
        logger.error(
            f"Failed to read form step description for {scope}/{step_type}: {e}",
            exc_info=True,
        )

    return ""


def get_form_step_descriptions(scope: FormStepScope) -> dict[FormStepType, str]:
    """Return persisted description overrides for all configurable form steps."""
    return {step_type: get_form_step_description(scope, step_type) for step_type in FORM_STEP_TYPES}


def set_form_step_description(
    scope: FormStepScope, step_type: FormStepType, description: str
) -> bool:
    """Persist description override for a configurable form step."""
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
                (_get_form_step_description_key(scope, step_type), description.strip(), now),
            )
            conn.commit()
            logger.info(f"Updated form step description for {scope}/{step_type}")
            return True
    except sqlite3.Error as e:
        logger.error(
            f"Failed to update form step description for {scope}/{step_type}: {e}",
            exc_info=True,
        )
        return False
