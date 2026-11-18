"""S9: profile responses contain personal data and must not be stored by HTTP caches."""

from src.services.app_settings_service import set_rideshare_enabled


def _create_booking(client, auth_headers, booking_payload) -> str:
    response = client.post("/api/submitForm", json=booking_payload, headers=auth_headers("user"))
    assert response.status_code == 200, response.get_json()
    return str(response.get_json()["profile_uuid"])


def test_profile_responses_are_not_cacheable(client, auth_headers, booking_payload) -> None:
    profile_uuid = _create_booking(client, auth_headers, booking_payload)

    for path in ("", "/shifts", "/news"):
        response = client.get(f"/api/profile/{profile_uuid}{path}")
        assert response.status_code == 200, path
        assert "no-store" in response.headers.get("Cache-Control", ""), path


def test_unknown_profile_is_not_cacheable(client) -> None:
    response = client.get("/api/profile/00000000-0000-4000-8000-000000000000")

    assert response.status_code == 404
    assert "no-store" in response.headers.get("Cache-Control", "")


def _rideshare_requests(profile_uuid: str) -> list[tuple[str, str]]:
    base = f"/api/profile/{profile_uuid}/rideshare"
    return [
        ("GET", base),
        ("POST", f"{base}/posts"),
        ("POST", f"{base}/posts/1/react"),
        ("PUT", f"{base}/join-requests/1/approve"),
        ("PUT", f"{base}/join-requests/1/reject"),
        ("DELETE", f"{base}/posts/1"),
        ("PUT", f"{base}/posts/1/complete"),
    ]


def test_rideshare_endpoints_are_blocked_while_disabled(
    client, auth_headers, booking_payload
) -> None:
    profile_uuid = _create_booking(client, auth_headers, booking_payload)
    set_rideshare_enabled(False)

    for method, url in _rideshare_requests(profile_uuid):
        response = client.open(url, method=method, json={})
        assert response.status_code == 403, f"{method} {url}"
