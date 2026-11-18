"""Structured logging with structlog. Rules: docs/LOGGING.md.

- Every log line is one JSON object (lnav-friendly); locally a readable console format.
- `request_id` is bound per request and added to every event automatically.
- A sanitizing processor truncates oversized values and redacts sensitive attributes.
"""

import logging
import logging.handlers
import re
import sys
import time
import uuid
from collections import defaultdict
from datetime import UTC, datetime, timedelta
from typing import Any

import structlog
from flask import Flask, Response, g, has_request_context, request

from src.utils.paths import get_log_dir, in_docker

APP_LOG_RETENTION_DAYS = 30
SECURITY_LOG_RETENTION_DAYS = 90
SECURITY_LOGGER_NAME = "security"

MAX_VALUE_LENGTH = 200
MAX_EVENT_LENGTH = 500
MAX_EXCEPTION_LENGTH = 8000
MAX_STACK_LENGTH = 2000
MAX_COLLECTION_ITEMS = 20
TRUNCATED = "…[truncated]"
REDACTED = "[redacted]"
SENSITIVE_KEY_PARTS = (
    "password",
    "token",
    "secret",
    "authorization",
    "signature",
    "cookie",
    "email",
    "phone",
    "profile_uuid",
)
UUID_PATTERN = re.compile(r"[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}")


# --------------------------------------------------------------------------- processors


def _limit(value: Any, max_length: int = MAX_VALUE_LENGTH) -> Any:
    if isinstance(value, str):
        return value if len(value) <= max_length else value[:max_length] + TRUNCATED
    if isinstance(value, list | tuple | set):
        items = [_limit(item) for item in list(value)[:MAX_COLLECTION_ITEMS]]
        return items + [TRUNCATED] if len(value) > MAX_COLLECTION_ITEMS else items
    if isinstance(value, dict):
        limited = list(value.items())[:MAX_COLLECTION_ITEMS]
        return {str(key): _limit(item) for key, item in limited}
    return value


def _is_sensitive(key: str) -> bool:
    lowered = key.lower()
    if lowered.endswith("_ref"):  # pseudonyms such as email_ref are explicitly allowed
        return False
    return any(part in lowered for part in SENSITIVE_KEY_PARTS)


def sanitize_event(_logger: Any, _method: str, event_dict: dict[str, Any]) -> dict[str, Any]:
    """Safety net for the logging rules: bounded sizes and no sensitive attributes."""
    for key, value in event_dict.items():
        if key == "event":
            event_dict[key] = _limit(str(value), MAX_EVENT_LENGTH)
        elif key == "exception":
            event_dict[key] = _limit(str(value), MAX_EXCEPTION_LENGTH)
        elif key == "stack":  # browser stack traces from /api/client-errors
            event_dict[key] = _limit(str(value), MAX_STACK_LENGTH)
        elif _is_sensitive(key):
            event_dict[key] = REDACTED
        else:
            event_dict[key] = _limit(value)
    return event_dict


def _add_callsite(_logger: Any, _method: str, event_dict: dict[str, Any]) -> dict[str, Any]:
    """Merge function name and line number into one `where` attribute."""
    func_name = event_dict.pop("func_name", None)
    lineno = event_dict.pop("lineno", None)
    # request_finished is emitted by framework hooks; its `route` says more than a callsite.
    if func_name and lineno and event_dict.get("logger") != "access":
        event_dict["where"] = f"{func_name}:{lineno}"
    return event_dict


SHARED_PROCESSORS: list[Any] = [
    structlog.contextvars.merge_contextvars,
    structlog.stdlib.add_log_level,
    structlog.stdlib.add_logger_name,
    structlog.processors.TimeStamper(fmt="iso", utc=True, key="ts"),
    structlog.processors.CallsiteParameterAdder(
        {
            structlog.processors.CallsiteParameter.FUNC_NAME,
            structlog.processors.CallsiteParameter.LINENO,
        },
        # Report the caller of helpers such as log_security_event, not the helper itself.
        additional_ignores=[__name__],
    ),
    _add_callsite,
]

# Configured at import time: modules may log while being imported, before setup_logging() runs.
structlog.configure(
    processors=[*SHARED_PROCESSORS, structlog.stdlib.ProcessorFormatter.wrap_for_formatter],
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)


def get_logger(name: str) -> Any:
    """Logger for a module: `logger = get_logger(__name__)`."""
    return structlog.stdlib.get_logger(name)


# --------------------------------------------------------------------------- handlers


def _formatter(renderer: Any) -> structlog.stdlib.ProcessorFormatter:
    return structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=SHARED_PROCESSORS,
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            structlog.processors.format_exc_info,
            sanitize_event,
            renderer,
        ],
    )


