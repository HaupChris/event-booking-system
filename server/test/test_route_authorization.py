"""S3: every route is protected unless it is explicitly listed here (secure by default).

Routes are enumerated from the Flask URL map, so a newly added route without an
authorization check makes these tests fail.
"""

import re

import pytest
from main import app

# Routes without JWT: login, health, public settings and the profile area (authorized by UUID).
PUBLIC_ENDPOINT_PREFIXES = ("auth.", "health.", "profile.", "static")
PUBLIC_ENDPOINTS = {"settings.get_frontend_settings"}

# Routes for registration flows; every other JWT route is admin-only.
ROLE_ENDPOINTS = {
    "formcontent.get_formcontent": {"user", "admin"},
    "bookings.submit_form": {"user", "admin"},
    "artist.get_artist_formcontent": {"artist", "admin"},
    "artist.submit_artist_form": {"artist", "admin"},
}
ALL_ROLES = {"user", "artist", "admin"}


def _concrete_url(rule: str) -> str:
    """Fill URL converters with dummy values (authorization is checked before validation)."""
    url = re.sub(r"<int:[^>]+>", "1", rule)
    return re.sub(r"<(?:string:)?[^>]+>", "regular", url)


def _is_public(endpoint: str) -> bool:
    return endpoint in PUBLIC_ENDPOINTS or endpoint.startswith(PUBLIC_ENDPOINT_PREFIXES)


def _protected_routes() -> list[tuple[str, str, str]]:
    return [
        (rule.endpoint, method, _concrete_url(rule.rule))
        for rule in app.url_map.iter_rules()
        if not _is_public(rule.endpoint)
        for method in sorted((rule.methods or set()) - {"HEAD", "OPTIONS"})
    ]


PROTECTED_ROUTES = _protected_routes()
ROUTE_IDS = [f"{method} {url}" for _, method, url in PROTECTED_ROUTES]


def _call(client, method: str, url: str, headers: dict | None = None):
    body: dict | None = {} if method in {"POST", "PUT", "PATCH"} else None
    return client.open(url, method=method, json=body, headers=headers or {})


def test_route_list_is_not_empty() -> None:
    assert len(PROTECTED_ROUTES) > 50
    assert set(ROLE_ENDPOINTS) <= {endpoint for endpoint, _, _ in PROTECTED_ROUTES}


@pytest.mark.parametrize(("endpoint", "method", "url"), PROTECTED_ROUTES, ids=ROUTE_IDS)
def test_protected_route_requires_token(client, endpoint, method, url) -> None:
    assert _call(client, method, url).status_code == 401


@pytest.mark.parametrize(("endpoint", "method", "url"), PROTECTED_ROUTES, ids=ROUTE_IDS)
def test_protected_route_rejects_other_roles(client, auth_headers, endpoint, method, url) -> None:
    allowed = ROLE_ENDPOINTS.get(endpoint, {"admin"})
    for role in sorted(ALL_ROLES - allowed):
        response = _call(client, method, url, auth_headers(role))
        assert response.status_code == 403, f"{role} got {response.status_code}"


@pytest.mark.parametrize(("endpoint", "method", "url"), PROTECTED_ROUTES, ids=ROUTE_IDS)
def test_protected_route_accepts_allowed_roles(client, auth_headers, endpoint, method, url) -> None:
    for role in sorted(ROLE_ENDPOINTS.get(endpoint, {"admin"})):
        response = _call(client, method, url, auth_headers(role))
        assert response.status_code not in (401, 403), f"{role} got {response.status_code}"
