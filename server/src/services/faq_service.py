"""
FAQ Service
===========

Business logic for FAQ management including:
- FAQ CRUD operations
- Category CRUD operations
- Grouped FAQ retrieval for public display
"""

import os
import sqlite3
from contextlib import closing
from datetime import datetime
from typing import Any

from src.utils.logger import get_logger

logger = get_logger(__name__)

IN_DOCKER = os.environ.get("IN_DOCKER", "False").lower() == "true"

if IN_DOCKER:
    DB_FILE_PATH = "/app/user_data/bookings.db"
else:
    DB_DIR = os.path.join(os.path.dirname(__file__), "../../db")  # noqa: PTH118, PTH120  # lint-baseline
    DB_FILE_PATH = os.path.join(DB_DIR, "bookings.db")  # noqa: PTH118  # lint-baseline


def _connect_db() -> sqlite3.Connection:
    """Returns a new SQLite connection."""
    try:
        conn = sqlite3.connect(DB_FILE_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"Failed to connect to database: {e}", exc_info=True)
        raise


def get_all_faqs(include_inactive: bool = False, category_id: int = None) -> list[dict[str, Any]]:
    """Get all FAQ items."""
    try:
        logger.debug(
            f"Fetching all FAQs (include_inactive={include_inactive}, category_id={category_id})"
        )

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            query = """
                SELECT
                    f.id,
                    f.question,
                    f.answer,
                    f.category_id,
                    f.display_order,
                    f.is_active,
                    f.created_date,
                    f.updated_date,
                    c.name as category_name
                FROM FAQs f
                LEFT JOIN FAQCategories c ON f.category_id = c.id
            """

            conditions = []
            params = []

            if not include_inactive:
                conditions.append("f.is_active = 1")

            if category_id is not None:
                conditions.append("f.category_id = ?")
                params.append(category_id)

            if conditions:
                query += " WHERE " + " AND ".join(conditions)

            query += " ORDER BY f.display_order, f.id"

            cursor.execute(query, params)
            faqs = [dict(row) for row in cursor.fetchall()]

            logger.debug(f"Found {len(faqs)} FAQ items")
            return faqs

    except sqlite3.Error as e:
        logger.error(f"Database error fetching FAQs: {e}", exc_info=True)
        raise


