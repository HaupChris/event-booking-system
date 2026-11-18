"""Phase L / PR 1: structured logging (rules in docs/LOGGING.md)."""

import json
import os
import re
from pathlib import Path
from typing import Any

import pytest
from src.utils.logger import (
    MAX_VALUE_LENGTH,
    REDACTED,
    TRUNCATED,
    get_logger,
    sanitize_event,
)

LOG_DIR = Path(os.environ["LOG_DIR"])


def _read_events(filename: str) -> list[dict[str, Any]]:
    path = LOG_DIR / filename
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


def _events_for(filename: str, request_id: str) -> list[dict[str, Any]]:
    return [event for event in _read_events(filename) if event.get("request_id") == request_id]


def test_every_response_carries_a_request_id(client) -> None:
    first = client.get("/api/health/simple")
    second = client.get("/api/health/simple")

    for response in (first, second):
        assert re.fullmatch(r"[0-9a-f]{8}", response.headers["X-Request-ID"])
    assert first.headers["X-Request-ID"] != second.headers["X-Request-ID"]


def test_request_is_logged_once_as_json_with_masked_uuid(client) -> None:
    response = client.get("/api/profile/00000000-0000-4000-8000-000000000000")
    request_id = response.headers["X-Request-ID"]

    finished = [
        event
        for event in _events_for("app.log", request_id)
        if event["event"] == "request_finished"
    ]

    assert len(finished) == 1
    assert finished[0] | {"duration_ms": 0} == finished[0] | {
        "method": "GET",
        "route": "profile.get_profile",
        "path": "/api/profile/<uuid>",
        "status": 404,
        "duration_ms": 0,
    }
    assert "00000000-0000-4000-8000-000000000000" not in json.dumps(finished[0])


def test_events_carry_request_id_and_real_callsite(client, auth_headers, booking_payload) -> None:
    payload = {**booking_payload, "amount_shifts": 9}

    response = client.post("/api/submitForm", json=payload, headers=auth_headers("user"))
    events = _events_for("app.log", response.headers["X-Request-ID"])

    rejected = [event for event in events if event["logger"] == "src.api.bookings"]
    assert rejected, events
    assert rejected[0]["where"].startswith("submit_form:")


def test_security_events_go_only_to_the_security_log(client) -> None:
    response = client.post("/api/auth", json={"password": "definitely-wrong-password"})
    request_id = response.headers["X-Request-ID"]

    security = _events_for("security.log", request_id)
    assert [event["event"] for event in security] == ["auth_failed"]
    assert security[0]["role"] == "user"
    assert security[0]["client_ip"]
    assert security[0]["where"].startswith("authenticate:")  # the caller, not the helper
    assert all("client_ip" not in event for event in _events_for("app.log", request_id))


@pytest.mark.parametrize(
    "key",
    ["password", "access_token", "Authorization", "signature", "email", "phone", "profile_uuid"],
)
def test_sensitive_attributes_are_redacted(key) -> None:
    assert sanitize_event(None, "info", {"event": "x", key: "secret"})[key] == REDACTED


def test_pseudonym_attributes_are_kept() -> None:
    event = {"event": "x", "email_ref": "e:9f2c41", "booking_ref": "R-1"}

    assert sanitize_event(None, "info", dict(event)) == event


def test_oversized_values_are_truncated() -> None:
    event = sanitize_event(
        None, "info", {"event": "x", "user_agent": "A" * 10_000, "ids": list(range(1000))}
    )

    assert event["user_agent"] == "A" * MAX_VALUE_LENGTH + TRUNCATED
    assert len(event["ids"]) == 21
    assert event["ids"][-1] == TRUNCATED


def test_logger_writes_structured_attributes() -> None:
    get_logger("test.module").info("booking_created", booking_ref="R-42", ticket_id=3)

    event = next(e for e in reversed(_read_events("app.log")) if e["event"] == "booking_created")
    assert event | {"ts": None, "where": None} == {
        "event": "booking_created",
        "booking_ref": "R-42",
        "ticket_id": 3,
        "level": "info",
        "logger": "test.module",
        "ts": None,
        "where": None,
    }
