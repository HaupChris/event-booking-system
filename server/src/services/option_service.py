"""Ticket, beverage, and food option service for admin CRUD operations."""

import json
import os
import sqlite3
from contextlib import closing
from pathlib import Path
from typing import Any, Literal

OptionScope = Literal["regular", "artist"]
OptionType = Literal["ticket", "beverage", "food"]

IN_DOCKER = os.environ.get("IN_DOCKER", "False").lower() == "true"

if IN_DOCKER:
    DB_FILE_PATH = "/app/user_data/bookings.db"
    DATA_DIR = Path("/app/data")
else:
    DB_DIR = (Path(__file__).resolve().parent / "../../db").resolve()
    DB_FILE_PATH = str(DB_DIR / "bookings.db")
    DATA_DIR = (Path(__file__).resolve().parent / "../../data").resolve()

REGULAR_FORM_CONTENT_PATH = DATA_DIR / "form_content.json"
ARTIST_FORM_CONTENT_PATH = DATA_DIR / "artist_form_content.json"

TABLE_NAME_MAP: dict[tuple[OptionScope, OptionType], str] = {
    ("regular", "ticket"): "TicketOptions",
    ("regular", "beverage"): "BeverageOptions",
    ("regular", "food"): "FoodOptions",
    ("artist", "ticket"): "ArtistTicketOptions",
    ("artist", "beverage"): "ArtistBeverageOptions",
    ("artist", "food"): "ArtistFoodOptions",
}

BOOKING_TABLE_MAP: dict[OptionScope, str] = {
    "regular": "Bookings",
    "artist": "ArtistBookings",
}

BOOKING_COLUMN_MAP: dict[OptionType, str] = {
    "ticket": "ticket_option_id",
    "beverage": "beverage_option_id",
    "food": "food_option_id",
}

ALLOWED_TABLE_NAMES = set(TABLE_NAME_MAP.values()) | set(BOOKING_TABLE_MAP.values())


def _assert_allowed_table_name(table_name: str) -> str:
    if table_name not in ALLOWED_TABLE_NAMES:
        raise ValueError(f"Unexpected table name: {table_name}")
    return table_name


def _connect_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _table_has_column(cursor: sqlite3.Cursor, table_name: str, column_name: str) -> bool:
    table_name = _assert_allowed_table_name(table_name)
    cursor.execute(f"PRAGMA table_info({table_name})")
    return any(row[1] == column_name for row in cursor.fetchall())


def _normalize_non_negative_int(value: Any, default: int = 0) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    return parsed if parsed >= 0 else default


def _normalize_non_negative_float(value: Any, default: float = 0.0) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return default
    return parsed if parsed >= 0 else default


def _load_option_seed(path: Path, key: str) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)
    raw_options = data.get(key, [])
    if not isinstance(raw_options, list):
        return []
    return [option for option in raw_options if isinstance(option, dict)]


def _seed_ticket_table_if_empty(
    cursor: sqlite3.Cursor, table_name: str, options: list[dict[str, Any]]
) -> None:
    table_name = _assert_allowed_table_name(table_name)
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    if int(cursor.fetchone()[0]) > 0:
        return

    for idx, option in enumerate(options):
        title = str(option.get("title", "")).strip()
        if not title:
            continue
        working_title = str(option.get("working_title", "")).strip() or title
        cursor.execute(
            f"""
            INSERT INTO {table_name} (id, title, working_title, price, amount)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                idx,
                title,
                working_title,
                _normalize_non_negative_float(option.get("price", 0.0)),
                _normalize_non_negative_int(option.get("amount", 0)),
            ),
        )


def _seed_described_option_table_if_empty(
    cursor: sqlite3.Cursor, table_name: str, options: list[dict[str, Any]]
) -> None:
    table_name = _assert_allowed_table_name(table_name)
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    if int(cursor.fetchone()[0]) > 0:
        return

    for idx, option in enumerate(options):
        title = str(option.get("title", "")).strip()
        if not title:
            continue
        working_title = str(option.get("working_title", "")).strip() or title
        cursor.execute(
            f"""
            INSERT INTO {table_name} (id, title, working_title, description, price)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                idx,
                title,
                working_title,
                str(option.get("description", "")).strip(),
                _normalize_non_negative_float(option.get("price", 0.0)),
            ),
        )