def get_faq_by_id(faq_id: int) -> dict[str, Any] | None:
    """Get a specific FAQ item by ID."""
    try:
        logger.debug(f"Fetching FAQ item {faq_id}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT
                    f.id,
                    f.question,
                    f.answer,
                    f.category_id,
                    f.display_order,
                    f.is_active,
                    f.created_date,
                    f.updated_date,
                    c.name as category_name
                FROM FAQs f
                LEFT JOIN FAQCategories c ON f.category_id = c.id
                WHERE f.id = ?
            """,
                (faq_id,),
            )

            row = cursor.fetchone()

            if row:
                return dict(row)
            else:
                logger.warning(f"FAQ item {faq_id} not found")
                return None

    except sqlite3.Error as e:
        logger.error(f"Database error fetching FAQ {faq_id}: {e}", exc_info=True)
        raise


def create_faq(question: str, answer: str, category_id: int, display_order: int = 0) -> int:
    """Create a new FAQ item."""
    try:
        logger.debug(f"Creating FAQ item: {question[:50]}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            now = datetime.now().isoformat()  # noqa: DTZ005  # lint-baseline

            cursor.execute(
                """
                INSERT INTO FAQs (question, answer, category_id, display_order, is_active, created_date, updated_date)
                VALUES (?, ?, ?, ?, 1, ?, ?)
            """,
                (question, answer, category_id, display_order, now, now),
            )

            conn.commit()
            faq_id = cursor.lastrowid

            logger.info(f"FAQ item created with ID {faq_id}: {question[:50]}")
            return faq_id

    except sqlite3.Error as e:
        logger.error(f"Database error creating FAQ: {e}", exc_info=True)
        raise


def update_faq(  # noqa: PLR0913  # lint-baseline
    faq_id: int,
    question: str = None,
    answer: str = None,
    category_id: int = None,
    display_order: int = None,
    is_active: bool = None,
) -> bool:
    """Update an existing FAQ item."""
    try:
        logger.debug(f"Updating FAQ item {faq_id}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            # Build update query dynamically based on provided fields
            updates = []
            params = []

            if question is not None:
                updates.append("question = ?")
                params.append(question)
            if answer is not None:
                updates.append("answer = ?")
                params.append(answer)
            if category_id is not None:
                updates.append("category_id = ?")
                params.append(category_id)
            if display_order is not None:
                updates.append("display_order = ?")
                params.append(display_order)
            if is_active is not None:
                updates.append("is_active = ?")
                params.append(1 if is_active else 0)

            if not updates:
                logger.warning(f"No fields to update for FAQ {faq_id}")
                return False

            # Always update updated_date
            updates.append("updated_date = ?")
            params.append(datetime.now().isoformat())  # noqa: DTZ005  # lint-baseline

            params.append(faq_id)
            query = f"UPDATE FAQs SET {', '.join(updates)} WHERE id = ?"  # noqa: S608  # lint-baseline

            cursor.execute(query, params)
            conn.commit()

            if cursor.rowcount > 0:
                logger.info(f"FAQ item {faq_id} updated successfully")
                return True
            else:
                logger.warning(f"FAQ item {faq_id} not found")
                return False

    except sqlite3.Error as e:
        logger.error(f"Database error updating FAQ {faq_id}: {e}", exc_info=True)
        raise


def delete_faq(faq_id: int, soft_delete: bool = True) -> bool:
    """
    Delete a FAQ item.

    Args:
        faq_id: ID of the FAQ item
        soft_delete: If True, set is_active=0; if False, permanently delete
    """
    try:
        logger.debug(f"Deleting FAQ item {faq_id} (soft={soft_delete})")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            if soft_delete:
                cursor.execute("UPDATE FAQs SET is_active = 0 WHERE id = ?", (faq_id,))
            else:
                cursor.execute("DELETE FROM FAQs WHERE id = ?", (faq_id,))

            conn.commit()

            if cursor.rowcount > 0:
                logger.info(f"FAQ item {faq_id} deleted successfully")
                return True
            else:
                logger.warning(f"FAQ item {faq_id} not found")
                return False

    except sqlite3.Error as e:
        logger.error(f"Database error deleting FAQ {faq_id}: {e}", exc_info=True)
        raise


def get_all_faq_categories(include_inactive: bool = False) -> list[dict[str, Any]]:
    """Get all FAQ categories."""
    try:
        logger.debug(f"Fetching all FAQ categories (include_inactive={include_inactive})")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            if include_inactive:
                cursor.execute(
                    """
                    SELECT id, name, display_order, is_active, created_date
                    FROM FAQCategories
                    ORDER BY display_order, id
                """
                )
            else:
                cursor.execute(
                    """
                    SELECT id, name, display_order, is_active, created_date
                    FROM FAQCategories
                    WHERE is_active = 1
                    ORDER BY display_order, id
                """
                )

            categories = [dict(row) for row in cursor.fetchall()]

            logger.debug(f"Found {len(categories)} FAQ categories")
            return categories

    except sqlite3.Error as e:
        logger.error(f"Database error fetching FAQ categories: {e}", exc_info=True)
        raise


def get_faq_category_by_id(category_id: int) -> dict[str, Any] | None:
    """Get a specific FAQ category by ID."""
    try:
        logger.debug(f"Fetching FAQ category {category_id}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT id, name, display_order, is_active, created_date
                FROM FAQCategories
                WHERE id = ?
            """,
                (category_id,),
            )

            row = cursor.fetchone()

            if row:
                return dict(row)
            else:
                logger.warning(f"FAQ category {category_id} not found")
                return None

    except sqlite3.Error as e:
        logger.error(f"Database error fetching FAQ category {category_id}: {e}", exc_info=True)
        raise


