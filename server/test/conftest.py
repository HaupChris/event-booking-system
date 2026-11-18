"""Shared pytest fixtures: isolated database, Flask test client, role tokens, mail capture.

The environment is prepared at import time, before any `src` module is imported, because
several services resolve the database path and initialize the schema on import.
"""

import base64
import os
import shutil
import sqlite3
import tempfile
from collections.abc import Callable, Iterator
from contextlib import closing
from pathlib import Path
from typing import Any

import pytest

_TEST_DIR = Path(tempfile.mkdtemp(prefix="wiesenwahn-tests-"))
_DB_PATH = _TEST_DIR / "bookings.db"
_TEMPLATE_DB_PATH = _TEST_DIR / "template.db"

TEST_PASSWORDS = {
    "user": "user-password-for-tests",
    "admin": "admin-password-for-tests",
    "artist": "artist-password-for-tests",
}

os.environ.update(
    {
        "DB_FILE_PATH": str(_DB_PATH),
        "JWT_SECRET_KEY": "test-secret-key-that-is-long-enough-for-jwt",
        "PASSWORD": TEST_PASSWORDS["user"],
        "ADMIN_PASSWORD": TEST_PASSWORDS["admin"],
        "ARTIST_PASSWORD": TEST_PASSWORDS["artist"],
        "GMAIL_USER": "test-sender@example.org",
        "GMAIL_PASS": "not-a-real-password",
        "ENABLE_APP_RATE_LIMITING": "false",
        "IN_DOCKER": "false",
    }
)

from flask.testing import FlaskClient  # noqa: E402
from flask_jwt_extended import create_access_token  # noqa: E402
from main import app as flask_app  # noqa: E402  (imports initialize the database)
from src.services import mail_service  # noqa: E402
from src.services.orga_team_service import create_orga_team_member  # noqa: E402

shutil.copyfile(_DB_PATH, _TEMPLATE_DB_PATH)

# Smallest valid PNG (1x1 pixel) as data URL, accepted by the signature validation.
SIGNATURE_DATA_URL = "data:image/png;base64," + base64.b64encode(
    bytes.fromhex(
        "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
        "1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082"
    )
).decode("ascii")


@pytest.fixture(autouse=True)
def fresh_database() -> Iterator[Path]:
    """Every test starts from the same freshly initialized database."""
    shutil.copyfile(_TEMPLATE_DB_PATH, _DB_PATH)
    return _DB_PATH


@pytest.fixture
def db() -> Callable[[str, tuple[Any, ...]], list[sqlite3.Row]]:
    """Run a query against the test database and return all rows."""

    def query(sql: str, params: tuple[Any, ...] = ()) -> list[sqlite3.Row]:
        with closing(sqlite3.connect(_DB_PATH)) as conn:
            conn.row_factory = sqlite3.Row
            return conn.execute(sql, params).fetchall()

    return query


@pytest.fixture(autouse=True)
def sent_mails(monkeypatch: pytest.MonkeyPatch) -> list[dict[str, Any]]:
    """Capture outgoing mails instead of sending them."""
    mails: list[dict[str, Any]] = []

    def capture(msg: Any, recipient: str) -> bool:
        parts = {part.get_content_type(): part.get_payload(decode=True) for part in msg.walk()}
        mails.append(
            {
                "recipient": recipient,
                "subject": str(msg["Subject"]),
                "html": (parts.get("text/html") or b"").decode("utf-8"),
                "text": (parts.get("text/plain") or b"").decode("utf-8"),
            }
        )
        return True

    monkeypatch.setattr(mail_service, "_send_message", capture)
    return mails


@pytest.fixture
def client() -> FlaskClient:
    return flask_app.test_client()


@pytest.fixture
def auth_headers() -> Callable[[str], dict[str, str]]:
    """Authorization headers with a valid JWT for the given role."""

    def headers_for(role: str) -> dict[str, str]:
        with flask_app.app_context():
            token = create_access_token(identity=role, additional_claims={"role": role})
        return {"Authorization": f"Bearer {token}"}

    return headers_for


@pytest.fixture
def inviter_id() -> int:
    return create_orga_team_member("Test Inviter")


@pytest.fixture
def booking_payload(inviter_id: int, db: Callable[..., list[sqlite3.Row]]) -> dict[str, Any]:
    """A valid regular booking as sent by the registration form."""
    timeslots = db(
        "SELECT MIN(ts.id) AS id FROM TimeSlots ts GROUP BY ts.workshift_id ORDER BY 1 LIMIT 3"
    )
    return {
        "last_name": "Muster",
        "first_name": "Erika",
        "email": "erika@example.org",
        "phone": "0123456789",
        "invited_by_id": inviter_id,
        "ticket_id": 0,
        "beverage_id": 0,
        "food_id": 0,
        "timeslot_priority_1": timeslots[0]["id"],
        "timeslot_priority_2": timeslots[1]["id"],
        "timeslot_priority_3": timeslots[2]["id"],
        "material_ids": [],
        "amount_shifts": 1,
        "supporter_buddy": "",
        "total_price": 0,
        "signature": SIGNATURE_DATA_URL,
        "is_paid": False,
        "paid_amount": 0,
        "payment_notes": "",
        "payment_date": "",
        "profession_ids": [],
    }
