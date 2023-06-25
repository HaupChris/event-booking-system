import dataclasses
import logging
import os
import sys
from datetime import timedelta

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

from src.booking_manager import BookingManager
from src.views import Booking

app = Flask(__name__, static_folder='../frontend/event-booking-system/build')

load_dotenv()


def handle_exception(exc_type, exc_value, exc_traceback):
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return

    app.logger.error("Uncaught exception", exc_info=(exc_type, exc_value, exc_traceback))


if not app.debug:
    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = logging.FileHandler('logs/flask_app.log')
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
    file_handler.setLevel(logging.DEBUG)
    app.logger.addHandler(file_handler)

    app.logger.setLevel(logging.DEBUG)
    app.logger.info('Flask app startup')

    sys.excepthook = handle_exception

app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")  # This should be a complex random string.
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)
CORS(app)

# allow CORS for all domains on all routes
CORS(app, resources={r"/*": {"origins": "*"}})

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["20000 per day", "5000 per hour"]
)

script_dir = os.path.dirname(__file__)  # <-- absolute dir the script is in

hashed_password = generate_password_hash(os.environ.get("PASSWORD"), method="pbkdf2:sha256", salt_length=8)
admin_hashed_password = generate_password_hash(os.environ.get("ADMIN_PASSWORD"), method="pbkdf2:sha256", salt_length=8)

app.logger.info('Passwords hashed')


@app.route("/api/auth/admin", methods=["POST"])
@limiter.limit("40/minute")
def authenticate_admin():
    password = request.json.get("password", None)
    if not password:
        return jsonify({"msg": "Missing password"}), 400
    if not check_password_hash(admin_hashed_password, password):
        return jsonify({"msg": "Bad password"}), 401
    access_token = create_access_token(identity="admin")
    app.logger.info('Admin authentication successful')
    return jsonify(access_token=access_token), 200


@app.route("/api/auth", methods=["POST"])
@limiter.limit("100/minute")
def authenticate():
    password = request.json.get("password", None)
    if not password:
        return jsonify({"msg": "Missing password"}), 400
    if not check_password_hash(hashed_password, password):
        return jsonify({"msg": "Bad password"}), 401
    access_token = create_access_token(identity="user")
    app.logger.info('User authentication successful')
    return jsonify(access_token=access_token), 200


booking_manager = BookingManager(json_path=os.path.join(script_dir, 'form_content.json'),
                                 db_dir=os.path.join(script_dir, 'db'))

app.logger.info('BookingManager initialized')


@app.route("/", defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/submitForm', methods=['POST'])
@limiter.limit("90/minute")
@jwt_required()
def submit_form():
    # booking object is sent as json
    booking = Booking(**request.json)
    booking_manager.insert_booking(booking)
    app.logger.info('Form submitted successfully')
    return 'Form submitted successfully'


@app.route("/api/data", methods=["GET"])
@jwt_required()
def get_bookings():
    bookings = booking_manager.get_all_bookings()  # replace db with your database instance
    app.logger.info('Bookings fetched successfully')
    return jsonify([dataclasses.asdict(booking) for booking in bookings]), 200


@app.route('/api/formcontent', methods=['GET'])
@limiter.limit("200/minute")
@jwt_required()
def get_formcontent():
    form_content = booking_manager.get_form_content()
    form_content_json = jsonify(form_content)
    app.logger.info('Form content fetched successfully')
    return form_content_json


if __name__ == '__main__':
    app.run(debug=False)
