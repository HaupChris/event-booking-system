"""Phase L / PR 2: pseudonyms and the event history per booking."""

import json
import os
from pathlib import Path
from typing import Any

import pytest
from src.services import mail_service
from src.services.booking_events_service import record_booking_event
from src.utils.pseudonyms import booking_ref, email_ref

from conftest import SIGNATURE_DATA_URL

LOG_DIR = Path(os.environ["LOG_DIR"])


def _submit_with_request_id(client, auth_headers, payload) -> tuple[int, str]:
    response = client.post("/api/submitForm", json=payload, headers=auth_headers("user"))
    assert response.status_code == 200, response.get_json()
    bookings = client.get("/api/data", headers=auth_headers("admin")).get_json()
    return max(booking["id"] for booking in bookings), response.headers["X-Request-ID"]


def _submit(client, auth_headers, payload) -> int:
    return _submit_with_request_id(client, auth_headers, payload)[0]


def _history(client, auth_headers, booking_type: str, booking_id: int) -> dict[str, Any]:
    response = client.get(
        f"/api/admin/bookings/{booking_type}/{booking_id}/events", headers=auth_headers("admin")
    )
    assert response.status_code == 200, response.get_json()
    return dict(response.get_json())


def _event_names(history: dict) -> list[str]:
    return [event["event"] for event in history["events"]]


def test_booking_refs_distinguish_regular_and_artist() -> None:
    assert booking_ref("regular", 123) == "R-123"
    assert booking_ref("artist", 45) == "A-45"


def test_email_ref_is_stable_case_insensitive_and_not_the_email() -> None:
    ref = email_ref("Erika@Example.org ")

    assert ref == email_ref("erika@example.org")
    assert ref != email_ref("max@example.org")
    assert ref.startswith("e:")
    assert len(ref) == 10
    assert "erika" not in ref


def test_unknown_event_names_are_rejected() -> None:
    with pytest.raises(ValueError, match="Unknown booking event"):
        record_booking_event("regular", 1, "something_else")


def test_regular_booking_records_creation_and_confirmation(
    client, auth_headers, booking_payload
) -> None:
    booking_id = _submit(client, auth_headers, booking_payload)

    history = _history(client, auth_headers, "regular", booking_id)

    assert history["booking_ref"] == f"R-{booking_id}"
    assert _event_names(history) == ["booking_created", "confirmation_mail_sent"]
    assert history["events"][0]["details"] == {"ticket_id": 0, "amount_shifts": 1}


def test_failed_confirmation_mail_is_recorded(
    client, auth_headers, booking_payload, monkeypatch
) -> None:
    monkeypatch.setattr(mail_service, "_send_message", lambda *_args: False)

    booking_id = _submit(client, auth_headers, booking_payload)

    assert _event_names(_history(client, auth_headers, "regular", booking_id)) == [
        "booking_created",
        "confirmation_mail_failed",
    ]


def test_payment_update_is_recorded(client, auth_headers, booking_payload) -> None:
    booking_id = _submit(client, auth_headers, booking_payload)

    response = client.put(
        f"/api/booking/{booking_id}/payment",
        json={"is_paid": True, "paid_amount": 55.5, "payment_notes": "", "payment_date": ""},
        headers=auth_headers("admin"),
    )

    assert response.status_code == 200, response.get_json()
    last = _history(client, auth_headers, "regular", booking_id)["events"][-1]
    assert last["event"] == "payment_updated"
    assert last["details"] == {"is_paid": True, "paid_amount": 55.5}


def test_profile_link_request_is_recorded(client, auth_headers, booking_payload) -> None:
    booking_id = _submit(client, auth_headers, booking_payload)

    response = client.post("/api/profile/recover", json={"email": booking_payload["email"]})

    assert response.status_code == 200
    assert "profile_link_requested" in _event_names(
        _history(client, auth_headers, "regular", booking_id)
    )


def test_deleting_a_booking_deletes_its_history(client, auth_headers, booking_payload, db) -> None:
    booking_id = _submit(client, auth_headers, booking_payload)

    response = client.delete(f"/api/booking/{booking_id}", headers=auth_headers("admin"))

    assert response.status_code == 200
    assert db("SELECT id FROM BookingEvents") == []


def test_artist_booking_records_creation_and_confirmation(
    client, auth_headers, inviter_id, db
) -> None:
    payload = {
        "artist_type": "dj",
        "first_name": "DJ",
        "last_name": "Sound",
        "email": "dj@example.org",
        "phone": "0123",
        "invited_by_id": inviter_id,
        "ticket_id": 0,
        "beverage_id": 0,
        "food_id": 0,
        "artist_material_ids": [],
        "signature": SIGNATURE_DATA_URL,
    }
    response = client.post("/api/artist/submitForm", json=payload, headers=auth_headers("artist"))
    assert response.status_code == 200, response.get_json()
    booking_id = db("SELECT id FROM ArtistBookings")[0]["id"]

    history = _history(client, auth_headers, "artist", booking_id)

    assert history["booking_ref"] == f"A-{booking_id}"
    assert _event_names(history) == ["booking_created", "confirmation_mail_sent"]


def test_events_are_logged_with_booking_ref_and_without_personal_data(
    client, auth_headers, booking_payload
) -> None:
    booking_id, request_id = _submit_with_request_id(client, auth_headers, booking_payload)

    lines = (LOG_DIR / "app.log").read_text(encoding="utf-8").splitlines()
    events = [json.loads(line) for line in lines if f'"{request_id}"' in line]
    created = [event for event in events if event["event"] == "booking_created"]

    assert len(created) == 1
    assert created[0]["booking_ref"] == f"R-{booking_id}"
    assert booking_payload["email"] not in json.dumps(created[0])


def test_unknown_booking_type_is_rejected(client, auth_headers) -> None:
    response = client.get("/api/admin/bookings/other/1/events", headers=auth_headers("admin"))

    assert response.status_code == 400
