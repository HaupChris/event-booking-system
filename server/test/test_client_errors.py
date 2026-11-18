"""Phase L / PR 3: error reports from the browser (POST /api/client-errors)."""

import json
import os
from pathlib import Path
from typing import Any

import pytest

LOG_DIR = Path(os.environ["LOG_DIR"])
PROFILE_UUID = "11111111-2222-4333-8444-555555555555"
CHROME_MOBILE = "Mozilla/5.0 (Linux; Android 14) Chrome/130.0 Mobile Safari/537.36"


def _client_errors() -> list[dict[str, Any]]:
    path = LOG_DIR / "app.log"
    lines = path.read_text(encoding="utf-8").splitlines() if path.exists() else []
    return [event for event in map(json.loads, lines) if event["event"] == "client_error"]


def _report(client, payload: Any, **kwargs: Any):
    before = len(_client_errors())
    response = client.post("/api/client-errors", json=payload, **kwargs)
    return response, _client_errors()[before:]


def test_report_is_logged_with_bounded_fields(client) -> None:
    response, logged = _report(
        client,
        {
            "kind": "api_error",
            "message": "Request failed with status code 500",
            "stack": "Error\n    at submit (index-abc.js:1:200)",
            "route": "/profile",
            "request_id": "a1b2c3d4",
            "status": 500,
            "app_version": "3f9c2e1",
            "unexpected": "ignored",
        },
        headers={"User-Agent": CHROME_MOBILE},
    )

    assert response.status_code == 204
    assert len(logged) == 1
    assert logged[0] | {"ts": None, "where": None, "request_id": None} == {
        "event": "client_error",
        "level": "warning",
        "logger": "src.api.client_errors",
        "kind": "api_error",
        "message": "Request failed with status code 500",
        "stack": "Error\n    at submit (index-abc.js:1:200)",
        "client_route": "/profile",
        "failed_request_id": "a1b2c3d4",
        "status": 500,
        "app_version": "3f9c2e1",
        "browser": "chrome-mobile",
        "ts": None,
        "where": None,
        "request_id": None,
    }


def test_profile_uuids_emails_and_query_strings_are_masked(client) -> None:
    _, logged = _report(
        client,
        {
            "kind": "window_error",
            "message": f"Cannot load {PROFILE_UUID} for anna@example.org",
            "stack": f"at /profile/{PROFILE_UUID}",
            "route": f"/profile/{PROFILE_UUID}?tab=shifts#top",
        },
    )

    text = json.dumps(logged)
    assert PROFILE_UUID not in text
    assert "anna@example.org" not in text
    assert logged[0]["client_route"] == "/profile/<uuid>"
    assert logged[0]["message"] == "Cannot load <uuid> for <email>"


def test_values_are_truncated(client) -> None:
    _, logged = _report(
        client, {"kind": "render_error", "message": "M" * 3000, "stack": "S" * 4000}
    )

    assert len(logged[0]["message"]) <= 200
    assert len(logged[0]["stack"]) <= 2000


@pytest.mark.parametrize(
    ("field", "logged_key"),
    [
        ({"request_id": "../../etc"}, "failed_request_id"),
        ({"app_version": "1.0; DROP"}, "app_version"),
        ({"status": "500"}, "status"),
        ({"status": True}, "status"),
        ({"route": 42}, "client_route"),
    ],
)
def test_malformed_optional_fields_are_dropped(client, field, logged_key) -> None:
    response, logged = _report(client, {"kind": "api_error", **field})

    assert response.status_code == 204
    assert logged_key not in logged[0]


@pytest.mark.parametrize("payload", [{"kind": "anything"}, {}, ["api_error"], "text"])
def test_invalid_reports_are_rejected_and_not_logged(client, payload) -> None:
    response, logged = _report(client, payload)

    assert response.status_code == 400
    assert logged == []


def test_oversized_reports_are_rejected(client) -> None:
    response, logged = _report(client, {"kind": "api_error", "stack": "x" * 10_000})

    assert response.status_code == 413
    assert logged == []


def test_reports_need_no_login(client) -> None:
    response, _ = _report(client, {"kind": "unhandled_rejection"})

    assert response.status_code == 204
