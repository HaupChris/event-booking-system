from flask import Flask, request, abort
import flask_cors
from functools import wraps
import sqlite3
from sqlite3 import Error

from flask_cors import CORS

from src.booking_manager import BookingManager
from src.views import Booking

app = Flask(__name__)
CORS(app)

password_string = 'password'
booking_manager = BookingManager(json_path='./form_content.json', db_dir='../db')


def require_appkey(view_function):
    @wraps(view_function)
    def decorated_function(*args, **kwargs):
        if request.args.get('key') and request.args.get('key') == password_string:
            return view_function(*args, **kwargs)
        else:
            abort(401)

    return decorated_function


@app.route('/password', methods=['GET'])
def password():
    return password_string


@app.route('/submitForm', methods=['POST'])
@require_appkey
def submit_form():
    # booking object is sent as json
    booking = Booking(**request.json)
    booking_manager.insert_booking(booking)

    return 'Form submitted successfully'

@app.route('/booking', methods=['GET'])
@require_appkey
def get_booking():
    form_content = booking_manager.get_form_content()
    form_content_json = flask_cors.jsonify(form_content)
    return form_content_json

if __name__ == '__main__':
    app.run(debug=True)