def create_faq_category(name: str, display_order: int = 0) -> int:
    """Create a new FAQ category."""
    try:
        logger.debug(f"Creating FAQ category: {name}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO FAQCategories (name, display_order, is_active, created_date)
                VALUES (?, ?, 1, ?)
            """,
                (name, display_order, datetime.now().isoformat()),  # noqa: DTZ005  # lint-baseline
            )

            conn.commit()
            category_id = cursor.lastrowid

            logger.info(f"FAQ category created with ID {category_id}: {name}")
            return category_id

    except sqlite3.Error as e:
        logger.error(f"Database error creating FAQ category: {e}", exc_info=True)
        raise


def update_faq_category(
    category_id: int,
    name: str = None,
    display_order: int = None,
    is_active: bool = None,
) -> bool:
    """Update an existing FAQ category."""
    try:
        logger.debug(f"Updating FAQ category {category_id}")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            # Build update query dynamically based on provided fields
            updates = []
            params = []

            if name is not None:
                updates.append("name = ?")
                params.append(name)
            if display_order is not None:
                updates.append("display_order = ?")
                params.append(display_order)
            if is_active is not None:
                updates.append("is_active = ?")
                params.append(1 if is_active else 0)

            if not updates:
                logger.warning(f"No fields to update for FAQ category {category_id}")
                return False

            params.append(category_id)
            query = f"UPDATE FAQCategories SET {', '.join(updates)} WHERE id = ?"  # noqa: S608  # lint-baseline

            cursor.execute(query, params)
            conn.commit()

            if cursor.rowcount > 0:
                logger.info(f"FAQ category {category_id} updated successfully")
                return True
            else:
                logger.warning(f"FAQ category {category_id} not found")
                return False

    except sqlite3.Error as e:
        logger.error(f"Database error updating FAQ category {category_id}: {e}", exc_info=True)
        raise


def delete_faq_category(category_id: int, soft_delete: bool = True) -> bool:
    """
    Delete a FAQ category.

    Args:
        category_id: ID of the FAQ category
        soft_delete: If True, set is_active=0; if False, permanently delete
    """
    try:
        logger.debug(f"Deleting FAQ category {category_id} (soft={soft_delete})")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            if soft_delete:
                cursor.execute(
                    "UPDATE FAQCategories SET is_active = 0 WHERE id = ?", (category_id,)
                )
            else:
                cursor.execute("DELETE FROM FAQCategories WHERE id = ?", (category_id,))

            conn.commit()

            if cursor.rowcount > 0:
                logger.info(f"FAQ category {category_id} deleted successfully")
                return True
            else:
                logger.warning(f"FAQ category {category_id} not found")
                return False

    except sqlite3.Error as e:
        logger.error(f"Database error deleting FAQ category {category_id}: {e}", exc_info=True)
        raise


def get_faqs_grouped_by_category() -> dict[str, Any]:
    """
    Get all active FAQs grouped by their categories for public display.

    Returns a structure with categories containing their associated FAQs,
    ordered by display_order for both categories and FAQs.
    """
    try:
        logger.debug("Fetching FAQs grouped by category for public display")

        with closing(_connect_db()) as conn:
            cursor = conn.cursor()

            # Get all active categories ordered by display_order
            cursor.execute(
                """
                SELECT id, name, display_order
                FROM FAQCategories
                WHERE is_active = 1
                ORDER BY display_order, id
            """
            )

            categories = []

            for cat_row in cursor.fetchall():
                category = {
                    "id": cat_row["id"],
                    "name": cat_row["name"],
                    "display_order": cat_row["display_order"],
                    "faqs": [],
                }

                # Get all active FAQs for this category
                cursor.execute(
                    """
                    SELECT id, question, answer, display_order
                    FROM FAQs
                    WHERE category_id = ? AND is_active = 1
                    ORDER BY display_order, id
                """,
                    (cat_row["id"],),
                )

                for faq_row in cursor.fetchall():
                    category["faqs"].append(
                        {
                            "id": faq_row["id"],
                            "question": faq_row["question"],
                            "answer": faq_row["answer"],
                            "display_order": faq_row["display_order"],
                        }
                    )

                categories.append(category)

            result = {"categories": categories}

            logger.debug(f"Found {len(categories)} categories with FAQs for public display")
            return result

    except sqlite3.Error as e:
        logger.error(f"Database error fetching grouped FAQs: {e}", exc_info=True)
        raise
