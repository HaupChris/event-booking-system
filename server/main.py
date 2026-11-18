import os
from collections import defaultdict
from datetime import UTC, datetime, timedelta
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from src.api.admin_booking_events import admin_booking_events_bp
from src.api.admin_booking_mails import admin_booking_mails_bp
from src.api.admin_faq import admin_faq_bp
from src.api.admin_news import admin_news_bp
from src.api.admin_options import admin_options_bp
from src.api.admin_orga_team import admin_orga_team_bp
from src.api.admin_profiles import admin_profiles_bp
from src.api.admin_settings import admin_settings_bp
from src.api.admin_workshifts import admin_workshifts_bp
from src.api.artist_bookings import artist_bp
from src.api.auth import auth_bp
from src.api.bookings import bookings_bp
from src.api.formcontent import formcontent_bp
from src.api.health import health_bp
from src.api.profile import profile_bp
from src.api.settings import settings_bp
from src.api.shift_assignments import shift_assignments_bp
from src.services.password_service import ensure_password_hashes
from src.utils.config import load_config
from src.utils.logger import (
    get_logger,
    init_request_logging,
    log_security_event,
    setup_logging,
)
from src.utils.rate_limit import get_client_ip, limiter
from werkzeug.exceptions import HTTPException
from werkzeug.middleware.proxy_fix import ProxyFix

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

app = Flask(__name__)

# Load config from environment
load_config(app)

# Respect forwarded client metadata from the nginx reverse proxy.
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

# Setup CORS
cors_origins_raw = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173",
)
allowed_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]
CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, expose_headers=["X-Request-ID"])

# Setup logging
setup_logging(app)
init_request_logging(app)

# Setup JWT
jwt = JWTManager(app)

# Ensure secure role password setup before serving requests
ensure_password_hashes()

rate_limit_violations = defaultdict(list)

# Setup rate-limiter
limiter.init_app(app)

logger = get_logger(__name__)


# Rate limiting callback functions
@limiter.request_filter
def header_whitelist():
    """Filter requests that should bypass rate limiting."""
    # Only bypass for health checks or similar
    return request.endpoint == "health.health_check"


@app.errorhandler(HTTPException)
def handle_http_exception(e):
    # Status and route are already part of request_finished.
    return {"message": e.description}, e.code


# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(bookings_bp, url_prefix="/api")
app.register_blueprint(formcontent_bp, url_prefix="/api")
app.register_blueprint(health_bp, url_prefix="/api")
app.register_blueprint(artist_bp, url_prefix="/api")
app.register_blueprint(shift_assignments_bp, url_prefix="/api")
app.register_blueprint(settings_bp, url_prefix="/api")
app.register_blueprint(profile_bp, url_prefix="/api/profile")
app.register_blueprint(admin_faq_bp, url_prefix="/api/admin")
app.register_blueprint(admin_booking_mails_bp, url_prefix="/api/admin")
app.register_blueprint(admin_booking_events_bp, url_prefix="/api/admin")
app.register_blueprint(admin_news_bp, url_prefix="/api/admin")
app.register_blueprint(admin_profiles_bp, url_prefix="/api/admin")
app.register_blueprint(admin_settings_bp, url_prefix="/api/admin")
app.register_blueprint(admin_orga_team_bp, url_prefix="/api/admin")
app.register_blueprint(admin_workshifts_bp, url_prefix="/api/admin")
app.register_blueprint(admin_options_bp, url_prefix="/api/admin")


@app.errorhandler(Exception)
def handle_all_errors(e):
    logger.error("unhandled_exception", error_type=type(e).__name__, exc_info=True)
    return {"message": "Internal server error"}, 500


@app.errorhandler(404)
def handle_not_found(_e):
    # Track potential scanning attempts (the 404 itself is part of request_finished)
    client_ip = get_client_ip()
    now = datetime.now(tz=UTC)

    # Use rate_limit_violations dict to track 404s too
    key = f"{client_ip}_404"
    if key not in rate_limit_violations:
        rate_limit_violations[key] = []

    rate_limit_violations[key] = [
        attempt for attempt in rate_limit_violations[key] if now - attempt < timedelta(minutes=10)
    ]
    rate_limit_violations[key].append(now)

    if len(rate_limit_violations[key]) >= 10:
        log_security_event(
            "POTENTIAL_SCANNING",
            {
                "path": request.path,
                "method": request.method,
                "count": len(rate_limit_violations[key]),
                "time_window": "10_minutes",
            },
            severity="ERROR",
        )

    return {"message": "Endpoint not found"}, 404


@app.errorhandler(429)
def handle_rate_limit_exceeded(_e):
    """Handle actual rate limit violations."""
    client_ip = get_client_ip()
    endpoint = request.endpoint
    now = datetime.now(tz=UTC)

    # Clean old violations (older than 1 hour)
    rate_limit_violations[client_ip] = [
        violation
        for violation in rate_limit_violations[client_ip]
        if now - violation < timedelta(hours=1)
    ]

    rate_limit_violations[client_ip].append(now)
    violation_count = len(rate_limit_violations[client_ip])

    log_security_event(
        "RATE_LIMIT_EXCEEDED",
        {"endpoint": endpoint, "count": violation_count, "time_window": "1_hour"},
        severity="ERROR" if violation_count >= 5 else "WARNING",
    )

    return {"message": "Rate limit exceeded"}, 429


if __name__ == "__main__":
    debug_enabled = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug_enabled, host="127.0.0.1", port=5001)
