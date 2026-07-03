import pytest
from src.services import admin_booking_mail_service as service


def test_normalize_selected_booking_recipients_deduplicates_and_normalizes() -> None:
    recipients = service.normalize_selected_booking_recipients(
        [
            {"booking_id": "12", "booking_type": "regular"},
            {"booking_id": 12, "booking_type": "regular"},
            {"booking_id": 7, "booking_type": "ARTIST"},
        ]
    )

    assert recipients == [
        {"booking_id": 12, "booking_type": "regular"},
        {"booking_id": 7, "booking_type": "artist"},
    ]


def test_validate_custom_mail_templates_rejects_unknown_tokens() -> None:
    with pytest.raises(ValueError, match="Unsupported template tokens"):
        service.validate_custom_mail_templates(
            "Hallo {{first_name}}",
            "Dein unbekannter Token ist {{not_supported}}",
        )


def test_preview_custom_booking_mails_renders_multiple_samples(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    selected_bookings = [
        {"booking_id": 1, "booking_type": "regular"},
        {"booking_id": 2, "booking_type": "artist"},
        {"booking_id": 3, "booking_type": "regular"},
        {"booking_id": 4, "booking_type": "artist"},
    ]
    resolved_contexts = [
        (
            selected_bookings[0],
            {
                "first_name": "Ada",
                "full_name": "Ada Lovelace",
                "email": "ada@example.com",
                "profile_url": "https://wiesenwahn.de/profile/a1",
                "booking_type": "regular",
                "ticket_title": "Supporter",
                "payment_link": "https://pay.example.com",
            },
        ),
        (
            selected_bookings[1],
            {
                "first_name": "Grace",
                "full_name": "Grace Hopper",
                "email": "grace@example.com",
                "profile_url": "https://wiesenwahn.de/profile/a2",
                "booking_type": "artist",
                "ticket_title": "Artist",
                "payment_link": "https://pay.example.com",
            },
        ),
        (
            selected_bookings[2],
            {
                "first_name": "Linus",
                "full_name": "Linus Torvalds",
                "email": "linus@example.com",
                "profile_url": "https://wiesenwahn.de/profile/a3",
                "booking_type": "regular",
                "ticket_title": "Crew",
                "payment_link": "https://pay.example.com",
            },
        ),
        (
            selected_bookings[3],
            {
                "first_name": "Margaret",
                "full_name": "Margaret Hamilton",
                "email": "margaret@example.com",
                "profile_url": "https://wiesenwahn.de/profile/a4",
                "booking_type": "artist",
                "ticket_title": "Artist",
                "payment_link": "https://pay.example.com",
            },
        ),
    ]

    monkeypatch.setattr(
        service, "_resolve_selected_booking_contexts", lambda _selected: resolved_contexts
    )

    result = service.preview_custom_booking_mails(
        "Hallo {{first_name}}",
        "Profil: {{profile_url}}\nTicket: {{ticket_title}}",
        selected_bookings,
    )

    assert result["total_recipient_count"] == 4
    assert result["preview_count"] == 3
    assert result["truncated"] is True
    assert result["previews"][0]["subject"] == "Hallo Ada"
    assert (
        result["previews"][1]["body"] == "Profil: https://wiesenwahn.de/profile/a2\nTicket: Artist"
    )


def test_send_custom_booking_mails_reports_partial_failures(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    selected_bookings = [
        {"booking_id": 10, "booking_type": "regular"},
        {"booking_id": 11, "booking_type": "artist"},
    ]
    resolved_contexts = [
        (
            selected_bookings[0],
            {
                "first_name": "Ada",
                "full_name": "Ada Lovelace",
                "email": "ada@example.com",
                "profile_url": "https://wiesenwahn.de/profile/a10",
                "booking_type": "regular",
                "ticket_title": "Supporter",
                "payment_link": "https://pay.example.com",
            },
        ),
        (
            selected_bookings[1],
            {
                "first_name": "Grace",
                "full_name": "Grace Hopper",
                "email": "grace@example.com",
                "profile_url": "https://wiesenwahn.de/profile/a11",
                "booking_type": "artist",
                "ticket_title": "Artist",
                "payment_link": "https://pay.example.com",
            },
        ),
    ]

    monkeypatch.setattr(
        service, "_resolve_selected_booking_contexts", lambda _selected: resolved_contexts
    )
    monkeypatch.setattr(
        service,
        "send_email",
        lambda recipient, _subject, _body: recipient == "ada@example.com",
    )

    result = service.send_custom_booking_mails(
        "Hallo {{first_name}}",
        "Profil: {{profile_url}}",
        selected_bookings,
    )

    assert result["sent"] == 1
    assert result["failed"] == 1
    assert result["failures"] == ["artist:11 (grace@example.com)"]
