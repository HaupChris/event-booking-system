"""
Admin Settings API Blueprint
=============================

Admin-only endpoint for managing application passwords.
Requires admin JWT authentication.
"""

import re

from flask import Blueprint, jsonify, request

from src.api.auth_guards import protect_blueprint
from src.services.app_settings_service import (
    get_frontend_branding_pack,
    get_payment_link,
    get_public_app_url,
    get_rideshare_enabled,
    set_frontend_branding_pack,
    set_payment_link,
    set_public_app_url,
    set_rideshare_enabled,
)
from src.services.password_service import VALID_ROLES, update_password
from src.utils.logger import get_logger

logger = get_logger(__name__)

admin_settings_bp = Blueprint("admin_settings", __name__)
protect_blueprint(admin_settings_bp, "admin")

MIN_PASSWORD_LENGTH = 12
BRANDING_PACK_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$")


def _is_valid_http_url(value: str) -> bool:
    return value.startswith("https://") or value.startswith("http://")


def _is_valid_branding_pack(value: str) -> bool:
    return bool(BRANDING_PACK_PATTERN.match(value))


@admin_settings_bp.route("/settings/payment-link", methods=["GET"])
def get_payment_link_setting():
    """Return currently configured payment link."""

    payment_link = get_payment_link()
    return jsonify({"payment_link": payment_link}), 200


@admin_settings_bp.route("/settings/payment-link", methods=["PUT"])
def update_payment_link_setting():
    """Update payment link setting."""

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


@admin_settings_bp.route("/settings/public-app-url", methods=["GET"])
def get_public_app_url_setting():
    """Return currently configured public frontend URL."""

    return jsonify({"public_app_url": get_public_app_url()}), 200


@admin_settings_bp.route("/settings/public-app-url", methods=["PUT"])
def update_public_app_url_setting():
    """Update public frontend URL setting."""

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON body"}), 400

    public_app_url = data.get("public_app_url", "").strip()
    if not public_app_url:
        return jsonify({"msg": "Public app URL must not be empty"}), 400

    if not _is_valid_http_url(public_app_url):
        return jsonify({"msg": "Public app URL must start with http:// or https://"}), 400

    normalized_public_app_url = public_app_url.rstrip("/")
    success = set_public_app_url(normalized_public_app_url)
    if not success:
        return jsonify({"msg": "Failed to update public app URL"}), 500

    logger.info("Public app URL updated via admin settings")
    return (
        jsonify(
            {
                "msg": "Public app URL updated successfully",
                "public_app_url": normalized_public_app_url,
            }
        ),
        200,
    )


@admin_settings_bp.route("/settings/branding-pack", methods=["GET"])
def get_branding_pack_setting():
    """Return currently configured frontend branding pack."""

    branding_pack = get_frontend_branding_pack()
    return jsonify({"branding_pack": branding_pack}), 200


@admin_settings_bp.route("/settings/branding-pack", methods=["PUT"])
def update_branding_pack_setting():
    """Update frontend branding pack setting."""

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


@admin_settings_bp.route("/settings/rideshare-enabled", methods=["GET"])
def get_rideshare_enabled_setting():
    """Return whether rideshare is enabled for profile pages."""

    return jsonify({"rideshare_enabled": get_rideshare_enabled()}), 200


@admin_settings_bp.route("/settings/rideshare-enabled", methods=["PUT"])
def update_rideshare_enabled_setting():
    """Update rideshare enable/disable toggle."""

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON body"}), 400

    rideshare_enabled = data.get("rideshare_enabled")
    if not isinstance(rideshare_enabled, bool):
        return jsonify({"msg": "rideshare_enabled must be a boolean"}), 400

    success = set_rideshare_enabled(rideshare_enabled)
    if not success:
        return jsonify({"msg": "Failed to update rideshare toggle"}), 500

    logger.info("Rideshare toggle updated via admin settings")
    return (
        jsonify(
            {
                "msg": "Rideshare toggle updated successfully",
                "rideshare_enabled": rideshare_enabled,
            }
        ),
        200,
    )


@admin_settings_bp.route("/settings/password", methods=["PUT"])
def change_password():  # noqa: PLR0911
    """Update the password for a given role."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"msg": "Missing JSON body"}), 400

        role = data.get("role", "").strip()
        new_password = data.get("new_password", "")

        if not role or role not in VALID_ROLES:
            return (
                jsonify({"msg": f"Invalid role. Must be one of: {', '.join(sorted(VALID_ROLES))}"}),
                400,
            )

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
        logger.exception(f"Error updating password: {e}")
        return jsonify({"msg": "Internal server error"}), 500
