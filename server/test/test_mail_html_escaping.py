"""S2: user input must be HTML-escaped in emails."""

from src.services.mail_service import send_profile_recovery_mail

from conftest import SIGNATURE_DATA_URL

SCRIPT = "<script>alert(1)</script>"
IMG = '<img src=x onerror="alert(2)">'
LINK = '<a href="https://evil.example">Jetzt zahlen</a>'


def _assert_escaped(html: str) -> None:
    for raw in (SCRIPT, IMG, LINK):
        assert raw not in html
    assert "&lt;script&gt;" in html


def test_regular_confirmation_mail_escapes_user_input(
    client, auth_headers, booking_payload, sent_mails
) -> None:
    payload = {
        **booking_payload,
        "first_name": SCRIPT,
        "last_name": IMG,
        "supporter_buddy": LINK,
    }

    response = client.post("/api/submitForm", json=payload, headers=auth_headers("user"))

    assert response.status_code == 200, response.get_json()
    assert len(sent_mails) == 1
    _assert_escaped(sent_mails[0]["html"])


def test_artist_confirmation_mail_escapes_user_input(
    client, auth_headers, inviter_id, sent_mails
) -> None:
    payload = {
        "artist_type": "dj",
        "first_name": SCRIPT,
        "last_name": IMG,
        "email": "dj@example.org",
        "phone": "0123456789",
        "invited_by_id": inviter_id,
        "ticket_id": 0,
        "beverage_id": 0,
        "food_id": 0,
        "artist_material_ids": [],
        "signature": SIGNATURE_DATA_URL,
        "equipment": LINK,
        "special_requests": SCRIPT,
    }

    response = client.post("/api/artist/submitForm", json=payload, headers=auth_headers("artist"))

    assert response.status_code == 200, response.get_json()
    assert len(sent_mails) == 1
    _assert_escaped(sent_mails[0]["html"])


def test_profile_recovery_mail_escapes_names(sent_mails) -> None:
    send_profile_recovery_mail(
        "erika@example.org",
        [
            {
                "profile_uuid": "00000000-0000-4000-8000-000000000000",
                "name": f"{SCRIPT} {IMG} {LINK}",
                "booking_type": "regular",
                "timestamp": "2026-11-18 12:00:00",
            }
        ],
    )

    assert len(sent_mails) == 1
    _assert_escaped(sent_mails[0]["html"])
