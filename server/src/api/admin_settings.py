"""
Admin Settings API Blueprint
=============================

Admin-only endpoint for managing application passwords.
Requires admin JWT authentication.
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from src.services.app_settings_service import get_payment_link, set_payment_link
from src.services.password_service import VALID_ROLES, update_password
from src.utils.logger import get_logger

logger = get_logger(__name__)

admin_settings_bp = Blueprint("admin_settings", __name__)

MIN_PASSWORD_LENGTH = 1


def _is_valid_http_url(value: str) -> bool:
    return value.startswith("https://") or value.startswith("http://")


def _ensure_admin_identity():
    identity = get_jwt_identity()
    if identity != "admin":
        return jsonify({"msg": "Unauthorized"}), 403
    return None


@admin_settings_bp.route("/settings/payment-link", methods=["GET"])
@jwt_required()
def get_payment_link_setting():
    """Return currently configured payment link."""
    unauthorized_response = _ensure_admin_identity()
    if unauthorized_response:
        return unauthorized_response

    payment_link = get_payment_link()
    return jsonify({"payment_link": payment_link}), 200


@admin_settings_bp.route("/settings/payment-link", methods=["PUT"])
@jwt_required()
def update_payment_link_setting():
    """Update payment link setting."""
    unauthorized_response = _ensure_admin_identity()
    if unauthorized_response:
        return unauthorized_response

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON body"}), 400

    payment_link = data.get("payment_link", "").strip()
    if not payment_link:
        return jsonify({"msg": "Payment link must not be empty"}), 400

    if not _is_valid_http_url(payment_link):
        return jsonify({"msg": "Payment link must start with http:// or https://"}), 400

    success = set_payment_link(payment_link)
    if not success:
        return jsonify({"msg": "Failed to update payment link"}), 500

    logger.info("Payment link updated via admin settings")
    return jsonify({"msg": "Payment link updated successfully", "payment_link": payment_link}), 200


@admin_settings_bp.route("/settings/password", methods=["PUT"])
@jwt_required()
def change_password():
    """Update the password for a given role."""
    try:
        unauthorized_response = _ensure_admin_identity()
        if unauthorized_response:
            return unauthorized_response

        data = request.get_json()
        if not data:
            return jsonify({"msg": "Missing JSON body"}), 400

        role = data.get("role", "").strip()
        new_password = data.get("new_password", "")

        if not role or role not in VALID_ROLES:
            return jsonify(
                {"msg": f"Invalid role. Must be one of: {', '.join(sorted(VALID_ROLES))}"}
            ), 400

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
