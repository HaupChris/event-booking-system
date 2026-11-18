import os

from flask import request
from flask_limiter import Limiter


def get_client_ip() -> str:
    """Client IP as reported by the trusted nginx proxy.

    ProxyFix (main.py) already sets remote_addr from the proxy's X-Forwarded-For entry.
    Never read X-Forwarded-For here: its leading entries are controlled by the client.
    """
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