def _ensure_schema(conn: sqlite3.Connection) -> None:
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS TicketOptions (
            id INTEGER PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            working_title TEXT,
            price REAL NOT NULL,
            amount INTEGER NOT NULL
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS BeverageOptions (
            id INTEGER PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            working_title TEXT,
            description TEXT,
            price REAL NOT NULL
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS FoodOptions (
            id INTEGER PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            working_title TEXT,
            description TEXT,
            price REAL NOT NULL
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS ArtistTicketOptions (
            id INTEGER PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            working_title TEXT,
            price REAL NOT NULL,
            amount INTEGER NOT NULL
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS ArtistBeverageOptions (
            id INTEGER PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            working_title TEXT,
            description TEXT,
            price REAL NOT NULL
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS ArtistFoodOptions (
            id INTEGER PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            working_title TEXT,
            description TEXT,
            price REAL NOT NULL
        )
        """
    )

    option_tables = [
        "TicketOptions",
        "BeverageOptions",
        "FoodOptions",
        "ArtistTicketOptions",
        "ArtistBeverageOptions",
        "ArtistFoodOptions",
    ]

    for table_name in option_tables:
        if not _table_has_column(cursor, table_name, "working_title"):
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN working_title TEXT")

        cursor.execute(
            f"""
            UPDATE {table_name}
            SET working_title = title
            WHERE working_title IS NULL OR TRIM(working_title) = ''
            """
        )

    regular_ticket_seed = _load_option_seed(REGULAR_FORM_CONTENT_PATH, "ticket_options")
    regular_beverage_seed = _load_option_seed(REGULAR_FORM_CONTENT_PATH, "beverage_options")
    regular_food_seed = _load_option_seed(REGULAR_FORM_CONTENT_PATH, "food_options")

    artist_ticket_seed = _load_option_seed(ARTIST_FORM_CONTENT_PATH, "ticket_options")
    artist_beverage_seed = _load_option_seed(ARTIST_FORM_CONTENT_PATH, "beverage_options")
    artist_food_seed = _load_option_seed(ARTIST_FORM_CONTENT_PATH, "food_options")

    _seed_ticket_table_if_empty(cursor, "TicketOptions", regular_ticket_seed)
    _seed_described_option_table_if_empty(cursor, "BeverageOptions", regular_beverage_seed)
    _seed_described_option_table_if_empty(cursor, "FoodOptions", regular_food_seed)

    _seed_ticket_table_if_empty(cursor, "ArtistTicketOptions", artist_ticket_seed)
    _seed_described_option_table_if_empty(cursor, "ArtistBeverageOptions", artist_beverage_seed)
    _seed_described_option_table_if_empty(cursor, "ArtistFoodOptions", artist_food_seed)

    conn.commit()


def ensure_option_schema() -> None:
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)


def _resolve_table_name(scope: OptionScope, option_type: OptionType) -> str:
    return _assert_allowed_table_name(TABLE_NAME_MAP[(scope, option_type)])


def get_options(scope: OptionScope, option_type: OptionType) -> list[dict[str, Any]]:
    table_name = _resolve_table_name(scope, option_type)
    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()

        if option_type == "ticket":
            cursor.execute(
                f"""
                SELECT
                    id,
                    title,
                    COALESCE(NULLIF(TRIM(working_title), ''), title) as working_title,
                    price,
                    amount
                FROM {table_name}
                ORDER BY id ASC
                """
            )
            rows = cursor.fetchall()
            return [
                {
                    "id": int(row["id"]),
                    "title": row["title"],
                    "working_title": row["working_title"],
                    "price": float(row["price"] or 0),
                    "amount": _normalize_non_negative_int(row["amount"], default=0),
                }
                for row in rows
            ]

        cursor.execute(
            f"""
            SELECT
                id,
                title,
                COALESCE(NULLIF(TRIM(working_title), ''), title) as working_title,
                description,
                price
            FROM {table_name}
            ORDER BY id ASC
            """
        )
        rows = cursor.fetchall()
        return [
            {
                "id": int(row["id"]),
                "title": row["title"],
                "working_title": row["working_title"],
                "description": row["description"] or "",
                "price": float(row["price"] or 0),
            }
            for row in rows
        ]


def create_option(  # noqa: PLR0913
    scope: OptionScope,
    option_type: OptionType,
    title: str,
    working_title: str | None = None,
    price: float = 0.0,
    amount: int = 0,
    description: str = "",
) -> int:
    table_name = _resolve_table_name(scope, option_type)
    clean_title = title.strip()
    clean_working_title = (working_title or clean_title).strip()

    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()

        if option_type == "ticket":
            cursor.execute(
                f"""
                INSERT INTO {table_name} (title, working_title, price, amount)
                VALUES (?, ?, ?, ?)
                """,
                (
                    clean_title,
                    clean_working_title,
                    _normalize_non_negative_float(price),
                    _normalize_non_negative_int(amount),
                ),
            )
        else:
            cursor.execute(
                f"""
                INSERT INTO {table_name} (title, working_title, description, price)
                VALUES (?, ?, ?, ?)
                """,
                (
                    clean_title,
                    clean_working_title,
                    description.strip(),
                    _normalize_non_negative_float(price),
                ),
            )

        conn.commit()
        row_id = cursor.lastrowid
        return row_id if row_id is not None else -1


def update_option(  # noqa: PLR0913
    scope: OptionScope,
    option_type: OptionType,
    option_id: int,
    title: str | None = None,
    working_title: str | None = None,
    price: float | None = None,
    amount: int | None = None,
    description: str | None = None,
) -> bool:
    table_name = _resolve_table_name(scope, option_type)

    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()

        updates: list[str] = []
        values: list[Any] = []

        if title is not None:
            updates.append("title = ?")
            values.append(title.strip())

        if working_title is not None:
            updates.append("working_title = ?")
            values.append(working_title.strip())

        if price is not None:
            updates.append("price = ?")
            values.append(_normalize_non_negative_float(price))

        if option_type == "ticket" and amount is not None:
            updates.append("amount = ?")
            values.append(_normalize_non_negative_int(amount))

        if option_type in {"beverage", "food"} and description is not None:
            updates.append("description = ?")
            values.append(description.strip())

        if not updates:
            return False

        values.append(option_id)
        cursor.execute(
            f"UPDATE {table_name} SET {', '.join(updates)} WHERE id = ?",
            tuple(values),
        )
        conn.commit()
        return cursor.rowcount > 0


def delete_option(scope: OptionScope, option_type: OptionType, option_id: int) -> tuple[bool, str]:
    table_name = _resolve_table_name(scope, option_type)
    usage_table = _assert_allowed_table_name(BOOKING_TABLE_MAP[scope])
    usage_column = BOOKING_COLUMN_MAP[option_type]

    with closing(_connect_db()) as conn:
        _ensure_schema(conn)
        cursor = conn.cursor()

        cursor.execute(f"SELECT id FROM {table_name} WHERE id = ?", (option_id,))
        if not cursor.fetchone():
            return False, "Option not found"

        cursor.execute(
            f"SELECT COUNT(*) FROM {usage_table} WHERE {usage_column} = ?",
            (option_id,),
        )
        usage_count = int(cursor.fetchone()[0])
        if usage_count > 0:
            return False, "Option is in use and cannot be deleted"

        cursor.execute(f"DELETE FROM {table_name} WHERE id = ?", (option_id,))
        conn.commit()
        return True, "Option deleted"


ensure_option_schema()
