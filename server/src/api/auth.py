import os

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash, check_password_hash

from src.utils.logger import get_logger, log_authentication_event, track_failed_authentication, \
    log_security_event

# Initialize logger for this module
logger = get_logger(__name__)

auth_bp = Blueprint("auth", __name__)
limiter_auth = Limiter(get_remote_address)

# Load environment variables with logging
PASSWORD = os.environ.get("PASSWORD", "b")
if PASSWORD == "":
    logger.error("User password loading from environment variable failed!")

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "a")
if ADMIN_PASSWORD == "":
    logger.error("Admin password loading from environment variable failed!")

ARTIST_PASSWORD = os.environ.get("ARTIST_PASSWORD", "artist")
if ARTIST_PASSWORD == "":
    logger.error("Artist password loading from environment variable failed!")

# Check for default passwords in production
if PASSWORD == "b":
    logger.warning("Using default user password - not recommended for production")
if ADMIN_PASSWORD == "a":
    logger.warning("Using default admin password - not recommended for production")
if ARTIST_PASSWORD == "artist":
    logger.warning("Using default artist password - not recommended for production")

# Hash passwords on startup
hashed_user_password = generate_password_hash(PASSWORD, method="pbkdf2:sha256", salt_length=8)
hashed_admin_password = generate_password_hash(ADMIN_PASSWORD, method="pbkdf2:sha256", salt_length=8)
hashed_artist_password = generate_password_hash(ARTIST_PASSWORD, method="pbkdf2:sha256", salt_length=8)

logger.info("Authentication module initialized with hashed passwords")


@auth_bp.route("/admin", methods=["POST"])
# @limiter_auth.limit("40/minute")
def authenticate_admin():
    """Admin authentication endpoint with comprehensive logging."""
    client_ip = request.remote_addr
    logger.info(f"Admin authentication attempt from {client_ip}")

    try:
        # Validate request structure
        if not request.json:
            logger.warning(f"Admin auth failed: missing JSON body from {client_ip}")
            log_security_event('MALFORMED_AUTH_REQUEST', {
                'endpoint': 'admin',
                'error': 'missing_json_body'
            })
            return jsonify({"msg": "Missing JSON body"}), 400

        password = request.json.get("password")
        if not password:
            logger.warning(f"Admin auth failed: missing password from {client_ip}")
            log_authentication_event('ADMIN_AUTH', 'admin', False)
            return jsonify({"msg": "Missing password"}), 400

        # Check password
        if not check_password_hash(hashed_admin_password, password):
            logger.warning(f"Admin auth failed: invalid password from {client_ip}")
            track_failed_authentication(client_ip, 'admin')
            log_authentication_event('ADMIN_AUTH', 'admin', False)
            return jsonify({"msg": "Bad password"}), 401

        # Success
        access_token = create_access_token(
            identity="admin",
            additional_claims={"role": "admin"}
        )

        logger.info(f"Admin authentication successful from {client_ip}")
        log_authentication_event('ADMIN_AUTH', 'admin', True)

        return jsonify(access_token=access_token), 200

    except Exception as e:
        logger.error(f"Unexpected error in admin authentication: {str(e)}", exc_info=True)
        log_security_event('AUTH_SYSTEM_ERROR', {
            'endpoint': 'admin',
            'error': str(e)
        }, severity='ERROR')
        return jsonify({"msg": "Authentication system error"}), 500


@auth_bp.route("", methods=["POST"])  # e.g. /api/auth
# @limiter_auth.limit("100/minute")
def authenticate():
    """User authentication endpoint with comprehensive logging."""
    client_ip = request.remote_addr
    logger.info(f"User authentication attempt from {client_ip}")

    try:
        # Validate request structure
        if not request.json:
            logger.warning(f"User auth failed: missing JSON body from {client_ip}")
            log_security_event('MALFORMED_AUTH_REQUEST', {
                'endpoint': 'user',
                'error': 'missing_json_body'
            })
            return jsonify({"msg": "Missing JSON body"}), 400

        password = request.json.get("password")
        if not password:
            logger.warning(f"User auth failed: missing password from {client_ip}")
            log_authentication_event('USER_AUTH', 'user', False)
            return jsonify({"msg": "Missing password"}), 400

        # Check password
        if not check_password_hash(hashed_user_password, password):
            logger.warning(f"User auth failed: invalid password from {client_ip}")
            track_failed_authentication(client_ip, 'user')
            log_authentication_event('USER_AUTH', 'user', False)
            return jsonify({"msg": "Bad password"}), 401

        # Success
        access_token = create_access_token(
            identity="user",
            additional_claims={"role": "user"}
        )

        logger.info(f"User authentication successful from {client_ip}")
        log_authentication_event('USER_AUTH', 'user', True)

        return jsonify(access_token=access_token), 200

    except Exception as e:
        logger.error(f"Unexpected error in user authentication: {str(e)}", exc_info=True)
        log_security_event('AUTH_SYSTEM_ERROR', {
            'endpoint': 'user',
            'error': str(e)
        }, severity='ERROR')
        return jsonify({"msg": "Authentication system error"}), 500


@auth_bp.route("/artist", methods=["POST"])
# @limiter_auth.limit("40/minute")
def authenticate_artist():
    """Artist authentication endpoint with comprehensive logging."""
    client_ip = request.remote_addr
    logger.info(f"Artist authentication attempt from {client_ip}")

    try:
        # Validate request structure
        if not request.json:
            logger.warning(f"Artist auth failed: missing JSON body from {client_ip}")
            log_security_event('MALFORMED_AUTH_REQUEST', {
                'endpoint': 'artist',
                'error': 'missing_json_body'
            })
            return jsonify({"msg": "Missing JSON body"}), 400

        password = request.json.get("password")
        if not password:
            logger.warning(f"Artist auth failed: missing password from {client_ip}")
            log_authentication_event('ARTIST_AUTH', 'artist', False)
            return jsonify({"msg": "Missing password"}), 400

        # Check password
        if not check_password_hash(hashed_artist_password, password):
            logger.warning(f"Artist auth failed: invalid password from {client_ip}")
            track_failed_authentication(client_ip, 'artist')
            log_authentication_event('ARTIST_AUTH', 'artist', False)
            return jsonify({"msg": "Bad password"}), 401

        # Success
        access_token = create_access_token(
            identity="artist",
            additional_claims={"role": "artist"}
        )

        logger.info(f"Artist authentication successful from {client_ip}")
        log_authentication_event('ARTIST_AUTH', 'artist', True)

        return jsonify(access_token=access_token), 200

    except Exception as e:
        logger.error(f"Unexpected error in artist authentication: {str(e)}", exc_info=True)
        log_security_event('AUTH_SYSTEM_ERROR', {
            'endpoint': 'artist',
            'error': str(e)
        }, severity='ERROR')
        return jsonify({"msg": "Authentication system error"}), 500