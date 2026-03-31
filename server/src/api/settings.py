"""
Public Settings API Blueprint
=============================

Public, read-only runtime settings consumed by frontend clients.
"""

from flask import Blueprint, jsonify

from src.services.app_settings_service import get_frontend_branding_pack

settings_bp = Blueprint("settings", __name__)


@settings_bp.route("/settings/frontend", methods=["GET"])
def get_frontend_settings():
    """Return public frontend runtime settings."""
    branding_pack = get_frontend_branding_pack()
    return jsonify({"branding_pack": branding_pack}), 200
