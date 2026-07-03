"""Admin-only endpoints for previewing and sending custom booking mails."""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from src.services.admin_booking_mail_service import (
    normalize_selected_booking_recipients,
    preview_custom_booking_mails,
    send_custom_booking_mails,
)
from src.utils.logger import get_logger
from src.utils.rate_limit import limiter

logger = get_logger(__name__)

admin_booking_mails_bp = Blueprint("admin_booking_mails", __name__)


def _ensure_admin_identity():
    identity = get_jwt_identity()
    if identity != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    return None


def _parse_custom_mail_payload() -> tuple[str, str, list[dict]]:
    if not request.json:
        raise ValueError("Missing JSON body")

    data = request.json
    subject_template = str(data.get("subject_template", "") or "")
    body_template = str(data.get("body_template", "") or "")
    selected_bookings = normalize_selected_booking_recipients(data.get("selected_bookings"))
    return subject_template, body_template, selected_bookings


@admin_booking_mails_bp.route("/bookings/custom-mail/preview", methods=["POST"])
@limiter.limit("60/minute")
@jwt_required()
def preview_booking_custom_mail():
    """Render preview samples for a personalized booking mail."""
    unauthorized_response = _ensure_admin_identity()
    if unauthorized_response:
        return unauthorized_response

    try:
        subject_template, body_template, selected_bookings = _parse_custom_mail_payload()
        preview_data = preview_custom_booking_mails(
            subject_template, body_template, selected_bookings
        )
        return jsonify(preview_data), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        logger.error(f"Failed to preview custom booking mail: {exc}", exc_info=True)
        return jsonify({"error": "Failed to render custom mail preview"}), 500


@admin_booking_mails_bp.route("/bookings/custom-mail/send", methods=["POST"])
@limiter.limit("10/minute")
@jwt_required()
def send_booking_custom_mail():
    """Send a personalized custom booking mail to selected recipients."""
    unauthorized_response = _ensure_admin_identity()
    if unauthorized_response:
        return unauthorized_response

    try:
        subject_template, body_template, selected_bookings = _parse_custom_mail_payload()
        send_result = send_custom_booking_mails(subject_template, body_template, selected_bookings)
        return jsonify(send_result), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        logger.error(f"Failed to send custom booking mail: {exc}", exc_info=True)
        return jsonify({"error": "Failed to send custom booking mail"}), 500
