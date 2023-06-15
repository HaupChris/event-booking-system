import dataclasses
import os

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash, check_password_hash

from src.booking_manager import BookingManager
from src.views import Booking

app = Flask(__name__, static_folder='../frontend/event-booking-system/build')

app.config["JWT_SECRET_KEY"] = "your-secret-key"  # This should be a complex random string.
jwt = JWTManager(app)
CORS(app)

# allow CORS for all domains on all routes
CORS(app, resources={r"/*": {"origins": "*"}})

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["300 per day", "60 per hour"]
)

hashed_password = generate_password_hash("password", method="pbkdf2:sha256", salt_length=8)
admin_hashed_password = generate_password_hash("admin-password", method="pbkdf2:sha256", salt_length=8)


@app.route("/api/auth/admin", methods=["POST"])
@limiter.limit("10/minute")
def authenticate_admin():
    password = request.json.get("password", None)
    if not password:
        return jsonify({"msg": "Missing password"}), 400
    if not check_password_hash(admin_hashed_password, password):
        return jsonify({"msg": "Bad password"}), 401
    access_token = create_access_token(identity="admin")
    return jsonify(access_token=access_token), 200


@app.route("/api/auth", methods=["POST"])
@limiter.limit("20/minute")
def authenticate():
    password = request.json.get("password", None)
    if not password:
        return jsonify({"msg": "Missing password"}), 400
    if not check_password_hash(hashed_password, password):
        return jsonify({"msg": "Bad password"}), 401
    access_token = create_access_token(identity="user")
    return jsonify(access_token=access_token), 200


booking_manager = BookingManager(json_path='./form_content.json', db_dir='./db')


@app.route("/", defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/submitForm', methods=['POST'])
@limiter.limit("20/minute")
@jwt_required()
def submit_form():
    # booking object is sent as json
    booking = Booking(**request.json)
    booking_manager.insert_booking(booking)

    return 'Form submitted successfully'


@app.route("/api/data", methods=["GET"])
@jwt_required()
def get_bookings():
    bookings = booking_manager.get_all_bookings()  # replace db with your database instance
    return jsonify([dataclasses.asdict(booking) for booking in bookings]), 200


@app.route('/api/formcontent', methods=['GET'])
@limiter.limit("20/minute")
@jwt_required()
def get_formcontent():
    form_content = booking_manager.get_form_content()
    form_content_json = jsonify(form_content)
    return form_content_json


if __name__ == '__main__':
    app.run(debug=True)
