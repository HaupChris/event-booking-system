"""Admin API for workshift and timeslot CRUD operations."""

from typing import Any

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from src.services.workshift_service import (
    create_timeslot,
    create_workshift,
    delete_timeslot,
    delete_workshift,
    get_workshifts_with_timeslots,
    update_timeslot,
    update_workshift,
)
from src.utils.logger import get_logger

logger = get_logger(__name__)

admin_workshifts_bp = Blueprint("admin_workshifts", __name__)
limiter_admin_workshifts = Limiter(get_remote_address)


def _ensure_admin() -> tuple[dict, int] | None:
    if get_jwt_identity() != "admin":
        return {"error": "Unauthorized"}, 403
    return None


def _parse_positive_int(value: Any, default: int = 1) -> int:
    if isinstance(value, int):
        parsed = value
    elif isinstance(value, float):
        parsed = int(value)
    elif isinstance(value, bytes):
        try:
            parsed = int(value.decode().strip())
        except (UnicodeDecodeError, ValueError):
            return default
    elif isinstance(value, bytearray):
        try:
            parsed = int(bytes(value).decode().strip())
        except (UnicodeDecodeError, ValueError):
            return default
    elif isinstance(value, str):
        try:
            parsed = int(value.strip())
        except ValueError:
            return default
    else:
        return default

    return parsed if parsed >= 1 else default


@admin_workshifts_bp.route("/workshifts", methods=["GET"])
@limiter_admin_workshifts.limit("200/minute")
@jwt_required()
def get_workshifts():
    unauthorized = _ensure_admin()
    if unauthorized:
        return jsonify(unauthorized[0]), unauthorized[1]

    return jsonify({"work_shifts": get_workshifts_with_timeslots()}), 200


@admin_workshifts_bp.route("/workshifts", methods=["POST"])
@limiter_admin_workshifts.limit("60/minute")
@jwt_required()
def create_workshift_endpoint():
    unauthorized = _ensure_admin()
    if unauthorized:
        return jsonify(unauthorized[0]), unauthorized[1]

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    title = str(data.get("title", "")).strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    workshift_id = create_workshift(
        title=title,
        description=str(data.get("description") or "").strip(),
        working_title=str(data.get("working_title") or "").strip() or None,
        multiple_selection_possible=_parse_positive_int(data.get("multiple_selection_possible", 1)),
    )
    return jsonify({"message": "Workshift created", "id": workshift_id}), 201


@admin_workshifts_bp.route("/workshifts/<int:workshift_id>", methods=["PUT"])
@limiter_admin_workshifts.limit("60/minute")
@jwt_required()
def update_workshift_endpoint(workshift_id: int):
    unauthorized = _ensure_admin()
    if unauthorized:
        return jsonify(unauthorized[0]), unauthorized[1]

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    title = data.get("title")
    if title is not None and not str(title).strip():
        return jsonify({"error": "Title must not be empty"}), 400

    working_title = data.get("working_title")
    if working_title is not None and not str(working_title).strip():
        return jsonify({"error": "Working title must not be empty"}), 400

    success = update_workshift(
        workshift_id=workshift_id,
        title=str(title).strip() if title is not None else None,
        description=str(data.get("description") or "").strip() if "description" in data else None,
        working_title=str(working_title).strip() if working_title is not None else None,
        multiple_selection_possible=(
            _parse_positive_int(data.get("multiple_selection_possible"))
            if "multiple_selection_possible" in data
            else None
        ),
    )

    if not success:
        return jsonify({"error": "Workshift not found or no changes"}), 404

    return jsonify({"message": "Workshift updated"}), 200


@admin_workshifts_bp.route("/workshifts/<int:workshift_id>", methods=["DELETE"])
@limiter_admin_workshifts.limit("30/minute")
@jwt_required()
def delete_workshift_endpoint(workshift_id: int):
    unauthorized = _ensure_admin()
    if unauthorized:
        return jsonify(unauthorized[0]), unauthorized[1]

    success, message = delete_workshift(workshift_id)
    if not success:
        status_code = 404 if message == "Workshift not found" else 400
        return jsonify({"error": message}), status_code

    return jsonify({"message": message}), 200


@admin_workshifts_bp.route("/workshifts/<int:workshift_id>/timeslots", methods=["POST"])
@limiter_admin_workshifts.limit("60/minute")
@jwt_required()
def create_timeslot_endpoint(workshift_id: int):
    unauthorized = _ensure_admin()
    if unauthorized:
        return jsonify(unauthorized[0]), unauthorized[1]

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    title = str(data.get("title", "")).strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    timeslot_id = create_timeslot(
        workshift_id=workshift_id,
        title=title,
        working_title=str(data.get("working_title") or "").strip() or None,
        start_time=str(data.get("start_time") or "").strip(),
        end_time=str(data.get("end_time") or "").strip(),
        num_needed=_parse_positive_int(data.get("num_needed", 1)),
    )

    if timeslot_id == -1:
        return jsonify({"error": "Workshift not found"}), 404

    return jsonify({"message": "Timeslot created", "id": timeslot_id}), 201


@admin_workshifts_bp.route("/timeslots/<int:timeslot_id>", methods=["PUT"])
@limiter_admin_workshifts.limit("60/minute")
@jwt_required()
def update_timeslot_endpoint(timeslot_id: int):
    unauthorized = _ensure_admin()
    if unauthorized:
        return jsonify(unauthorized[0]), unauthorized[1]

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    title = data.get("title")
    if title is not None and not str(title).strip():
        return jsonify({"error": "Title must not be empty"}), 400

    working_title = data.get("working_title")
    if working_title is not None and not str(working_title).strip():
        return jsonify({"error": "Working title must not be empty"}), 400

    success = update_timeslot(
        timeslot_id=timeslot_id,
        title=str(title).strip() if title is not None else None,
        working_title=str(working_title).strip() if working_title is not None else None,
        start_time=str(data.get("start_time") or "").strip() if "start_time" in data else None,
        end_time=str(data.get("end_time") or "").strip() if "end_time" in data else None,
        num_needed=(_parse_positive_int(data.get("num_needed")) if "num_needed" in data else None),
    )
    if not success:
        return jsonify({"error": "Timeslot not found or no changes"}), 404

    return jsonify({"message": "Timeslot updated"}), 200


@admin_workshifts_bp.route("/timeslots/<int:timeslot_id>", methods=["DELETE"])
@limiter_admin_workshifts.limit("30/minute")
@jwt_required()
def delete_timeslot_endpoint(timeslot_id: int):
    unauthorized = _ensure_admin()
    if unauthorized:
        return jsonify(unauthorized[0]), unauthorized[1]

    success, message = delete_timeslot(timeslot_id)
    if not success:
        status_code = 404 if message == "Timeslot not found" else 400
        return jsonify({"error": message}), status_code

    return jsonify({"message": message}), 200
