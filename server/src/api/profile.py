"""
Profile API Blueprint
=====================

Public API endpoints for profile page access and management.
Authentication is handled via profile UUID in the URL path.
"""

import time
from collections.abc import Callable
from functools import wraps
from typing import Any

from flask import Blueprint, Response, jsonify, request

from src.services.app_settings_service import get_payment_link, get_rideshare_enabled
from src.services.booking_events_service import record_profile_event
from src.services.faq_service import get_faqs_grouped_by_category
from src.services.mail_service import send_profile_recovery_mail
from src.services.news_service import get_news_for_profile, get_unread_count, mark_news_as_read
from src.services.profile_service import (
    accept_shift,
    decline_shift,
    get_assigned_shifts,
    get_profile_by_uuid,
    get_profile_uuids_by_email,
)
from src.services.rideshare_service import (
    approve_join_request,
    cancel_rideshare_post,
    complete_rideshare_post,
    create_rideshare_post,
    get_rideshare_board,
    react_to_rideshare_post,
    reject_join_request,
)
from src.services.shift_message_service import get_shift_messages_for_booking
from src.utils.logger import get_logger, log_security_event
from src.utils.rate_limit import limiter

# Initialize logger
logger = get_logger(__name__)

profile_bp = Blueprint("profile", __name__)
limiter_profile = limiter


@profile_bp.after_request
def _disable_caching(response: Response) -> Response:
    """Profile responses contain personal data: keep them out of browser and proxy caches."""
    response.headers["Cache-Control"] = "no-store"
    return response


def _ensure_rideshare_enabled():
    if get_rideshare_enabled():
        return None
    return (
        jsonify(
            {
                "error": "Rideshare is currently disabled and will be enabled shortly before festival."
            }
        ),
        403,
    )


def _rideshare_enabled_required(view: Callable) -> Callable:
    @wraps(view)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        return _ensure_rideshare_enabled() or view(*args, **kwargs)

    return wrapper


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

        profile["payment_link"] = get_payment_link()

        elapsed_time = time.time() - start_time
        logger.info(f"Profile {profile_uuid[:8]}... retrieved successfully in {elapsed_time:.2f}s")

        return jsonify(profile), 200

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.exception(f"Profile retrieval failed after {elapsed_time:.2f}s: {str(e)}")
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
        logger.exception(f"Shift retrieval failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/<profile_uuid>/shifts/messages", methods=["GET"])
@limiter_profile.limit("100/minute")
def get_shift_messages_for_profile(profile_uuid: str):
    """Get shift-related message feed for a profile."""
    client_ip = request.remote_addr

    try:
        logger.debug(f"Shift message feed request for UUID {profile_uuid[:8]}... from {client_ip}")

        profile = get_profile_by_uuid(profile_uuid)
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        messages = get_shift_messages_for_booking(profile["booking"]["id"])
        return jsonify({"messages": messages}), 200
    except Exception as e:
        logger.exception(f"Shift message feed retrieval failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/<profile_uuid>/rideshare", methods=["GET"])
