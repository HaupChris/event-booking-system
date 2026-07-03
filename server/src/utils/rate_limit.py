import os

from flask import request
from flask_limiter import Limiter


def get_client_ip() -> str:
    """Prefer the original client IP when the app is behind nginx."""
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        client_ip = forwarded_for.split(",", 1)[0].strip()
        if client_ip:
            return client_ip

    return request.remote_addr or "unknown"


def is_app_rate_limiting_enabled() -> bool:
    configured_value = os.environ.get("ENABLE_APP_RATE_LIMITING")
    if configured_value is not None:
        return configured_value.lower() == "true"

    # In Docker production we rely on nginx limits instead of in-process memory storage.
    return os.environ.get("IN_DOCKER", "").lower() != "true"


limiter = Limiter(
    key_func=get_client_ip,
    default_limits=["20000 per day", "5000 per hour"],
    enabled=is_app_rate_limiting_enabled(),
    storage_uri="memory://",
)
