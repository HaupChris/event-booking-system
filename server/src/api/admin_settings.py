"""
Admin Settings API Blueprint
=============================

Admin-only endpoint for managing application passwords.
Requires admin JWT authentication.
"""

import re

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from src.services.app_settings_service import (
    get_frontend_branding_pack,
    get_payment_link,
    set_frontend_branding_pack,
    set_payment_link,
)
from src.services.password_service import VALID_ROLES, update_password
from src.utils.logger import get_logger

logger = get_logger(__name__)

admin_settings_bp = Blueprint("admin_settings", __name__)

MIN_PASSWORD_LENGTH = 12
BRANDING_PACK_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$")


def _is_valid_http_url(value: str) -> bool:
    return value.startswith("https://") or value.startswith("http://")


def _is_valid_branding_pack(value: str) -> bool:
    return bool(BRANDING_PACK_PATTERN.match(value))


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


@admin_settings_bp.route("/settings/branding-pack", methods=["GET"])
@jwt_required()
def get_branding_pack_setting():
    """Return currently configured frontend branding pack."""
    unauthorized_response = _ensure_admin_identity()
    if unauthorized_response:
        return unauthorized_response

    branding_pack = get_frontend_branding_pack()
    return jsonify({"branding_pack": branding_pack}), 200


@admin_settings_bp.route("/settings/branding-pack", methods=["PUT"])
@jwt_required()
def update_branding_pack_setting():
    """Update frontend branding pack setting."""
    unauthorized_response = _ensure_admin_identity()
    if unauthorized_response:
        return unauthorized_response

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON body"}), 400

    branding_pack = data.get("branding_pack", "").strip()
    if not branding_pack:
        return jsonify({"msg": "Branding pack must not be empty"}), 400

    if not _is_valid_branding_pack(branding_pack):
        return (
            jsonify(
                {"msg": "Branding pack must use kebab-case and be 3-64 chars (a-z, 0-9, hyphen)."}
            ),
            400,
        )

    success = set_frontend_branding_pack(branding_pack)
    if not success:
        return jsonify({"msg": "Failed to update branding pack"}), 500

    logger.info("Frontend branding pack updated via admin settings")
    return (
        jsonify(
            {"msg": "Frontend branding pack updated successfully", "branding_pack": branding_pack}
        ),
        200,
    )


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
            return (
                jsonify(
                    {"msg": f"Password must be at least {MIN_PASSWORD_LENGTH} characters long"}
                ),
                400,
            )

        success = update_password(role, new_password)
        if not success:
            return jsonify({"msg": "Failed to update password"}), 500

        logger.info(f"Password updated for role '{role}' via admin settings")
        return jsonify({"msg": f"Password for '{role}' updated successfully"}), 200

    except Exception as e:
        logger.error(f"Error updating password: {e}", exc_info=True)
        return jsonify({"msg": "Internal server error"}), 500
