"""Admin API for managing Orga Team inviters."""

from flask import Blueprint, jsonify, request

from src.api.auth_guards import protect_blueprint
from src.services.orga_team_service import (
    create_orga_team_member,
    deactivate_orga_team_member,
    get_orga_team_members,
    update_orga_team_member,
)
from src.utils.logger import get_logger
from src.utils.rate_limit import limiter

logger = get_logger(__name__)

admin_orga_team_bp = Blueprint("admin_orga_team", __name__)
protect_blueprint(admin_orga_team_bp, "admin")
limiter_admin_orga = limiter


@admin_orga_team_bp.route("/orga-team", methods=["GET"])
@limiter_admin_orga.limit("200/minute")
def get_orga_team_list():
    include_inactive = request.args.get("include_inactive", "true").lower() == "true"
    inviters = get_orga_team_members(include_inactive=include_inactive)
    return jsonify({"inviters": inviters}), 200


@admin_orga_team_bp.route("/orga-team", methods=["POST"])
@limiter_admin_orga.limit("60/minute")
def create_orga_team_item():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    name = str(data.get("name", "")).strip()
    display_order = data.get("display_order")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    try:
        inviter_id = create_orga_team_member(name=name, display_order=display_order)
        return jsonify({"message": "Inviter created", "id": inviter_id}), 201
    except Exception as error:
        logger.error(f"Failed to create inviter '{name}': {error}", exc_info=True)
        return jsonify({"error": "Failed to create inviter"}), 500


@admin_orga_team_bp.route("/orga-team/<int:member_id>", methods=["PUT"])
@limiter_admin_orga.limit("60/minute")
def update_orga_team_item(member_id: int):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    name = data.get("name")
    if isinstance(name, str):
        name = name.strip()
    is_active = data.get("is_active")
    display_order = data.get("display_order")

    if name == "":
        return jsonify({"error": "Name must not be empty"}), 400

    success = update_orga_team_member(
        member_id=member_id,
        name=name,
        is_active=is_active,
        display_order=display_order,
    )

    if not success:
        return jsonify({"error": "Inviter not found or no changes"}), 404

    return jsonify({"message": "Inviter updated"}), 200


@admin_orga_team_bp.route("/orga-team/<int:member_id>", methods=["DELETE"])
@limiter_admin_orga.limit("30/minute")
def delete_orga_team_item(member_id: int):
    success = deactivate_orga_team_member(member_id)
    if not success:
        return jsonify({"error": "Inviter not found"}), 404

    return jsonify({"message": "Inviter deactivated"}), 200
