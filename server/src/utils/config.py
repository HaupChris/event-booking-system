# src/utils/config.py

import os
from datetime import timedelta

from flask import Flask


def load_config(app: Flask) -> None:
    """
    Loads environment-based config into the Flask app.
    """

    # JWT settings
    jwt_secret = os.environ.get("JWT_SECRET_KEY", "").strip()
    if len(jwt_secret) < 32:
        raise RuntimeError(
            "JWT_SECRET_KEY must be set and at least 32 characters long. "
            "Refusing to start with insecure JWT configuration."
        )

    app.config["JWT_SECRET_KEY"] = jwt_secret
    # e.g. 24h token
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
    app.config["MAX_CONTENT_LENGTH"] = int(os.environ.get("MAX_CONTENT_LENGTH", "2097152"))

    # Example for any additional config you want
    # app.config["SOME_OTHER_KEY"] = os.environ.get("SOME_OTHER_KEY", "default_value")
