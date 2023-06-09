from flask import Flask, request, abort
import flask_cors
from functools import wraps
import sqlite3
from sqlite3 import Error

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

password_string = 'password'


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
    data = request.get_json()
    name = data['name']
    address = data['address']
    save_booking(name, address)
    return 'Form submitted successfully'


if __name__ == '__main__':
    app.run(debug=True)
