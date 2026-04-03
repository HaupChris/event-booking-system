import sqlite3
from contextlib import closing
from datetime import UTC, datetime
from typing import Any

from src.services.profile_service import _connect_db
from src.utils.logger import get_logger

logger = get_logger(__name__)

POST_TYPE_OFFER = "offer"
POST_TYPE_REQUEST = "request"
ACTIVE_STATUS = "active"
COMPLETED_STATUS = "completed"
PENDING_STATUS = "pending"
APPROVED_STATUS = "approved"
REJECTED_STATUS = "rejected"
CANCELLED_STATUS = "cancelled"


def _now_iso() -> str:
    return datetime.now(tz=UTC).isoformat()


def _ensure_rideshare_schema(cursor: sqlite3.Cursor) -> None:
    cursor.executescript("""
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
            is_completed INTEGER NOT NULL DEFAULT 0,
            completed_date TEXT,
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
        """)

    cursor.execute("PRAGMA table_info(RideSharePosts)")
    columns = {str(row[1]) for row in cursor.fetchall()}
    schema_changed = False

    if "is_completed" not in columns:
        cursor.execute(
            "ALTER TABLE RideSharePosts ADD COLUMN is_completed INTEGER NOT NULL DEFAULT 0"
        )
        schema_changed = True

    if "completed_date" not in columns:
        cursor.execute("ALTER TABLE RideSharePosts ADD COLUMN completed_date TEXT")
        schema_changed = True

    if schema_changed:
        cursor.connection.commit()


def _resolve_post_status(status: str, is_completed: bool) -> str:
    if is_completed:
        return COMPLETED_STATUS
    return status


def _compose_display_name(first_name: str | None, last_name: str | None) -> str:
    first = (first_name or "").strip()
    last = (last_name or "").strip()
    if first and last:
        return f"{first} {last}"
    return first or last or "Unbekannt"


def _get_profile_identity(cursor: sqlite3.Cursor, profile_uuid: str) -> dict[str, str] | None:
    cursor.execute(
        """
        SELECT b.profile_uuid, u.first_name, u.last_name, u.phone_number
        FROM Bookings b
        JOIN Users u ON b.user_id = u.id
        WHERE b.profile_uuid = ?
        """,
        (profile_uuid,),
    )
    regular = cursor.fetchone()
    if regular:
        return {
            "profile_uuid": regular["profile_uuid"],
            "display_name": _compose_display_name(regular["first_name"], regular["last_name"]),
            "phone_number": regular["phone_number"] or "",
        }

    cursor.execute(
        """
        SELECT ab.profile_uuid, a.first_name, a.last_name, a.phone_number
        FROM ArtistBookings ab
        JOIN Artists a ON ab.artist_id = a.id
        WHERE ab.profile_uuid = ?
        """,
        (profile_uuid,),
    )
    artist = cursor.fetchone()
    if artist:
        return {
            "profile_uuid": artist["profile_uuid"],
            "display_name": _compose_display_name(artist["first_name"], artist["last_name"]),
            "phone_number": artist["phone_number"] or "",
        }

    return None


def _validate_departure_time(value: str) -> str:
    candidate = (value or "").strip()
    if not candidate:
        raise ValueError("departure_time is required")

    parsed_value = candidate.replace("Z", "+00:00")
    try:
        datetime.fromisoformat(parsed_value)
    except ValueError as exc:
        raise ValueError("departure_time must be a valid ISO datetime") from exc

    return candidate


def _validate_non_empty_field(value: str, field_name: str) -> str:
    normalized = (value or "").strip()
    if not normalized:
        raise ValueError(f"{field_name} is required")
    return normalized


def _normalize_seats_total(seats_total: Any, post_type: str) -> int | None:
    if post_type == POST_TYPE_REQUEST:
        return None

    if seats_total is None:
        raise ValueError("seats_total is required for offers")

    try:
        parsed = int(seats_total)
    except (TypeError, ValueError) as exc:
        raise ValueError("seats_total must be a whole number") from exc

    if parsed < 1:
        raise ValueError("seats_total must be at least 1")
    if parsed > 20:
        raise ValueError("seats_total must be 20 or less")
    return parsed


