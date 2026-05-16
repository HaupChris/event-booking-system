"""
News Service
============

Business logic for news feed management including:
- News CRUD operations
- Read status tracking
- News feed retrieval with read status
"""

import os
import sqlite3
from contextlib import closing
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from src.utils.logger import get_logger

logger = get_logger(__name__)

IN_DOCKER = os.environ.get("IN_DOCKER", "False").lower() == "true"

if IN_DOCKER:
    DB_FILE_PATH = "/app/user_data/bookings.db"
else:
    DB_DIR = Path(__file__).resolve().parent.parent.parent / "db"
    DB_FILE_PATH = str(DB_DIR / "bookings.db")

DEFAULT_NEWS_CATEGORIES = [
    ("announcement", "Ankuendigung", "announcement"),
    ("timetable", "Zeitplan", "calendar"),
    ("workshop", "Workshop", "workshop"),
    ("anreise", "Anreise", "travel"),
    ("general", "Allgemein", "info"),
]


def _now_iso() -> str:
    return datetime.now(tz=UTC).isoformat()


def _connect_db() -> sqlite3.Connection:
    """Returns a new SQLite connection."""
    try:
        conn = sqlite3.connect(DB_FILE_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"Failed to connect to database: {e}", exc_info=True)
        raise


def _ensure_news_tables(cursor: sqlite3.Cursor) -> None:
    cursor.executescript("""
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
        """)

    cursor.execute("PRAGMA table_info(News)")
    news_columns = {str(row[1]) for row in cursor.fetchall()}
    if "display_order" not in news_columns:
        cursor.execute("ALTER TABLE News ADD COLUMN display_order INTEGER")

    for category_key, label, icon in DEFAULT_NEWS_CATEGORIES:
        cursor.execute(
            """
            INSERT OR IGNORE INTO NewsCategories (category_key, label, icon, is_active)
            VALUES (?, ?, ?, 1)
            """,
            (category_key, label, icon),
        )

    cursor.execute(
        """
        SELECT id, display_order, published_date
        FROM News
        ORDER BY
            CASE WHEN display_order IS NULL THEN 1 ELSE 0 END ASC,
            display_order ASC,
            published_date ASC,
            id ASC
        """
    )
    ordered_news_rows = cursor.fetchall()

    if not ordered_news_rows:
        return

    orders = [row["display_order"] for row in ordered_news_rows]
    has_missing_order = any(order is None for order in orders)
    non_null_orders = [int(order) for order in orders if order is not None]
    has_duplicate_orders = len(non_null_orders) != len(set(non_null_orders))

    if not has_missing_order and not has_duplicate_orders:
        return

    for index, row in enumerate(ordered_news_rows, start=1):
        cursor.execute("UPDATE News SET display_order = ? WHERE id = ?", (index, row["id"]))


def get_all_news(include_inactive: bool = False) -> list[dict[str, Any]]:
    """Get all news items."""
    try:
        logger.debug(f"Fetching all news (include_inactive={include_inactive})")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            _ensure_news_tables(cursor)
            conn.commit()

            if include_inactive:
                cursor.execute("""
                    SELECT
                        n.id,
                        n.title,
                        n.content,
                        n.category,
                        n.published_date,
                        n.author,
                        n.is_active,
                        n.display_order,
                        COALESCE(c.label, n.category) as category_label,
                        c.icon as category_icon
                    FROM News n
                    LEFT JOIN NewsCategories c
                        ON n.category = c.category_key
                    ORDER BY n.display_order ASC, n.published_date ASC, n.id ASC
                """)
            else:
                cursor.execute("""
                    SELECT
                        n.id,
                        n.title,
                        n.content,
                        n.category,
                        n.published_date,
                        n.author,
                        n.is_active,
                        n.display_order,
                        COALESCE(c.label, n.category) as category_label,
                        c.icon as category_icon
                    FROM News n
                    LEFT JOIN NewsCategories c
                        ON n.category = c.category_key
                    WHERE n.is_active = 1
                    ORDER BY n.display_order ASC, n.published_date ASC, n.id ASC
                """)

            news_items = [dict(row) for row in cursor.fetchall()]

            logger.debug(f"Found {len(news_items)} news items")
            return news_items

    except sqlite3.Error as e:
        logger.error(f"Database error fetching news: {e}", exc_info=True)
        raise


