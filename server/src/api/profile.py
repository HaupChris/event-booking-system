"""
Profile API Blueprint
=====================

Public API endpoints for profile page access and management.
Authentication is handled via profile UUID in the URL path.
"""

import time

from flask import Blueprint, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from src.services.mail_service import send_profile_recovery_mail
from src.services.news_service import get_news_for_profile, get_unread_count, mark_news_as_read
from src.services.profile_service import (
    accept_shift,
    decline_shift,
    get_assigned_shifts,
    get_profile_by_uuid,
    get_profile_uuids_by_email,
)
from src.utils.logger import get_logger, log_security_event

# Initialize logger
logger = get_logger(__name__)

profile_bp = Blueprint("profile", __name__)
limiter_profile = Limiter(get_remote_address)


@profile_bp.route("/<profile_uuid>", methods=["GET"])
@limiter_profile.limit("100/minute")
def get_profile(profile_uuid: str):
    """
    Get complete profile data by UUID.

    No authentication required - the UUID itself is the authentication.
    Rate limited to prevent brute force UUID guessing.
    """
    start_time = time.time()
    client_ip = request.remote_addr

    try:
        logger.info(f"Profile access request for UUID {profile_uuid[:8]}... from {client_ip}")

        # Validate UUID format (basic check)
        if len(profile_uuid) != 36 or profile_uuid.count("-") != 4:
            logger.warning(f"Invalid UUID format from {client_ip}: {profile_uuid}")
            log_security_event("invalid_uuid_format", {"uuid": profile_uuid, "ip": client_ip})
            return jsonify({"error": "Invalid profile UUID"}), 400

        # Get profile data
        profile = get_profile_by_uuid(profile_uuid)

        if not profile:
            logger.warning(f"Profile not found for UUID {profile_uuid[:8]}... from {client_ip}")
            log_security_event("profile_not_found", {"uuid": profile_uuid[:8], "ip": client_ip})
            return jsonify({"error": "Profile not found"}), 404

        elapsed_time = time.time() - start_time
        logger.info(f"Profile {profile_uuid[:8]}... retrieved successfully in {elapsed_time:.2f}s")

        return jsonify(profile), 200

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(f"Profile retrieval failed after {elapsed_time:.2f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/<profile_uuid>/shifts", methods=["GET"])
@limiter_profile.limit("100/minute")
def get_shifts(profile_uuid: str):
    """Get all assigned work shifts for a profile."""
    client_ip = request.remote_addr

    try:
        logger.debug(f"Shift list request for UUID {profile_uuid[:8]}... from {client_ip}")

        # Validate profile exists
        profile = get_profile_by_uuid(profile_uuid)
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        # Get shifts
        shifts = get_assigned_shifts(profile["booking"]["id"])

        return jsonify({"shifts": shifts}), 200

    except Exception as e:
        logger.error(f"Shift retrieval failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/<profile_uuid>/shifts/<int:assignment_id>/accept", methods=["PUT"])
@limiter_profile.limit("60/minute")
def accept_shift_assignment(profile_uuid: str, assignment_id: int):
    """Accept a work shift assignment."""
    client_ip = request.remote_addr

    try:
        logger.info(
            f"Shift acceptance: UUID {profile_uuid[:8]}..., assignment {assignment_id} from {client_ip}"
        )

        success = accept_shift(profile_uuid, assignment_id)

        if success:
            logger.info(f"Shift {assignment_id} accepted by profile {profile_uuid[:8]}...")
            return jsonify({"message": "Shift accepted successfully"}), 200
        else:
            logger.warning(
                f"Shift acceptance failed: assignment {assignment_id} not found for profile {profile_uuid[:8]}..."
            )
            return jsonify({"error": "Shift assignment not found"}), 404

    except Exception as e:
        logger.error(f"Shift acceptance failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/<profile_uuid>/shifts/<int:assignment_id>/decline", methods=["PUT"])
