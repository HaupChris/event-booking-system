"""S1: price and payment status are owned by the server, never by the client."""

from typing import Any

import pytest

from conftest import SIGNATURE_DATA_URL

FORGED_FIELDS = {
    "total_price": 0.01,
    "is_paid": True,
    "paid_amount": 500,
    "payment_notes": "already paid in cash",
    "payment_date": "2026-01-01",
}


def _option_price(db, table: str, option_id: int) -> float:
    return float(db(f"SELECT price FROM {table} WHERE id = ?", (option_id,))[0]["price"])  # noqa: S608  # test helper with fixed table names


def _first_food_price(db, table: str) -> float:
    return float(db(f"SELECT price FROM {table} ORDER BY id LIMIT 1")[0]["price"])  # noqa: S608  # test helper with fixed table names


def _stored_regular_booking(db) -> Any:
    rows = db("SELECT total_price, is_paid, paid_amount, payment_notes, payment_date FROM Bookings")
    assert len(rows) == 1
    return rows[0]


def _assert_payment_fields_are_defaults(row: Any) -> None:
    assert row["is_paid"] == 0
    assert row["paid_amount"] == 0
    assert row["payment_notes"] == ""
    assert row["payment_date"] in ("", None)


def test_regular_booking_ignores_client_price_and_payment_fields(
    client, auth_headers, booking_payload, db
) -> None:
    response = client.post(
        "/api/submitForm", json={**booking_payload, **FORGED_FIELDS}, headers=auth_headers("user")
    )

    assert response.status_code == 200, response.get_json()
    row = _stored_regular_booking(db)
    expected = (
        _option_price(db, "TicketOptions", 0)
        + _option_price(db, "BeverageOptions", 0)
        + _option_price(db, "FoodOptions", 0)
    )
    assert row["total_price"] == pytest.approx(expected)
    _assert_payment_fields_are_defaults(row)


@pytest.mark.parametrize("amount_shifts", [2, 3])
def test_regular_booking_applies_shift_discount_on_server(
    client, auth_headers, booking_payload, db, amount_shifts
) -> None:
    payload = {**booking_payload, "amount_shifts": amount_shifts, "total_price": 0}

    response = client.post("/api/submitForm", json=payload, headers=auth_headers("user"))

    assert response.status_code == 200, response.get_json()
    full_price = (
        _option_price(db, "TicketOptions", 0)
        + _option_price(db, "BeverageOptions", 0)
        + _option_price(db, "FoodOptions", 0)
    )
    discount = _first_food_price(db, "FoodOptions") * (amount_shifts - 1)
    assert _stored_regular_booking(db)["total_price"] == pytest.approx(full_price - discount)


@pytest.mark.parametrize("amount_shifts", [0, 4, 100, -1])
def test_regular_booking_rejects_invalid_shift_count(
    client, auth_headers, booking_payload, db, amount_shifts
) -> None:
    payload = {**booking_payload, "amount_shifts": amount_shifts}

    response = client.post("/api/submitForm", json=payload, headers=auth_headers("user"))

    assert response.status_code == 400
    assert db("SELECT id FROM Bookings") == []


def test_artist_booking_ignores_client_payment_fields(client, auth_headers, inviter_id, db) -> None:
    payload = {
        "artist_type": "dj",
        "last_name": "Sound",
        "first_name": "DJ",
        "email": "dj@example.org",
        "phone": "0123456789",
        "invited_by_id": inviter_id,
        "ticket_id": 0,
        "beverage_id": 0,
        "food_id": 0,
        "artist_material_ids": [],
        "signature": SIGNATURE_DATA_URL,
        **FORGED_FIELDS,
    }

    response = client.post("/api/artist/submitForm", json=payload, headers=auth_headers("artist"))

    assert response.status_code == 200, response.get_json()
    rows = db(
        "SELECT total_price, is_paid, paid_amount, payment_notes, payment_date FROM ArtistBookings"
    )
    assert len(rows) == 1
    expected = (
        _option_price(db, "ArtistTicketOptions", 0)
        + _option_price(db, "ArtistBeverageOptions", 0)
        + _option_price(db, "ArtistFoodOptions", 0)
    )
    assert rows[0]["total_price"] == pytest.approx(expected)
    _assert_payment_fields_are_defaults(rows[0])
