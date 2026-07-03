"""Admin API for ticket, beverage, and food option CRUD operations."""

from typing import Any, cast

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from src.services.option_service import (
    OptionScope,
    OptionType,
    create_option,
    delete_option,
    get_options,
    update_option,
)
from src.utils.rate_limit import limiter

admin_options_bp = Blueprint("admin_options", __name__)
limiter_admin_options = limiter

VALID_SCOPES = {"regular", "artist"}
VALID_OPTION_TYPES = {"ticket", "beverage", "food"}


def _ensure_admin() -> tuple[dict, int] | None:
    if get_jwt_identity() != "admin":
        return {"error": "Unauthorized"}, 403
    return None


def _is_valid_scope(scope: str) -> bool:
    return scope in VALID_SCOPES


def _is_valid_option_type(option_type: str) -> bool:
    return option_type in VALID_OPTION_TYPES


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return default
    return parsed if parsed >= 0 else default


def _to_int(value: Any, default: int = 0) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    return parsed if parsed >= 0 else default


def _to_bool(value: Any, default: bool = True) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "1", "yes", "on"}:
            return True
        if lowered in {"false", "0", "no", "off"}:
            return False
    return default


@admin_options_bp.route("/options/<string:scope>/<string:option_type>", methods=["GET"])
@limiter_admin_options.limit("200/minute")
@jwt_required()
def get_options_endpoint(scope: str, option_type: str):
    unauthorized = _ensure_admin()
    if unauthorized:
        return jsonify(unauthorized[0]), unauthorized[1]

    if not _is_valid_scope(scope) or not _is_valid_option_type(option_type):
        return jsonify({"error": "Invalid option scope or type"}), 400

    normalized_scope = cast(OptionScope, scope)
    normalized_option_type = cast(OptionType, option_type)

    return jsonify({"options": get_options(normalized_scope, normalized_option_type)}), 200


@admin_options_bp.route("/options/<string:scope>/<string:option_type>", methods=["POST"])
@limiter_admin_options.limit("60/minute")
@jwt_required()
def create_option_endpoint(scope: str, option_type: str):
    unauthorized = _ensure_admin()
    if unauthorized:
        return jsonify(unauthorized[0]), unauthorized[1]

    if not _is_valid_scope(scope) or not _is_valid_option_type(option_type):
        return jsonify({"error": "Invalid option scope or type"}), 400

    normalized_scope = cast(OptionScope, scope)
    normalized_option_type = cast(OptionType, option_type)

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    title = str(data.get("title", "")).strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    if option_type == "ticket":
        amount = _to_int(data.get("amount", 0), default=-1)
        if amount < 0:
            return jsonify({"error": "Amount must be a non-negative integer"}), 400
    else:
        amount = 0

    option_id = create_option(
        scope=normalized_scope,
        option_type=normalized_option_type,
        title=title,
        working_title=str(data.get("working_title") or "").strip() or None,
        price=_to_float(data.get("price", 0.0)),
        amount=amount,
        requires_workshift=_to_bool(data.get("requires_workshift", True), default=True),
        description=str(data.get("description") or "").strip(),
    )

    return jsonify({"message": "Option created", "id": option_id}), 201


@admin_options_bp.route(
    "/options/<string:scope>/<string:option_type>/<int:option_id>", methods=["PUT"]
)
@limiter_admin_options.limit("60/minute")
@jwt_required()
def update_option_endpoint(scope: str, option_type: str, option_id: int):  # noqa: PLR0911
    unauthorized = _ensure_admin()
    if unauthorized:
        return jsonify(unauthorized[0]), unauthorized[1]

    if not _is_valid_scope(scope) or not _is_valid_option_type(option_type):
        return jsonify({"error": "Invalid option scope or type"}), 400

    normalized_scope = cast(OptionScope, scope)
    normalized_option_type = cast(OptionType, option_type)

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    title = data.get("title")
    if title is not None and not str(title).strip():
        return jsonify({"error": "Title must not be empty"}), 400

    working_title = data.get("working_title")
    if working_title is not None and not str(working_title).strip():
        return jsonify({"error": "Working title must not be empty"}), 400

    amount: int | None = None
    if "amount" in data:
        amount = _to_int(data.get("amount"), default=-1)
        if amount < 0:
            return jsonify({"error": "Amount must be a non-negative integer"}), 400

    price: float | None = None
    if "price" in data:
        price = _to_float(data.get("price"), default=-1)
        if price < 0:
            return jsonify({"error": "Price must be a non-negative number"}), 400

    requires_workshift: bool | None = None
    if "requires_workshift" in data:
        requires_workshift = _to_bool(data.get("requires_workshift"), default=True)

    success = update_option(
        scope=normalized_scope,
        option_type=normalized_option_type,
        option_id=option_id,
        title=str(title).strip() if title is not None else None,
        working_title=str(working_title).strip() if working_title is not None else None,
        price=price,
        amount=amount,
        requires_workshift=requires_workshift,
        description=str(data.get("description") or "").strip() if "description" in data else None,
    )

    if not success:
        return jsonify({"error": "Option not found or no changes"}), 404

    return jsonify({"message": "Option updated"}), 200


@admin_options_bp.route(
    "/options/<string:scope>/<string:option_type>/<int:option_id>", methods=["DELETE"]
)
@limiter_admin_options.limit("30/minute")
@jwt_required()
def delete_option_endpoint(scope: str, option_type: str, option_id: int):
    unauthorized = _ensure_admin()
    if unauthorized:
        return jsonify(unauthorized[0]), unauthorized[1]

    if not _is_valid_scope(scope) or not _is_valid_option_type(option_type):
        return jsonify({"error": "Invalid option scope or type"}), 400

    normalized_scope = cast(OptionScope, scope)
    normalized_option_type = cast(OptionType, option_type)

    success, message = delete_option(normalized_scope, normalized_option_type, option_id)
    if not success:
        status_code = 404 if message == "Option not found" else 400
        return jsonify({"error": message}), status_code

    return jsonify({"message": message}), 200
