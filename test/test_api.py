from flask import json
import pytest
import sys
import os
import base64
import requests


def test_authenticate():
    url = "http://localhost:5000/api/auth"  # Adjust if your app runs on a different port
    auth_data = {
        "password": "weiherwald",  # Use the appropriate test password
    }
    response = requests.post(url, json=auth_data)
    assert response.status_code == 200
    access_token = response.json()['access_token']
    return access_token


def test_submit_form():
    token = test_authenticate()
    url = "http://localhost:5000/api/submitForm"

    # Mock booking data with a base64-encoded signature
    signature = base64.b64encode(b"test_signature").decode('utf-8')  # Example signature

    # Mock booking data
    booking_data = {
        "last_name": "Doe",
        "first_name": "John",
        "email": "hauptmann.christian@yahoo.com",
        "phone": "123456789",
        "ticket_id": 1,
        "beverage_id": 1,
        "timeslot_priority_1": 1,
        "timeslot_priority_2": 2,
        "timeslot_priority_3": 3,
        "signature": signature,
        "material_ids": [1, 2],
        "amount_shifts": 2,
        "supporter_buddy": "Jane Doe",
        "total_price": 100.0
    }

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
    response = requests.post(url, headers=headers, data=json.dumps(booking_data))

    # Assert the response
    assert response.status_code == 200


if __name__ == "__main__":
    test_submit_form()
