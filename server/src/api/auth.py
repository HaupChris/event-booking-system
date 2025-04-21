import logging

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash, check_password_hash
import os


root_logger = logging.getLogger()

auth_bp = Blueprint("auth", __name__)
limiter_auth = Limiter(get_remote_address)

# Pre-hash your environment variables if needed; or store hashed versions in .env
PASSWORD = os.environ.get("PASSWORD", "b")
if PASSWORD == "":
    root_logger.debug("user password loading from environment variable failed!")

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "a")
if ADMIN_PASSWORD == "":
    root_logger.debug("admin password loading from environment variable failed!")

ARTIST_PASSWORD = os.environ.get("ARTIST_PASSWORD", "artist")
if ARTIST_PASSWORD == "":
    root_logger.debug("artist password loading from environment variable failed!")


print(f"password: {PASSWORD}")
print(f"admin password: {ADMIN_PASSWORD}")


# Optional: hash them on startup
hashed_user_password = generate_password_hash(PASSWORD, method="pbkdf2:sha256", salt_length=8)
hashed_admin_password = generate_password_hash(ADMIN_PASSWORD, method="pbkdf2:sha256", salt_length=8)
hashed_artist_password = generate_password_hash(ARTIST_PASSWORD, method="pbkdf2:sha256", salt_length=8)


@auth_bp.route("/admin", methods=["POST"])
# @limiter_auth.limit("40/minute")
def authenticate_admin():
    password = request.json.get("password")
    if not password:
        return jsonify({"msg": "Missing password"}), 400
    if not check_password_hash(hashed_admin_password, password):
        return jsonify({"msg": "Bad password"}), 401
    access_token = create_access_token(
        identity="admin",
        additional_claims={"role": "admin"}
    )
    return jsonify(access_token=access_token), 200


@auth_bp.route("", methods=["POST"])  # e.g. /api/auth
# @limiter_auth.limit("100/minute")
def authenticate():
    password = request.json.get("password")
    if not password:
        return jsonify({"msg": "Missing password"}), 400
    if not check_password_hash(hashed_user_password, password):
        return jsonify({"msg": "Bad password"}), 401
    access_token = create_access_token(
        identity="user",  # Make this a string
        additional_claims={"role": "user"}  # Put role in additional claims
    )
    return jsonify(access_token=access_token), 200


# Add a new endpoint for artist authentication
@auth_bp.route("/artist", methods=["POST"])
# @limiter_auth.limit("40/minute")
def authenticate_artist():
    password = request.json.get("password")
    if not password:
        return jsonify({"msg": "Missing password"}), 400
    if not check_password_hash(hashed_artist_password, password):
        return jsonify({"msg": "Bad password"}), 401
    access_token = create_access_token(
        identity="artist",
        additional_claims={"role": "artist"}
    )
    return jsonify(access_token=access_token), 200