def _daily_file_handler(filename: str, retention_days: int) -> logging.Handler:
    handler = logging.handlers.TimedRotatingFileHandler(
        filename=get_log_dir() / filename,
        when="midnight",
        backupCount=retention_days,
        encoding="utf-8",
        utc=True,
    )
    handler.setFormatter(_formatter(structlog.processors.JSONRenderer()))
    return handler


def setup_logging(app: Flask) -> None:
    """Attach handlers: app.log (30 days), security.log (90 days, incl. IPs), console."""
    get_log_dir().mkdir(parents=True, exist_ok=True)

    root = logging.getLogger()
    root.handlers.clear()
    root.setLevel(logging.DEBUG if app.debug else logging.INFO)

    app_handler = _daily_file_handler("app.log", APP_LOG_RETENTION_DAYS)
    app_handler.setLevel(logging.INFO)
    root.addHandler(app_handler)

    # Production: only warnings reach `docker logs`; locally a readable console at INFO.
    console = logging.StreamHandler(sys.stdout)
    if in_docker():
        console.setLevel(logging.WARNING)
        console.setFormatter(_formatter(structlog.processors.JSONRenderer()))
    else:
        console.setLevel(logging.INFO)
        console.setFormatter(_formatter(structlog.dev.ConsoleRenderer(colors=False)))
    root.addHandler(console)

    # Security events contain IP addresses and stay out of app.log (docs/LOGGING.md).
    security = logging.getLogger(SECURITY_LOGGER_NAME)
    security.handlers.clear()
    security.propagate = False
    security.addHandler(_daily_file_handler("security.log", SECURITY_LOG_RETENTION_DAYS))

    # request_finished replaces the development server's own access log.
    logging.getLogger("werkzeug").setLevel(logging.WARNING)
    app.logger.handlers.clear()
    app.logger.propagate = True

    get_logger(__name__).info("logging_initialized", log_dir=str(get_log_dir()))


# --------------------------------------------------------------------------- requests


def init_request_logging(app: Flask) -> None:
    """Bind a request ID to every event and log one `request_finished` per request."""

    @app.before_request
    def _start_request() -> None:
        structlog.contextvars.clear_contextvars()
        g.request_id = uuid.uuid4().hex[:8]
        g.request_started = time.perf_counter()
        structlog.contextvars.bind_contextvars(request_id=g.request_id)

    @app.after_request
    def _finish_request(response: Response) -> Response:
        request_id = getattr(g, "request_id", None)
        if request_id:
            response.headers["X-Request-ID"] = request_id
        started = getattr(g, "request_started", time.perf_counter())
        get_logger("access").info(
            "request_finished",
            method=request.method,
            route=request.endpoint or "unmatched",
            path=UUID_PATTERN.sub("<uuid>", request.path),
            status=response.status_code,
            duration_ms=round((time.perf_counter() - started) * 1000, 1),
        )
        return response

    @app.teardown_request
    def _clear_request(_error: BaseException | None) -> None:
        structlog.contextvars.clear_contextvars()


# --------------------------------------------------------------------------- security


failed_attempts: defaultdict[str, list[datetime]] = defaultdict(list)


def log_security_event(event_type: str, details: dict[str, Any], severity: str = "WARNING") -> None:
    """Security events go to security.log only, including client IP and user agent."""
    context: dict[str, Any] = {}
    if has_request_context():
        context = {
            "client_ip": request.remote_addr or "unknown",
            "user_agent": request.headers.get("User-Agent", "unknown"),
            "route": request.endpoint or "unmatched",
        }
    level = logging.ERROR if severity == "ERROR" else logging.WARNING
    get_logger(SECURITY_LOGGER_NAME).log(level, event_type.lower(), **context, **details)


def track_failed_authentication(client_ip: str, endpoint: str) -> None:
    """Escalate repeated authentication failures from one IP within an hour."""
    now = datetime.now(tz=UTC)
    failed_attempts[client_ip] = [
        attempt for attempt in failed_attempts[client_ip] if now - attempt < timedelta(hours=1)
    ]
    failed_attempts[client_ip].append(now)
    attempt_count = len(failed_attempts[client_ip])

    if attempt_count >= 20:
        log_security_event(
            "BRUTE_FORCE_SUSPECTED",
            {"endpoint": endpoint, "count": attempt_count, "time_window": "1_hour"},
            severity="ERROR",
        )
    elif attempt_count >= 5:
        log_security_event(
            "MULTIPLE_AUTH_FAILURES",
            {"endpoint": endpoint, "count": attempt_count, "time_window": "1_hour"},
        )


def log_authentication_event(role: str, success: bool) -> None:
    """Log a login attempt for a role; failures are tracked per client IP."""
    if success:
        log_security_event("AUTH_SUCCEEDED", {"role": role})
        return
    track_failed_authentication(request.remote_addr or "unknown", request.endpoint or "unknown")
    log_security_event("AUTH_FAILED", {"role": role})
