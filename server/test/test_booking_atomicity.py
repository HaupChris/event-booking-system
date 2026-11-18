"""S8: a booking is stored completely or not at all."""

import sqlite3

import pytest
from src.services import booking_service


def _row_counts(db) -> dict[str, int]:
    tables = ("Users", "Bookings", "BookingMaterials", "BookingProfessions")
    return {table: len(db(f"SELECT 1 FROM {table}")) for table in tables}  # noqa: S608  # fixed table names


@pytest.fixture
def payload_with_relations(booking_payload, db, fresh_database) -> dict:
    material_id = db("SELECT id FROM Materials ORDER BY id LIMIT 1")[0]["id"]
    with sqlite3.connect(fresh_database) as conn:  # professions are maintained by admins
        profession_id = conn.execute(
            "INSERT INTO Professions (title) VALUES ('Tontechnik')"
        ).lastrowid
    return {**booking_payload, "material_ids": [material_id], "profession_ids": [profession_id]}


def test_booking_with_relations_is_stored_completely(
    client, auth_headers, payload_with_relations, db
) -> None:
    response = client.post(
        "/api/submitForm", json=payload_with_relations, headers=auth_headers("user")
    )

    assert response.status_code == 200, response.get_json()
    assert _row_counts(db) == {
        "Users": 1,
        "Bookings": 1,
        "BookingMaterials": 1,
        "BookingProfessions": 1,
    }


def test_failure_after_partial_insert_rolls_back_everything(
    client, auth_headers, payload_with_relations, db, sent_mails, monkeypatch
) -> None:
    def fail(*_args, **_kwargs):
        raise sqlite3.OperationalError("simulated failure")

    monkeypatch.setattr(booking_service, "_insert_professions", fail)

    response = client.post(
        "/api/submitForm", json=payload_with_relations, headers=auth_headers("user")
    )

    assert response.status_code == 500
    assert set(_row_counts(db).values()) == {0}
    assert sent_mails == []


def test_duplicate_booking_is_rejected(client, auth_headers, booking_payload, db) -> None:
    first = client.post("/api/submitForm", json=booking_payload, headers=auth_headers("user"))
    second = client.post("/api/submitForm", json=booking_payload, headers=auth_headers("user"))

    assert first.status_code == 200
    assert second.status_code == 400
    assert second.get_json() == {"error": "Duplicate booking"}
    assert len(db("SELECT id FROM Bookings")) == 1
