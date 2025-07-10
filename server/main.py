import sys
from collections import defaultdict

from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
from datetime import datetime, timedelta

from src.api.auth import auth_bp
from src.api.bookings import bookings_bp
from src.api.formcontent import formcontent_bp

from src.utils.config import load_config
from src.utils.logger import setup_logging, get_logger, log_request, log_response, log_security_event
from src.api.health import health_bp
from src.api.artist_bookings import artist_bp
from src.api.shift_assignments import shift_assignments_bp


load_dotenv()

app = Flask(__name__)

# Setup CORS
CORS(app)

# Load config from environment
load_config(app)

# Setup logging
setup_logging(app)

# Setup JWT
jwt = JWTManager(app)

rate_limit_violations = defaultdict(list)

# Setup rate-limiter
limiter = Limiter(get_remote_address, app=app, default_limits=["20000 per day", "5000 per hour"])

logger = get_logger(__name__)

# Rate limiting callback functions
@limiter.request_filter
def header_whitelist():
    """Filter requests that should bypass rate limiting."""
    # Only bypass for health checks or similar
    return request.endpoint == 'health.health_check'


# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(bookings_bp, url_prefix="/api")
app.register_blueprint(formcontent_bp, url_prefix="/api")
app.register_blueprint(health_bp, url_prefix="/api")
app.register_blueprint(artist_bp, url_prefix="/api")
app.register_blueprint(shift_assignments_bp, url_prefix="/api")


@app.errorhandler(Exception)
def handle_all_errors(e):
    logger.error(f"Unhandled Exception: {str(e)}", exc_info=True)
    return {"message": "Internal server error"}, 500


@app.errorhandler(404)
def handle_not_found(e):
    logger.warning(f"404 Not Found: {request.method} {request.path} from {request.remote_addr}")

    # Track potential scanning attempts
    client_ip = request.remote_addr
    now = datetime.now()

    # Use rate_limit_violations dict to track 404s too
    key = f"{client_ip}_404"
    if key not in rate_limit_violations:
        rate_limit_violations[key] = []

    rate_limit_violations[key] = [
        attempt for attempt in rate_limit_violations[key]
        if now - attempt < timedelta(minutes=10)
    ]
    rate_limit_violations[key].append(now)

    if len(rate_limit_violations[key]) >= 10:
        log_security_event('POTENTIAL_SCANNING', {
            'path': request.path,
            'method': request.method,
            'attempts_in_10min': len(rate_limit_violations[key])
        }, severity='ERROR')

    return {"message": "Endpoint not found"}, 404


@app.errorhandler(429)
def handle_rate_limit_exceeded(e):
    """Handle actual rate limit violations."""
    client_ip = get_remote_address()
    endpoint = request.endpoint
    now = datetime.now()

    # Clean old violations (older than 1 hour)
    rate_limit_violations[client_ip] = [
        violation for violation in rate_limit_violations[client_ip]
        if now - violation < timedelta(hours=1)
    ]

    rate_limit_violations[client_ip].append(now)
    violation_count = len(rate_limit_violations[client_ip])

    logger.warning(f"Rate limit exceeded: {client_ip} on {endpoint} (violation #{violation_count} in last hour)")

    # Log as security event if excessive
    if violation_count >= 5:
        log_security_event('EXCESSIVE_RATE_LIMITING', {
            'endpoint': endpoint,
            'violation_count': violation_count,
            'time_window': '1_hour'
        }, severity='ERROR')
    elif violation_count >= 3:
        log_security_event('REPEATED_RATE_LIMITING', {
            'endpoint': endpoint,
            'violation_count': violation_count,
            'time_window': '1_hour'
        })

    return {"message": "Rate limit exceeded"}, 429


@app.before_request
def log_request_info():
    log_request()


@app.after_request
def after_request(response):
    """Log outgoing responses."""
    return log_response(response)


def handle_exception(exc_type, exc_value, exc_traceback):
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return
    app.logger.error("Uncaught exception", exc_info=(exc_type, exc_value, exc_traceback))


if __name__=="__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)