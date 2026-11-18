"""Error reports from the browser (Phase L, docs/LOGGING.md).

Public on purpose: errors also happen before login and on profile pages. Only a fixed set of
small fields is accepted; everything is bounded, profile UUIDs and email addresses are masked.
"""

import re
from typing import Any

from flask import Blueprint, request

from src.utils.logger import MAX_STACK_LENGTH, UUID_PATTERN, get_logger
from src.utils.rate_limit import limiter

logger = get_logger(__name__)

client_errors_bp = Blueprint("client_errors", __name__)

MAX_BODY_BYTES = 8 * 1024
CLIENT_ERROR_KINDS = frozenset({"render_error", "window_error", "unhandled_rejection", "api_error"})

_EMAIL_PATTERN = re.compile(r"[^\s@]+@[^\s@]+\.[^\s@]+")
_REQUEST_ID_PATTERN = re.compile(r"[0-9a-f]{8}")
_APP_VERSION_PATTERN = re.compile(r"[0-9A-Za-z._-]{1,40}")
_BROWSERS = (
    ("Edg/", "edge"),
    ("Firefox/", "firefox"),
    ("Chrome/", "chrome"),
    ("Safari/", "safari"),
)


def _mask(value: Any, max_length: int) -> str | None:
    if not isinstance(value, str) or not value:
        return None
    masked = _EMAIL_PATTERN.sub("<email>", UUID_PATTERN.sub("<uuid>", value[: max_length * 2]))
    return masked[:max_length]


def _matching(value: Any, pattern: re.Pattern[str]) -> str | None:
    return value if isinstance(value, str) and pattern.fullmatch(value) else None


def _status(value: Any) -> int | None:
    is_int = isinstance(value, int) and not isinstance(value, bool)
    return value if is_int and 0 <= value < 600 else None  # noqa: PLR2004  # HTTP status range


def _browser(user_agent: str) -> str:
    family = next((name for marker, name in _BROWSERS if marker in user_agent), "other")
    return f"{family}-mobile" if "Mobile" in user_agent else family


def _route(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    return _mask(value.split("?", 1)[0].split("#", 1)[0], 200)


@client_errors_bp.route("/client-errors", methods=["POST"])
@limiter.limit("10/minute")
def report_client_error():
    if (request.content_length or 0) > MAX_BODY_BYTES:
        return {"message": "Report too large"}, 413
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or data.get("kind") not in CLIENT_ERROR_KINDS:
        return {"message": "Invalid report"}, 400

    fields = {
        "kind": data["kind"],
        "message": _mask(data.get("message"), 200),
        "stack": _mask(data.get("stack"), MAX_STACK_LENGTH),
        "client_route": _route(data.get("route")),
        "failed_request_id": _matching(data.get("request_id"), _REQUEST_ID_PATTERN),
        "status": _status(data.get("status")),
        "app_version": _matching(data.get("app_version"), _APP_VERSION_PATTERN),
        "browser": _browser(request.headers.get("User-Agent", "")),
    }
    logger.warning(
        "client_error", **{key: value for key, value in fields.items() if value is not None}
    )
    return "", 204
