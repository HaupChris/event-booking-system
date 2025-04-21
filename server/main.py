import os
import sys

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

from src.api.auth import auth_bp
from src.api.bookings import bookings_bp
from src.api.formcontent import formcontent_bp

from src.utils.config import load_config
from src.utils.logger import configure_logging
from src.api.health import health_bp

load_dotenv()

app = Flask(__name__)


# Setup CORS
CORS(app)

# Load config from environment
load_config(app)

# Setup logging
configure_logging(app)

# Setup JWT
jwt = JWTManager(app)

# Setup rate-limiter
limiter = Limiter(get_remote_address, app=app, default_limits=["20000 per day", "5000 per hour"])

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(bookings_bp, url_prefix="/api")
app.register_blueprint(formcontent_bp, url_prefix="/api")
app.register_blueprint(health_bp, url_prefix="/api")


@app.errorhandler(Exception)
def handle_all_errors(e):
    app.logger.exception("Unhandled Exception: %s", e)
    return {"message": "Internal server error", "details": str(e)}, 500


# Enhance your existing before_request function
@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())
    app.logger.debug('Route: %s %s', request.method, request.path)
    # Add JWT specific logging
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        app.logger.debug(f"Auth header format: {auth_header[:10]}...")

# Enhance your existing after_request function
@app.after_request
def log_response_info(response):
    app.logger.debug('Response status: %s', response.status)
    app.logger.debug('Response headers: %s', response.headers)
    app.logger.debug('Response body: %s', response.get_data(as_text=True)[:200])  # Log first 200 chars
    return response


def handle_exception(exc_type, exc_value, exc_traceback):
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return
    app.logger.error("Uncaught exception", exc_info=(exc_type, exc_value, exc_traceback))

sys.excepthook = handle_exception


# In main.py or wherever you set up JWTManager
@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    app.logger.error(f"Invalid token: {error_string}")
    return jsonify({"msg": error_string}), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    app.logger.error(f"Expired token: {jwt_payload}")
    return jsonify({"msg": "Token has expired"}), 422

@jwt.unauthorized_loader
def unauthorized_callback(error_string):
    app.logger.error(f"Unauthorized: {error_string}")
    return jsonify({"msg": error_string}), 422


if __name__=="__main__":
    app.run(debug=False, host="127.0.0.1", port=5001)