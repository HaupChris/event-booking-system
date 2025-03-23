# src/utils/config.py

import os
from datetime import timedelta
from flask import Flask

def load_config(app: Flask) -> None:
    """
    Loads environment-based config into the Flask app.
    """

    # JWT settings
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "super-secret")
    # e.g. 24h token
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

    # Example for any additional config you want
    # app.config["SOME_OTHER_KEY"] = os.environ.get("SOME_OTHER_KEY", "default_value")