def get_news_by_id(news_id: int) -> dict[str, Any] | None:
    """Get a specific news item by ID."""
    try:
        logger.debug(f"Fetching news item {news_id}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            _ensure_news_tables(cursor)
            conn.commit()

            cursor.execute(
                """
                SELECT
                    n.id,
                    n.title,
                    n.content,
                    n.category,
                    n.published_date,
                    n.author,
                    n.is_active,
                    n.display_order,
                    COALESCE(c.label, n.category) as category_label,
                    c.icon as category_icon
                FROM News n
                LEFT JOIN NewsCategories c
                    ON n.category = c.category_key
                WHERE n.id = ?
            """,
                (news_id,),
            )

            row = cursor.fetchone()

            if row:
                return dict(row)
            else:
                logger.warning(f"News item {news_id} not found")
                return None

    except sqlite3.Error as e:
        logger.error(f"Database error fetching news {news_id}: {e}", exc_info=True)
        raise


def create_news(
    title: str,
    content: str,
    category: str | None = None,
    author: str | None = None,
    is_active: bool = True,
) -> int:
    """Create a new news item."""
    try:
        logger.debug(f"Creating news item: {title}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            _ensure_news_tables(cursor)

            cursor.execute("SELECT COALESCE(MIN(display_order), 1) - 1 as next_order FROM News")
            next_order = int(cursor.fetchone()["next_order"])

            cursor.execute(
                """
                INSERT INTO News (title, content, category, author, published_date, is_active, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
                (title, content, category, author, _now_iso(), 1 if is_active else 0, next_order),
            )

            conn.commit()
            news_id = cursor.lastrowid

            if news_id is None:
                raise ValueError("Failed to create news item")

            logger.info(f"News item created with ID {news_id}: {title}")
            return int(news_id)

    except sqlite3.Error as e:
        logger.error(f"Database error creating news: {e}", exc_info=True)
        raise


def update_news(
    news_id: int,
    title: str | None = None,
    content: str | None = None,
    category: str | None = None,
    author: str | None = None,
    is_active: bool | None = None,
) -> bool:
    """Update an existing news item."""
    try:
        logger.debug(f"Updating news item {news_id}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            _ensure_news_tables(cursor)

            # Build update query dynamically based on provided fields
            updates = []
            params: list[Any] = []

            if title is not None:
                updates.append("title = ?")
                params.append(title)
            if content is not None:
                updates.append("content = ?")
                params.append(content)
            if category is not None:
                updates.append("category = ?")
                params.append(category)
            if author is not None:
                updates.append("author = ?")
                params.append(author)
            if is_active is not None:
                updates.append("is_active = ?")
                params.append(1 if is_active else 0)

            if not updates:
                logger.warning(f"No fields to update for news {news_id}")
                return False

            params.append(news_id)
            query = f"UPDATE News SET {', '.join(updates)} WHERE id = ?"

            cursor.execute(query, params)
            conn.commit()

            if cursor.rowcount > 0:
                logger.info(f"News item {news_id} updated successfully")
                return True
            else:
                logger.warning(f"News item {news_id} not found")
                return False

    except sqlite3.Error as e:
        logger.error(f"Database error updating news {news_id}: {e}", exc_info=True)
        raise


def delete_news(news_id: int, soft_delete: bool = True) -> bool:
    """
    Delete a news item.

    Args:
        news_id: ID of the news item
        soft_delete: If True, set is_active=0; if False, permanently delete
    """
    try:
        logger.debug(f"Deleting news item {news_id} (soft={soft_delete})")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            _ensure_news_tables(cursor)

            if soft_delete:
                cursor.execute("UPDATE News SET is_active = 0 WHERE id = ?", (news_id,))
            else:
                cursor.execute("DELETE FROM News WHERE id = ?", (news_id,))

            conn.commit()

            if cursor.rowcount > 0:
                logger.info(f"News item {news_id} deleted successfully")
                return True
            else:
                logger.warning(f"News item {news_id} not found")
                return False

    except sqlite3.Error as e:
        logger.error(f"Database error deleting news {news_id}: {e}", exc_info=True)
        raise


def move_news(news_id: int, direction: str) -> bool:
    """Move a news item one position up or down in display order."""
    normalized_direction = direction.strip().lower()
    if normalized_direction not in {"up", "down"}:
        raise ValueError("direction must be 'up' or 'down'")

    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        _ensure_news_tables(cursor)

        cursor.execute(
            """
            SELECT id, display_order
            FROM News
            ORDER BY display_order ASC, published_date ASC, id ASC
            """
        )
        ordered_news = cursor.fetchall()

        if not ordered_news:
            return False

        current_index = next(
            (index for index, row in enumerate(ordered_news) if row["id"] == news_id),
            None,
        )

        if current_index is None:
            return False

        target_index = current_index - 1 if normalized_direction == "up" else current_index + 1
        if target_index < 0 or target_index >= len(ordered_news):
            return False

        current_item = ordered_news[current_index]
        target_item = ordered_news[target_index]

        cursor.execute(
            "UPDATE News SET display_order = ? WHERE id = ?",
            (target_item["display_order"], current_item["id"]),
        )
        cursor.execute(
            "UPDATE News SET display_order = ? WHERE id = ?",
            (current_item["display_order"], target_item["id"]),
        )
        conn.commit()
        return True


def get_news_categories(include_inactive: bool = False) -> list[dict[str, Any]]:
    """Get available news categories."""
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        _ensure_news_tables(cursor)
        conn.commit()

        if include_inactive:
            cursor.execute("""
                SELECT id, category_key, label, icon, is_active
                FROM NewsCategories
                ORDER BY label ASC
                """)
        else:
            cursor.execute("""
                SELECT id, category_key, label, icon, is_active
                FROM NewsCategories
                WHERE is_active = 1
                ORDER BY label ASC
                """)

        return [dict(row) for row in cursor.fetchall()]


def create_news_category(category_key: str, label: str, icon: str) -> int:
    """Create a custom news category."""
    normalized_key = category_key.strip().lower()
    normalized_label = label.strip()
    normalized_icon = icon.strip().lower()

    if not normalized_key:
        raise ValueError("category_key is required")
    if not normalized_label:
        raise ValueError("label is required")
    if not normalized_icon:
        raise ValueError("icon is required")

    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        _ensure_news_tables(cursor)
        cursor.execute(
            """
            INSERT INTO NewsCategories (category_key, label, icon, is_active, updated_date)
            VALUES (?, ?, ?, 1, ?)
            """,
            (normalized_key, normalized_label, normalized_icon, _now_iso()),
        )
        conn.commit()
        if cursor.lastrowid is None:
            raise ValueError("Failed to create category")
        return int(cursor.lastrowid)


def update_news_category(
    category_id: int,
    label: str | None = None,
    icon: str | None = None,
    is_active: bool | None = None,
) -> bool:
    """Update label/icon/active-state for a category."""
    updates: list[str] = []
    params: list[Any] = []

    if label is not None:
        normalized_label = label.strip()
        if not normalized_label:
            raise ValueError("label cannot be empty")
        updates.append("label = ?")
        params.append(normalized_label)

    if icon is not None:
        normalized_icon = icon.strip().lower()
        if not normalized_icon:
            raise ValueError("icon cannot be empty")
        updates.append("icon = ?")
        params.append(normalized_icon)

    if is_active is not None:
        updates.append("is_active = ?")
        params.append(1 if is_active else 0)

    if not updates:
        return False

    updates.append("updated_date = ?")
    params.append(_now_iso())
    params.append(category_id)

    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        _ensure_news_tables(cursor)
        query = f"UPDATE NewsCategories SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(query, params)
        conn.commit()
        return cursor.rowcount > 0


def deactivate_news_category(category_id: int) -> bool:
    """Deactivate a category without deleting existing news entries."""
    return update_news_category(category_id=category_id, is_active=False)


def get_news_for_profile(profile_uuid: str) -> list[dict[str, Any]]:
    """
    Get all active news items with read status for a specific profile.
    """
    try:
        logger.debug(f"Fetching news feed for profile {profile_uuid}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            _ensure_news_tables(cursor)
            conn.commit()

            # First, get the booking_id for this profile
            cursor.execute(
                """
                SELECT id FROM Bookings WHERE profile_uuid = ?
                UNION
                SELECT id FROM ArtistBookings WHERE profile_uuid = ?
            """,
                (profile_uuid, profile_uuid),
            )

            row = cursor.fetchone()
            if not row:
                logger.warning(f"No booking found for profile {profile_uuid}")
                return []

            booking_id = row["id"]

            # Get all active news with read status
            cursor.execute(
                """
                SELECT
                    n.id,
                    n.title,
                    n.content,
                    n.category,
                    COALESCE(c.label, n.category) as category_label,
                    c.icon as category_icon,
                    n.published_date,
                    n.author,
                    n.display_order,
                    CASE WHEN nrs.id IS NOT NULL THEN 1 ELSE 0 END as is_read,
                    nrs.read_date
                FROM News n
                LEFT JOIN NewsCategories c
                    ON n.category = c.category_key
                LEFT JOIN NewsReadStatus nrs
                    ON n.id = nrs.news_id AND nrs.booking_id = ?
                WHERE n.is_active = 1
                ORDER BY n.display_order ASC, n.published_date ASC, n.id ASC
            """,
                (booking_id,),
            )

            news_items = [
                {
                    "id": row["id"],
                    "title": row["title"],
                    "content": row["content"],
                    "category": row["category"],
                    "category_label": row["category_label"],
                    "category_icon": row["category_icon"],
                    "published_date": row["published_date"],
                    "author": row["author"],
                    "display_order": row["display_order"],
                    "is_read": bool(row["is_read"]),
                    "read_date": row["read_date"],
                }
                for row in cursor.fetchall()
            ]

            logger.debug(f"Found {len(news_items)} news items for profile {profile_uuid}")
            return news_items

    except sqlite3.Error as e:
        logger.error(f"Database error fetching news for profile {profile_uuid}: {e}", exc_info=True)
        raise


def mark_news_as_read(profile_uuid: str, news_id: int) -> bool:
    """Mark a news item as read for a specific profile."""
    try:
        logger.debug(f"Marking news {news_id} as read for profile {profile_uuid}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            _ensure_news_tables(cursor)
            conn.commit()

            # Get the booking_id for this profile
            cursor.execute(
                """
                SELECT id FROM Bookings WHERE profile_uuid = ?
                UNION
                SELECT id FROM ArtistBookings WHERE profile_uuid = ?
            """,
                (profile_uuid, profile_uuid),
            )

            row = cursor.fetchone()
            if not row:
                logger.warning(f"No booking found for profile {profile_uuid}")
                return False

            booking_id = row["id"]

            # Insert or ignore (in case already marked as read)
            cursor.execute(
                """
                INSERT OR IGNORE INTO NewsReadStatus (booking_id, news_id, read_date)
                VALUES (?, ?, ?)
            """,
                (booking_id, news_id, _now_iso()),
            )

            conn.commit()

            if cursor.rowcount > 0:
                logger.info(f"News {news_id} marked as read for profile {profile_uuid}")
                return True
            else:
                logger.debug(f"News {news_id} already marked as read for profile {profile_uuid}")
                return True

    except sqlite3.Error as e:
        logger.error(f"Database error marking news as read: {e}", exc_info=True)
        raise


def get_unread_count(profile_uuid: str) -> int:
    """Get count of unread news items for a profile."""
    try:
        logger.debug(f"Getting unread count for profile {profile_uuid}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()
            _ensure_news_tables(cursor)
            conn.commit()

            # Get the booking_id for this profile
            cursor.execute(
                """
                SELECT id FROM Bookings WHERE profile_uuid = ?
                UNION
                SELECT id FROM ArtistBookings WHERE profile_uuid = ?
            """,
                (profile_uuid, profile_uuid),
            )

            row = cursor.fetchone()
            if not row:
                return 0

            booking_id = row["id"]

            # Count unread news
            cursor.execute(
                """
                SELECT COUNT(*) as count
                FROM News n
                LEFT JOIN NewsReadStatus nrs
                    ON n.id = nrs.news_id AND nrs.booking_id = ?
                WHERE n.is_active = 1 AND nrs.id IS NULL
            """,
                (booking_id,),
            )

            count = int(cursor.fetchone()["count"])

            logger.debug(f"Profile {profile_uuid} has {count} unread news items")
            return count

    except sqlite3.Error as e:
        logger.error(f"Database error getting unread count: {e}", exc_info=True)
        raise