def _get_approved_count(cursor: sqlite3.Cursor, post_id: int) -> int:
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM RideShareJoinRequests
        WHERE post_id = ? AND status = ?
        """,
        (post_id, APPROVED_STATUS),
    )
    row = cursor.fetchone()
    return int(row[0]) if row else 0


def _get_approved_count_map(cursor: sqlite3.Cursor) -> dict[int, int]:
    cursor.execute(
        """
        SELECT post_id, COUNT(*) AS approved_count
        FROM RideShareJoinRequests
        WHERE status = ?
        GROUP BY post_id
        """,
        (APPROVED_STATUS,),
    )
    return {int(row["post_id"]): int(row["approved_count"]) for row in cursor.fetchall()}


def _get_requester_status_map(
    cursor: sqlite3.Cursor, requester_profile_uuid: str
) -> dict[int, str]:
    cursor.execute(
        """
        SELECT post_id, status
        FROM RideShareJoinRequests
        WHERE requester_profile_uuid = ?
        """,
        (requester_profile_uuid,),
    )
    return {int(row["post_id"]): str(row["status"]) for row in cursor.fetchall()}


def _serialize_post(
    row: sqlite3.Row,
    owner_display_name: str,
    approved_count_map: dict[int, int],
    requester_status: str | None,
    viewer_profile_uuid: str,
) -> dict[str, Any]:
    post_id = int(row["id"])
    post_type = str(row["post_type"])
    seats_total = row["seats_total"]
    seats_taken = approved_count_map.get(post_id, 0) if post_type == POST_TYPE_OFFER else 0
    seats_available = 0

    if post_type == POST_TYPE_OFFER and seats_total is not None:
        seats_available = max(int(seats_total) - seats_taken, 0)

    is_completed = bool(row["is_completed"])
    effective_status = _resolve_post_status(str(row["status"]), is_completed)
    is_active = effective_status == ACTIVE_STATUS
    can_join_offer = post_type == POST_TYPE_OFFER and seats_available > 0
    can_react_to_request = post_type == POST_TYPE_REQUEST
    can_join = (
        row["owner_profile_uuid"] != viewer_profile_uuid
        and is_active
        and requester_status not in {PENDING_STATUS, APPROVED_STATUS}
        and (can_join_offer or can_react_to_request)
    )

    return {
        "id": post_id,
        "owner_profile_uuid": row["owner_profile_uuid"],
        "owner_display_name": owner_display_name,
        "post_type": post_type,
        "origin": row["origin"],
        "destination": row["destination"],
        "departure_time": row["departure_time"],
        "seats_total": int(seats_total) if seats_total is not None else None,
        "seats_taken": seats_taken,
        "seats_available": seats_available,
        "notes": row["notes"],
        "status": effective_status,
        "is_completed": is_completed,
        "created_date": row["created_date"],
        "updated_date": row["updated_date"],
        "is_own_post": row["owner_profile_uuid"] == viewer_profile_uuid,
        "can_join": can_join,
        "my_request_status": requester_status,
    }


def get_rideshare_board(profile_uuid: str) -> dict[str, Any]:  # noqa: PLR0915
    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        _ensure_rideshare_schema(cursor)

        viewer = _get_profile_identity(cursor, profile_uuid)
        if not viewer:
            raise LookupError("Profile not found")

        approved_count_map = _get_approved_count_map(cursor)
        requester_status_map = _get_requester_status_map(cursor, profile_uuid)
        owner_cache: dict[str, dict[str, str]] = {profile_uuid: viewer}

        def resolve_owner(owner_profile_uuid: str) -> dict[str, str]:
            if owner_profile_uuid not in owner_cache:
                owner_cache[owner_profile_uuid] = _get_profile_identity(
                    cursor, owner_profile_uuid
                ) or {
                    "profile_uuid": owner_profile_uuid,
                    "display_name": "Unbekannt",
                    "phone_number": "",
                }
            return owner_cache[owner_profile_uuid]

        cursor.execute(
            """
            SELECT *
            FROM RideSharePosts
            WHERE status = ?
              AND COALESCE(is_completed, 0) = 0
            ORDER BY departure_time ASC, created_date DESC
            """,
            (ACTIVE_STATUS,),
        )
        active_posts = cursor.fetchall()

        offers: list[dict[str, Any]] = []
        requests: list[dict[str, Any]] = []

        for post_row in active_posts:
            owner = resolve_owner(str(post_row["owner_profile_uuid"]))
            serialized = _serialize_post(
                row=post_row,
                owner_display_name=owner["display_name"],
                approved_count_map=approved_count_map,
                requester_status=requester_status_map.get(int(post_row["id"])),
                viewer_profile_uuid=profile_uuid,
            )
            if serialized["post_type"] == POST_TYPE_OFFER:
                offers.append(serialized)
            else:
                requests.append(serialized)

        cursor.execute(
            """
            SELECT *
            FROM RideSharePosts
            WHERE owner_profile_uuid = ?
            ORDER BY created_date DESC
            """,
            (profile_uuid,),
        )
        my_post_rows = cursor.fetchall()
        my_posts = [
            _serialize_post(
                row=row,
                owner_display_name=viewer["display_name"],
                approved_count_map=approved_count_map,
                requester_status=requester_status_map.get(int(row["id"])),
                viewer_profile_uuid=profile_uuid,
            )
            for row in my_post_rows
        ]

        cursor.execute(
            """
            SELECT
                jr.id,
                jr.post_id,
                jr.requester_profile_uuid,
                jr.status,
                jr.created_date,
                jr.responded_date,
                p.origin,
                p.destination,
                p.departure_time,
                p.owner_profile_uuid,
                p.post_type,
                p.status as post_status,
                p.is_completed
            FROM RideShareJoinRequests jr
            JOIN RideSharePosts p ON p.id = jr.post_id
            WHERE p.owner_profile_uuid = ?
            ORDER BY CASE jr.status
                WHEN 'pending' THEN 0
                WHEN 'approved' THEN 1
                WHEN 'rejected' THEN 2
                ELSE 3
            END, jr.created_date DESC
            """,
            (profile_uuid,),
        )
        incoming_rows = cursor.fetchall()
        incoming_join_requests: list[dict[str, Any]] = []
        for row in incoming_rows:
            requester = _get_profile_identity(cursor, str(row["requester_profile_uuid"])) or {
                "display_name": "Unbekannt",
                "phone_number": "",
                "profile_uuid": str(row["requester_profile_uuid"]),
            }
            incoming_join_requests.append(
                {
                    "id": int(row["id"]),
                    "post_id": int(row["post_id"]),
                    "post_origin": row["origin"],
                    "post_destination": row["destination"],
                    "post_departure_time": row["departure_time"],
                    "post_owner_profile_uuid": row["owner_profile_uuid"],
                    "post_owner_display_name": viewer["display_name"],
                    "post_type": row["post_type"],
                    "post_status": _resolve_post_status(
                        str(row["post_status"]), bool(row["is_completed"])
                    ),
                    "requester_profile_uuid": row["requester_profile_uuid"],
                    "requester_display_name": requester["display_name"],
                    "status": row["status"],
                    "created_date": row["created_date"],
                    "responded_date": row["responded_date"],
                    "phone_number": (
                        requester["phone_number"] if row["status"] == APPROVED_STATUS else None
                    ),
                }
            )

        cursor.execute(
            """
            SELECT
                jr.id,
                jr.post_id,
                jr.requester_profile_uuid,
                jr.status,
                jr.created_date,
                jr.responded_date,
                p.origin,
                p.destination,
                p.departure_time,
                p.owner_profile_uuid,
                p.post_type,
                p.status as post_status,
                p.is_completed
            FROM RideShareJoinRequests jr
            JOIN RideSharePosts p ON p.id = jr.post_id
            WHERE jr.requester_profile_uuid = ?
            ORDER BY jr.created_date DESC
            """,
            (profile_uuid,),
        )
        my_request_rows = cursor.fetchall()
        my_join_requests: list[dict[str, Any]] = []
        for row in my_request_rows:
            owner = resolve_owner(str(row["owner_profile_uuid"]))
            my_join_requests.append(
                {
                    "id": int(row["id"]),
                    "post_id": int(row["post_id"]),
                    "post_origin": row["origin"],
                    "post_destination": row["destination"],
                    "post_departure_time": row["departure_time"],
                    "post_owner_profile_uuid": row["owner_profile_uuid"],
                    "post_owner_display_name": owner["display_name"],
                    "post_type": row["post_type"],
                    "post_status": _resolve_post_status(
                        str(row["post_status"]), bool(row["is_completed"])
                    ),
                    "requester_profile_uuid": row["requester_profile_uuid"],
                    "requester_display_name": viewer["display_name"],
                    "status": row["status"],
                    "created_date": row["created_date"],
                    "responded_date": row["responded_date"],
                    "phone_number": (
                        owner["phone_number"] if row["status"] == APPROVED_STATUS else None
                    ),
                }
            )

        visible_contacts: list[dict[str, Any]] = []
        contact_keys: set[tuple[str, int, str]] = set()

        cursor.execute(
            """
            SELECT
                p.id as post_id,
                p.origin,
                p.destination,
                p.departure_time,
                p.post_type,
                jr.requester_profile_uuid
            FROM RideShareJoinRequests jr
            JOIN RideSharePosts p ON p.id = jr.post_id
            WHERE p.owner_profile_uuid = ?
              AND jr.status = ?
            ORDER BY p.departure_time ASC
            """,
            (profile_uuid, APPROVED_STATUS),
        )
        for row in cursor.fetchall():
            requester_identity = _get_profile_identity(cursor, str(row["requester_profile_uuid"]))
            if requester_identity is None or not requester_identity["phone_number"]:
                continue
            requester = requester_identity
            relation = "passenger" if row["post_type"] == POST_TYPE_OFFER else "driver"
            key = (relation, int(row["post_id"]), requester["profile_uuid"])
            if key in contact_keys:
                continue
            contact_keys.add(key)
            visible_contacts.append(
                {
                    "relation": relation,
                    "profile_uuid": requester["profile_uuid"],
                    "display_name": requester["display_name"],
                    "phone_number": requester["phone_number"],
                    "post_id": int(row["post_id"]),
                    "origin": row["origin"],
                    "destination": row["destination"],
                    "departure_time": row["departure_time"],
                }
            )

        cursor.execute(
            """
            SELECT
                p.id as post_id,
                p.origin,
                p.destination,
                p.departure_time,
                p.post_type,
                p.owner_profile_uuid
            FROM RideShareJoinRequests jr
            JOIN RideSharePosts p ON p.id = jr.post_id
            WHERE jr.requester_profile_uuid = ?
              AND jr.status = ?
            ORDER BY p.departure_time ASC
            """,
            (profile_uuid, APPROVED_STATUS),
        )
        for row in cursor.fetchall():
            owner = resolve_owner(str(row["owner_profile_uuid"]))
            if not owner["phone_number"]:
                continue
            relation = "driver" if row["post_type"] == POST_TYPE_OFFER else "passenger"
            key = (relation, int(row["post_id"]), owner["profile_uuid"])
            if key in contact_keys:
                continue
            contact_keys.add(key)
            visible_contacts.append(
                {
                    "relation": relation,
                    "profile_uuid": owner["profile_uuid"],
                    "display_name": owner["display_name"],
                    "phone_number": owner["phone_number"],
                    "post_id": int(row["post_id"]),
                    "origin": row["origin"],
                    "destination": row["destination"],
                    "departure_time": row["departure_time"],
                }
            )

        return {
            "offers": offers,
            "requests": requests,
            "my_posts": my_posts,
            "incoming_join_requests": incoming_join_requests,
            "my_join_requests": my_join_requests,
            "visible_contacts": visible_contacts,
        }


def create_rideshare_post(  # noqa: PLR0913
    profile_uuid: str,
    post_type: str,
    origin: str,
    destination: str,
    departure_time: str,
    seats_total: Any = None,
    notes: str | None = None,
) -> int:
    normalized_post_type = (post_type or "").strip().lower()
    if normalized_post_type not in {POST_TYPE_OFFER, POST_TYPE_REQUEST}:
        raise ValueError("post_type must be 'offer' or 'request'")

    normalized_origin = _validate_non_empty_field(origin, "origin")
    normalized_destination = _validate_non_empty_field(destination, "destination")
    normalized_departure_time = _validate_departure_time(departure_time)
    normalized_seats_total = _normalize_seats_total(seats_total, normalized_post_type)
    normalized_notes = notes.strip() if notes and notes.strip() else None

    with closing(_connect_db()) as conn:
        cursor = conn.cursor()
        _ensure_rideshare_schema(cursor)

        if not _get_profile_identity(cursor, profile_uuid):
            raise LookupError("Profile not found")

        cursor.execute(
            """
            INSERT INTO RideSharePosts (
                owner_profile_uuid,
                post_type,
                origin,
                destination,
                departure_time,
                seats_total,
                notes,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                profile_uuid,
                normalized_post_type,
                normalized_origin,
                normalized_destination,
                normalized_departure_time,
                normalized_seats_total,
                normalized_notes,
                ACTIVE_STATUS,
            ),
        )
        conn.commit()

        if cursor.lastrowid is None:
            raise ValueError("Failed to create rideshare post")
        return int(cursor.lastrowid)