@limiter_profile.limit("100/minute")
@_rideshare_enabled_required
def get_rideshare(profile_uuid: str):
    """Get ride sharing board data for a profile."""
    client_ip = request.remote_addr

    try:
        logger.debug(f"Ride sharing board request for UUID {profile_uuid[:8]}... from {client_ip}")

        rideshare = get_rideshare_board(profile_uuid)
        return jsonify({"rideshare": rideshare}), 200

    except LookupError as e:
        logger.warning(f"Ride sharing board failed: {str(e)} for UUID {profile_uuid[:8]}...")
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        logger.exception(f"Ride sharing board retrieval failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/<profile_uuid>/rideshare/posts", methods=["POST"])
@limiter_profile.limit("30/minute")
@_rideshare_enabled_required
def create_rideshare(profile_uuid: str):
    """Create a ride sharing offer or request for a profile."""
    client_ip = request.remote_addr

    try:
        logger.info(f"Ride share post create for UUID {profile_uuid[:8]}... from {client_ip}")

        data = request.json or {}
        post_id = create_rideshare_post(
            profile_uuid=profile_uuid,
            post_type=data.get("post_type", ""),
            origin=data.get("origin", ""),
            destination=data.get("destination", ""),
            departure_time=data.get("departure_time", ""),
            seats_total=data.get("seats_total"),
            notes=data.get("notes"),
        )
        return jsonify({"message": "Ride share post created", "post_id": post_id}), 201

    except LookupError as e:
        logger.warning(f"Ride share post create failed: {str(e)} for UUID {profile_uuid[:8]}...")
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        logger.warning(f"Ride share post create validation failed: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.exception(f"Ride share post create failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/<profile_uuid>/rideshare/posts/<int:post_id>/react", methods=["POST"])
@limiter_profile.limit("40/minute")
@_rideshare_enabled_required
def react_to_rideshare(profile_uuid: str, post_id: int):
    """React to a ride share post (offer or request)."""
    client_ip = request.remote_addr

    try:
        logger.info(
            f"Ride share reaction for UUID {profile_uuid[:8]}..., post {post_id} from {client_ip}"
        )

        join_request_id = react_to_rideshare_post(profile_uuid, post_id)
        return jsonify({"message": "Reaction created", "request_id": join_request_id}), 201

    except LookupError as e:
        logger.warning(
            f"Ride share reaction failed: {str(e)} for UUID {profile_uuid[:8]}..., post {post_id}"
        )
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        logger.warning(f"Ride share reaction validation failed: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.exception(f"Ride share reaction failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route(
    "/<profile_uuid>/rideshare/join-requests/<int:request_id>/approve", methods=["PUT"]
)
@limiter_profile.limit("60/minute")
@_rideshare_enabled_required
def approve_rideshare_join(profile_uuid: str, request_id: int):
    """Approve a ride share response for an owned post."""
    client_ip = request.remote_addr

    try:
        logger.info(
            f"Ride share join approval for UUID {profile_uuid[:8]}..., request {request_id} from {client_ip}"
        )
        approve_join_request(profile_uuid, request_id)
        return jsonify({"message": "Join request approved"}), 200

    except LookupError as e:
        logger.warning(
            f"Ride share join approval failed: {str(e)} for UUID {profile_uuid[:8]}..., request {request_id}"
        )
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        logger.warning(f"Ride share join approval validation failed: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.exception(f"Ride share join approval failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route(
    "/<profile_uuid>/rideshare/join-requests/<int:request_id>/reject", methods=["PUT"]
)
@limiter_profile.limit("60/minute")
@_rideshare_enabled_required
def reject_rideshare_join(profile_uuid: str, request_id: int):
    """Reject a ride share response for an owned post."""
    client_ip = request.remote_addr

    try:
        logger.info(
            f"Ride share join rejection for UUID {profile_uuid[:8]}..., request {request_id} from {client_ip}"
        )
        reject_join_request(profile_uuid, request_id)
        return jsonify({"message": "Join request rejected"}), 200

    except LookupError as e:
        logger.warning(
            f"Ride share join rejection failed: {str(e)} for UUID {profile_uuid[:8]}..., request {request_id}"
        )
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        logger.warning(f"Ride share join rejection validation failed: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.exception(f"Ride share join rejection failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/<profile_uuid>/rideshare/posts/<int:post_id>", methods=["DELETE"])
@limiter_profile.limit("30/minute")
@_rideshare_enabled_required
def cancel_rideshare(profile_uuid: str, post_id: int):
    """Cancel an owned ride share post."""
    client_ip = request.remote_addr

    try:
        logger.info(
            f"Ride share post cancel for UUID {profile_uuid[:8]}..., post {post_id} from {client_ip}"
        )
        cancel_rideshare_post(profile_uuid, post_id)
        return jsonify({"message": "Ride share post cancelled"}), 200

    except LookupError as e:
        logger.warning(
            f"Ride share post cancel failed: {str(e)} for UUID {profile_uuid[:8]}..., post {post_id}"
        )
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        logger.warning(f"Ride share post cancel validation failed: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.exception(f"Ride share post cancel failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/<profile_uuid>/rideshare/posts/<int:post_id>/complete", methods=["PUT"])
@limiter_profile.limit("30/minute")
@_rideshare_enabled_required
def complete_rideshare(profile_uuid: str, post_id: int):
    """Mark an owned ride share post as completed."""
    client_ip = request.remote_addr

    try:
        logger.info(
            f"Ride share post complete for UUID {profile_uuid[:8]}..., post {post_id} from {client_ip}"
        )
        complete_rideshare_post(profile_uuid, post_id)
        return jsonify({"message": "Ride share post marked as completed"}), 200

    except LookupError as e:
        logger.warning(
            f"Ride share post complete failed: {str(e)} for UUID {profile_uuid[:8]}..., post {post_id}"
        )
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        logger.warning(f"Ride share post complete validation failed: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.exception(f"Ride share post complete failed: {str(e)}")
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
        logger.exception(f"Shift acceptance failed: {str(e)}")
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
        rejection_reason = data.get("rejection_reason", "")
        alternative_preferences = data.get("alternative_preferences", "")

        success = decline_shift(
            profile_uuid, assignment_id, rejection_reason, alternative_preferences
        )

        if success:
            logger.info(f"Shift {assignment_id} declined by profile {profile_uuid[:8]}...")
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
        logger.exception(f"Shift decline failed: {str(e)}")
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
        logger.exception(f"News feed retrieval failed: {str(e)}")
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
        logger.exception(f"Mark news as read failed: {str(e)}")
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
        logger.exception(f"Unread count retrieval failed: {str(e)}")
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
            return (
                jsonify(
                    {
                        "message": "If this email is registered, you will receive a recovery link shortly."
                    }
                ),
                200,
            )

        for profile in profiles:
            record_profile_event(profile["profile_uuid"], "profile_link_requested")

        # Send recovery email
        try:
            send_profile_recovery_mail(email, profiles)
        except Exception as e:
            logger.exception(f"Failed to send recovery email to {email}: {str(e)}")
            # Don't expose email sending errors to user
            pass

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
        logger.exception(f"Profile recovery failed after {elapsed_time:.2f}s: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@profile_bp.route("/faqs", methods=["GET"])
@limiter_profile.limit("100/minute")
def get_faqs_public():
    """
    Get all active FAQs grouped by category (public endpoint).

    No authentication required - this is public information.
    Rate limited to prevent abuse.
    """
    client_ip = request.remote_addr

    try:
        logger.debug(f"Public FAQ request from {client_ip}")

        faqs = get_faqs_grouped_by_category()

        logger.debug(f"Retrieved {len(faqs.get('categories', []))} FAQ categories")

        return jsonify(faqs), 200

    except Exception as e:
        logger.exception(f"FAQ retrieval failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
