"""S4: the client IP used for rate limiting and logs must not come from client-controlled headers."""

from main import app
from src.utils.rate_limit import get_client_ip


def test_client_ip_ignores_spoofed_forwarded_for_header() -> None:
    # ProxyFix has already replaced REMOTE_ADDR with the address reported by nginx.
    with app.test_request_context(
        environ_base={"REMOTE_ADDR": "203.0.113.7"},
        headers={"X-Forwarded-For": "6.6.6.6, 203.0.113.7"},
    ):
        assert get_client_ip() == "203.0.113.7"
