import os
import sys

from flask import Flask, send_from_directory, request
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

app = Flask(
    __name__,
    static_folder=os.path.join(os.path.dirname(__file__), '../frontend/build')
)

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


@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())
    app.logger.debug('Route: %s %s', request.method, request.path)


@app.after_request
def log_response_info(response):
    app.logger.debug('Response status: %s', response.status)
    app.logger.debug('Response headers: %s', response.headers)
    return response


def handle_exception(exc_type, exc_value, exc_traceback):
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return
    app.logger.error("Uncaught exception", exc_info=(exc_type, exc_value, exc_traceback))

sys.excepthook = handle_exception

# Serve front-end build if desired
@app.route("/", defaults={'path': ''})
@app.route("/<path:path>")
def serve_react(path):
    """
    Serves the React build from the static folder if found,
    else falls back to index.html
    """
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")


if __name__=="__main__":
    app.run(debug=False, host="0.0.0.0", port=5001)