def request_join_offer(profile_uuid: str, post_id: int) -> int:
    with closing(_connect_db()) as conn:
        conn.execute("BEGIN IMMEDIATE")
        cursor = conn.cursor()
        _ensure_rideshare_schema(cursor)

        if not _get_profile_identity(cursor, profile_uuid):
            raise LookupError("Profile not found")

        cursor.execute(
            """
            SELECT id, owner_profile_uuid, post_type, status, is_completed, seats_total
            FROM RideSharePosts
            WHERE id = ?
            """,
            (post_id,),
        )
        post = cursor.fetchone()
        if not post:
            raise LookupError("Ride share post not found")

        if post["status"] != ACTIVE_STATUS or bool(post["is_completed"]):
            raise ValueError("This post is no longer active")
        if post["owner_profile_uuid"] == profile_uuid:
            raise ValueError("You cannot react to your own post")

        if post["post_type"] == POST_TYPE_OFFER:
            approved_count = _get_approved_count(cursor, post_id)
            seats_total = int(post["seats_total"] or 0)
            if approved_count >= seats_total:
                raise ValueError("No seats left for this offer")

        cursor.execute(
            """
            SELECT id, status
            FROM RideShareJoinRequests
            WHERE post_id = ? AND requester_profile_uuid = ?
            """,
            (post_id, profile_uuid),
        )
        existing = cursor.fetchone()

        now = _now_iso()

        if existing:
            existing_status = str(existing["status"])
            if existing_status in {PENDING_STATUS, APPROVED_STATUS}:
                raise ValueError("You already have an active response for this post")

            cursor.execute(
                """
                UPDATE RideShareJoinRequests
                SET message = NULL,
                    status = ?,
                    created_date = ?,
                    responded_date = NULL
                WHERE id = ?
                """,
                (PENDING_STATUS, now, int(existing["id"])),
            )
            request_id = int(existing["id"])
        else:
            cursor.execute(
                """
                INSERT INTO RideShareJoinRequests (post_id, requester_profile_uuid, message, status)
                VALUES (?, ?, ?, ?)
                """,
                (post_id, profile_uuid, None, PENDING_STATUS),
            )
            if cursor.lastrowid is None:
                raise ValueError("Failed to create join request")
            request_id = int(cursor.lastrowid)

        conn.commit()
        return request_id


