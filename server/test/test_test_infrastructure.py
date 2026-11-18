"""Smoke tests that guard the test setup itself."""

import os

from conftest import TEST_PASSWORDS


def test_uses_isolated_database(fresh_database) -> None:
    assert os.environ["DB_FILE_PATH"] == str(fresh_database)
    assert "wiesenwahn-tests-" in str(fresh_database)


def test_login_returns_token_for_each_role(client) -> None:
    for role, endpoint in [("user", ""), ("admin", "/admin"), ("artist", "/artist")]:
        response = client.post(f"/api/auth{endpoint}", json={"password": TEST_PASSWORDS[role]})
        assert response.status_code == 200, role
        assert response.get_json()["access_token"]


def test_valid_booking_is_stored_and_confirmed(
    client, auth_headers, booking_payload, db, sent_mails
):
    response = client.post("/api/submitForm", json=booking_payload, headers=auth_headers("user"))

    assert response.status_code == 200, response.get_json()
    assert len(db("SELECT id FROM Bookings")) == 1
    assert [mail["recipient"] for mail in sent_mails] == ["erika@example.org"]


def test_database_is_reset_between_tests(db) -> None:
    assert db("SELECT id FROM Bookings") == []
