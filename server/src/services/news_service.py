"""
News Service
============

Business logic for news feed management including:
- News CRUD operations
- Read status tracking
- News feed retrieval with read status
"""

import sqlite3
import os
from contextlib import closing
from typing import Dict, List, Optional, Any
from datetime import datetime

from src.utils.logger import get_logger

logger = get_logger(__name__)

IN_DOCKER = os.environ.get('IN_DOCKER', 'False').lower() == 'true'

if IN_DOCKER:
    DB_FILE_PATH = '/app/user_data/bookings.db'
else:
    DB_DIR = os.path.join(os.path.dirname(__file__), '../../db')
    DB_FILE_PATH = os.path.join(DB_DIR, 'bookings.db')


def _connect_db() -> sqlite3.Connection:
    """Returns a new SQLite connection."""
    try:
        conn = sqlite3.connect(DB_FILE_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"Failed to connect to database: {e}", exc_info=True)
        raise


def get_all_news(include_inactive: bool = False) -> List[Dict[str, Any]]:
    """Get all news items."""
    try:
        logger.debug(f"Fetching all news (include_inactive={include_inactive})")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            if include_inactive:
                cursor.execute("""
                    SELECT id, title, content, category, published_date, author, is_active
                    FROM News
                    ORDER BY published_date DESC
                """)
            else:
                cursor.execute("""
                    SELECT id, title, content, category, published_date, author, is_active
                    FROM News
                    WHERE is_active = 1
                    ORDER BY published_date DESC
                """)

            news_items = [dict(row) for row in cursor.fetchall()]

            logger.debug(f"Found {len(news_items)} news items")
            return news_items

    except sqlite3.Error as e:
        logger.error(f"Database error fetching news: {e}", exc_info=True)
        raise


def get_news_by_id(news_id: int) -> Optional[Dict[str, Any]]:
    """Get a specific news item by ID."""
    try:
        logger.debug(f"Fetching news item {news_id}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            cursor.execute("""
                SELECT id, title, content, category, published_date, author, is_active
                FROM News
                WHERE id = ?
            """, (news_id,))

            row = cursor.fetchone()

            if row:
                return dict(row)
            else:
                logger.warning(f"News item {news_id} not found")
                return None

    except sqlite3.Error as e:
        logger.error(f"Database error fetching news {news_id}: {e}", exc_info=True)
        raise


def create_news(title: str, content: str, category: str = None, author: str = None) -> int:
    """Create a new news item."""
    try:
        logger.debug(f"Creating news item: {title}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO News (title, content, category, author, published_date, is_active)
                VALUES (?, ?, ?, ?, ?, 1)
            """, (title, content, category, author, datetime.now().isoformat()))

            conn.commit()
            news_id = cursor.lastrowid

            logger.info(f"News item created with ID {news_id}: {title}")
            return news_id

    except sqlite3.Error as e:
        logger.error(f"Database error creating news: {e}", exc_info=True)
        raise


def update_news(news_id: int, title: str = None, content: str = None,
                category: str = None, author: str = None) -> bool:
    """Update an existing news item."""
    try:
        logger.debug(f"Updating news item {news_id}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            # Build update query dynamically based on provided fields
            updates = []
            params = []

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


def get_news_for_profile(profile_uuid: str) -> List[Dict[str, Any]]:
    """
    Get all active news items with read status for a specific profile.
    """
    try:
        logger.debug(f"Fetching news feed for profile {profile_uuid}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            # First, get the booking_id for this profile
            cursor.execute("""
                SELECT id FROM Bookings WHERE profile_uuid = ?
                UNION
                SELECT id FROM ArtistBookings WHERE profile_uuid = ?
            """, (profile_uuid, profile_uuid))

            row = cursor.fetchone()
            if not row:
                logger.warning(f"No booking found for profile {profile_uuid}")
                return []

            booking_id = row['id']

            # Get all active news with read status
            cursor.execute("""
                SELECT
                    n.id,
                    n.title,
                    n.content,
                    n.category,
                    n.published_date,
                    n.author,
                    CASE WHEN nrs.id IS NOT NULL THEN 1 ELSE 0 END as is_read,
                    nrs.read_date
                FROM News n
                LEFT JOIN NewsReadStatus nrs
                    ON n.id = nrs.news_id AND nrs.booking_id = ?
                WHERE n.is_active = 1
                ORDER BY n.published_date DESC
            """, (booking_id,))

            news_items = []
            for row in cursor.fetchall():
                news_items.append({
                    'id': row['id'],
                    'title': row['title'],
                    'content': row['content'],
                    'category': row['category'],
                    'published_date': row['published_date'],
                    'author': row['author'],
                    'is_read': bool(row['is_read']),
                    'read_date': row['read_date']
                })

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

            # Get the booking_id for this profile
            cursor.execute("""
                SELECT id FROM Bookings WHERE profile_uuid = ?
                UNION
                SELECT id FROM ArtistBookings WHERE profile_uuid = ?
            """, (profile_uuid, profile_uuid))

            row = cursor.fetchone()
            if not row:
                logger.warning(f"No booking found for profile {profile_uuid}")
                return False

            booking_id = row['id']

            # Insert or ignore (in case already marked as read)
            cursor.execute("""
                INSERT OR IGNORE INTO NewsReadStatus (booking_id, news_id, read_date)
                VALUES (?, ?, ?)
            """, (booking_id, news_id, datetime.now().isoformat()))

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

            # Get the booking_id for this profile
            cursor.execute("""
                SELECT id FROM Bookings WHERE profile_uuid = ?
                UNION
                SELECT id FROM ArtistBookings WHERE profile_uuid = ?
            """, (profile_uuid, profile_uuid))

            row = cursor.fetchone()
            if not row:
                return 0

            booking_id = row['id']

            # Count unread news
            cursor.execute("""
                SELECT COUNT(*) as count
                FROM News n
                LEFT JOIN NewsReadStatus nrs
                    ON n.id = nrs.news_id AND nrs.booking_id = ?
                WHERE n.is_active = 1 AND nrs.id IS NULL
            """, (booking_id,))

            count = cursor.fetchone()['count']

            logger.debug(f"Profile {profile_uuid} has {count} unread news items")
            return count

    except sqlite3.Error as e:
        logger.error(f"Database error getting unread count: {e}", exc_info=True)
        raise