def react_to_rideshare_post(profile_uuid: str, post_id: int) -> int:
    return request_join_offer(profile_uuid=profile_uuid, post_id=post_id)


def approve_join_request(profile_uuid: str, request_id: int) -> bool:
    with closing(_connect_db()) as conn:
        conn.execute("BEGIN IMMEDIATE")
        cursor = conn.cursor()
        _ensure_rideshare_schema(cursor)

        if not _get_profile_identity(cursor, profile_uuid):
            raise LookupError("Profile not found")

        cursor.execute(
            """
            SELECT
                jr.id,
                jr.post_id,
                jr.status,
                p.owner_profile_uuid,
                p.post_type,
                p.status AS post_status,
                p.is_completed,
                p.seats_total
            FROM RideShareJoinRequests jr
            JOIN RideSharePosts p ON p.id = jr.post_id
            WHERE jr.id = ?
            """,
            (request_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise LookupError("Join request not found")

        if row["owner_profile_uuid"] != profile_uuid:
            raise ValueError("You can only manage responses for your own posts")
        if row["post_status"] != ACTIVE_STATUS or bool(row["is_completed"]):
            raise ValueError("This post is no longer active")
        if row["status"] != PENDING_STATUS:
            raise ValueError("Only pending requests can be approved")

        if row["post_type"] == POST_TYPE_OFFER:
            post_id = int(row["post_id"])
            seats_total = int(row["seats_total"] or 0)
            approved_count = _get_approved_count(cursor, post_id)
            if approved_count >= seats_total:
                raise ValueError("No seats left for this offer")

        cursor.execute(
            """
            UPDATE RideShareJoinRequests
            SET status = ?,
                responded_date = ?
            WHERE id = ?
            """,
            (APPROVED_STATUS, _now_iso(), request_id),
        )
        conn.commit()
        return True


def reject_join_request(profile_uuid: str, request_id: int) -> bool:
    with closing(_connect_db()) as conn:
        conn.execute("BEGIN IMMEDIATE")
        cursor = conn.cursor()
        _ensure_rideshare_schema(cursor)

        if not _get_profile_identity(cursor, profile_uuid):
            raise LookupError("Profile not found")

        cursor.execute(
            """
            SELECT
                jr.id,
                jr.status,
                p.owner_profile_uuid,
                p.post_type,
                p.status AS post_status,
                p.is_completed
            FROM RideShareJoinRequests jr
            JOIN RideSharePosts p ON p.id = jr.post_id
            WHERE jr.id = ?
            """,
            (request_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise LookupError("Join request not found")

        if row["owner_profile_uuid"] != profile_uuid:
            raise ValueError("You can only manage responses for your own posts")
        if row["post_status"] != ACTIVE_STATUS or bool(row["is_completed"]):
            raise ValueError("This post is no longer active")
        if row["status"] != PENDING_STATUS:
            raise ValueError("Only pending requests can be rejected")

        cursor.execute(
            """
            UPDATE RideShareJoinRequests
            SET status = ?,
                responded_date = ?
            WHERE id = ?
            """,
            (REJECTED_STATUS, _now_iso(), request_id),
        )
        conn.commit()
        return True


def complete_rideshare_post(profile_uuid: str, post_id: int) -> bool:
    with closing(_connect_db()) as conn:
        conn.execute("BEGIN IMMEDIATE")
        cursor = conn.cursor()
        _ensure_rideshare_schema(cursor)

        if not _get_profile_identity(cursor, profile_uuid):
            raise LookupError("Profile not found")

        cursor.execute(
            """
            SELECT id, owner_profile_uuid, status, is_completed
            FROM RideSharePosts
            WHERE id = ?
            """,
            (post_id,),
        )
        post = cursor.fetchone()
        if not post:
            raise LookupError("Post not found")
        if post["owner_profile_uuid"] != profile_uuid:
            raise ValueError("You can only complete your own posts")

        if post["status"] == CANCELLED_STATUS:
            raise ValueError("Removed posts cannot be marked as completed")

        if bool(post["is_completed"]):
            return True

        now = _now_iso()
        cursor.execute(
            """
            UPDATE RideSharePosts
            SET is_completed = 1,
                completed_date = ?,
                updated_date = ?
            WHERE id = ?
            """,
            (now, now, post_id),
        )
        cursor.execute(
            """
            UPDATE RideShareJoinRequests
            SET status = ?,
                responded_date = ?
            WHERE post_id = ? AND status = ?
            """,
            (CANCELLED_STATUS, now, post_id, PENDING_STATUS),
        )

        conn.commit()
        return True


def cancel_rideshare_post(profile_uuid: str, post_id: int) -> bool:
    with closing(_connect_db()) as conn:
        conn.execute("BEGIN IMMEDIATE")
        cursor = conn.cursor()
        _ensure_rideshare_schema(cursor)

        if not _get_profile_identity(cursor, profile_uuid):
            raise LookupError("Profile not found")

        cursor.execute(
            """
            SELECT id, owner_profile_uuid, status, is_completed
            FROM RideSharePosts
            WHERE id = ?
            """,
            (post_id,),
        )
        post = cursor.fetchone()
        if not post:
            raise LookupError("Post not found")
        if post["owner_profile_uuid"] != profile_uuid:
            raise ValueError("You can only cancel your own posts")

        if post["status"] == CANCELLED_STATUS:
            return True

        now = _now_iso()
        cursor.execute(
            """
            UPDATE RideSharePosts
            SET status = ?,
                is_completed = 0,
                updated_date = ?
            WHERE id = ?
            """,
            (CANCELLED_STATUS, now, post_id),
        )
        cursor.execute(
            """
            UPDATE RideShareJoinRequests
            SET status = ?,
                responded_date = ?
            WHERE post_id = ? AND status = ?
            """,
            (CANCELLED_STATUS, now, post_id, PENDING_STATUS),
        )

        conn.commit()
        return True