@limiter_profile.limit("60/minute")
def decline_shift_assignment(profile_uuid: str, assignment_id: int):
    """Decline a work shift assignment with optional reason."""
    client_ip = request.remote_addr

    try:
        logger.info(
            f"Shift decline: UUID {profile_uuid[:8]}..., assignment {assignment_id} from {client_ip}"
        )

        data = request.json or {}
        rejection_reason = data.get("rejection_reason")
        alternative_preferences = data.get("alternative_preferences")

        success = decline_shift(
            profile_uuid, assignment_id, rejection_reason, alternative_preferences
        )

        if success:
            logger.info(f"Shift {assignment_id} declined by profile {profile_uuid[:8]}...")
            # TODO: Send notification to admin about declined shift
            return jsonify({"message": "Shift declined successfully"}), 200
        else:
            logger.warning(
                f"Shift decline failed: assignment {assignment_id} not found for profile {profile_uuid[:8]}..."
            )
            return jsonify({"error": "Shift assignment not found"}), 404

    except ValueError as e:
        # Validation error (e.g., rejection reason too short)
        logger.warning(f"Shift decline validation failed: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Shift decline failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/<profile_uuid>/news", methods=["GET"])
@limiter_profile.limit("100/minute")
def get_news_feed(profile_uuid: str):
    """Get news feed for a profile with read status."""
    client_ip = request.remote_addr

    try:
        logger.debug(f"News feed request for UUID {profile_uuid[:8]}... from {client_ip}")

        # Get news items
        news_items = get_news_for_profile(profile_uuid)

        return jsonify({"news": news_items}), 200

    except Exception as e:
        logger.error(f"News feed retrieval failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/<profile_uuid>/news/<int:news_id>/read", methods=["POST"])
@limiter_profile.limit("200/minute")
def mark_news_read(profile_uuid: str, news_id: int):
    """Mark a news item as read."""
    client_ip = request.remote_addr

    try:
        logger.debug(f"Mark news {news_id} as read for UUID {profile_uuid[:8]}... from {client_ip}")

        success = mark_news_as_read(profile_uuid, news_id)

        if success:
            return jsonify({"message": "News marked as read"}), 200
        else:
            return jsonify({"error": "Failed to mark news as read"}), 400

    except Exception as e:
        logger.error(f"Mark news as read failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/<profile_uuid>/news/unread-count", methods=["GET"])
@limiter_profile.limit("100/minute")
def get_unread_news_count(profile_uuid: str):
    """Get count of unread news items."""
    client_ip = request.remote_addr

    try:
        logger.debug(f"Unread count request for UUID {profile_uuid[:8]}... from {client_ip}")

        count = get_unread_count(profile_uuid)

        return jsonify({"unread_count": count}), 200

    except Exception as e:
        logger.error(f"Unread count retrieval failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/recover", methods=["POST"])
@limiter_profile.limit("3/hour")
def recover_profile():
    """
    Recover profile link(s) by email.

    Send profile link(s) to all bookings associated with the provided email.
    Rate limited to 3 per hour to prevent email spam.
    """
    start_time = time.time()
    client_ip = request.remote_addr

    try:
        logger.info(f"Profile recovery request from {client_ip}")

        # Validate request
        if not request.json:
            logger.warning(f"Profile recovery failed: missing JSON body from {client_ip}")
            return jsonify({"error": "Missing JSON body"}), 400

        email = request.json.get("email")

        if not email:
            logger.warning(f"Profile recovery failed: missing email from {client_ip}")
            return jsonify({"error": "Email is required"}), 400

        # Validate email format (basic check)
        if "@" not in email or "." not in email:
            logger.warning(f"Profile recovery failed: invalid email format from {client_ip}")
            log_security_event("invalid_email_format", {"email": email, "ip": client_ip})
            return jsonify({"error": "Invalid email format"}), 400

        logger.info(f"Profile recovery request for email: {email}")

        # Get all profiles for this email
        profiles = get_profile_uuids_by_email(email)

        if not profiles:
            # Don't reveal whether email exists in system (security best practice)
            logger.info(f"No profiles found for email {email}, but returning success")
            elapsed_time = time.time() - start_time
            return (
                jsonify(
                    {
                        "message": "If this email is registered, you will receive a recovery link shortly."
                    }
                ),
                200,
            )

        # Send recovery email
        try:
            send_profile_recovery_mail(email, profiles)
            logger.info(f"Profile recovery email sent to {email} with {len(profiles)} profile(s)")
        except Exception as e:
            logger.error(f"Failed to send recovery email to {email}: {str(e)}", exc_info=True)
            # Don't expose email sending errors to user
            pass

        elapsed_time = time.time() - start_time
        logger.info(f"Profile recovery completed in {elapsed_time:.2f}s")

        return (
            jsonify(
                {
                    "message": "If this email is registered, you will receive a recovery link shortly."
                }
            ),
            200,
        )

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(f"Profile recovery failed after {elapsed_time:.2f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
