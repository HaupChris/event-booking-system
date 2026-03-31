"""
Admin Settings API Blueprint
=============================

Admin-only endpoint for managing application passwords.
Requires admin JWT authentication.
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from src.services.password_service import VALID_ROLES, update_password
from src.utils.logger import get_logger

logger = get_logger(__name__)

admin_settings_bp = Blueprint("admin_settings", __name__)

MIN_PASSWORD_LENGTH = 1


@admin_settings_bp.route("/settings/password", methods=["PUT"])
@jwt_required()
def change_password():
    """Update the password for a given role."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"msg": "Missing JSON body"}), 400

        role = data.get("role", "").strip()
        new_password = data.get("new_password", "")

        if not role or role not in VALID_ROLES:
            return jsonify({"msg": f"Invalid role. Must be one of: {', '.join(sorted(VALID_ROLES))}"}), 400

        if len(new_password) < MIN_PASSWORD_LENGTH:
            return jsonify({"msg": "Password must not be empty"}), 400

        success = update_password(role, new_password)
        if not success:
            return jsonify({"msg": "Failed to update password"}), 500

        logger.info(f"Password updated for role '{role}' via admin settings")
        return jsonify({"msg": f"Password for '{role}' updated successfully"}), 200

    except Exception as e:
        logger.error(f"Error updating password: {e}", exc_info=True)
        return jsonify({"msg": "Internal server error"}), 500
