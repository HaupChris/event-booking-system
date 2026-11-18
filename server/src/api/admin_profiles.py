"""
Admin Profile Management API Blueprint
========================================

Admin-only API endpoints for profile link management.
Requires admin JWT authentication.
"""

import time

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from src.api.auth_guards import protect_blueprint
from src.services.profile_service import get_profile_stats, send_profile_link_email
from src.utils.logger import get_logger
from src.utils.rate_limit import limiter

# Initialize logger
logger = get_logger(__name__)

admin_profiles_bp = Blueprint("admin_profiles", __name__)
protect_blueprint(admin_profiles_bp, "admin")
limiter_admin_profiles = limiter


@admin_profiles_bp.route("/profiles/stats", methods=["GET"])
@limiter_admin_profiles.limit("200/minute")
def get_profiles_stats():
    """
    Get profile access statistics for all users (admin only).

    Returns:
        {
            "profiles": [
                {
                    "booking_id": int,
                    "booking_type": "regular" | "artist",
                    "first_name": string,
                    "last_name": string,
                    "email": string,
                    "profile_uuid": string,
                    "last_accessed": string | null,
                    "access_count": int
                },
                ...
            ]
        }
    """
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    try:
        logger.info(f"Profile stats request from admin {admin_user} at {client_ip}")

        stats = get_profile_stats()

        logger.debug(f"Retrieved profile stats for {len(stats)} users")

        return jsonify({"profiles": stats}), 200

    except Exception as e:
        logger.exception(f"Profile stats retrieval failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@admin_profiles_bp.route("/profiles/send-link", methods=["POST"])
@limiter_admin_profiles.limit("60/minute")
def send_profile_link():
    """
    Send profile link to a user via email (admin only).

    Request body:
        {
            "profile_uuid": string (required),
            "email": string (required),
            "first_name": string (required),
            "resend": bool (optional, default: false)
        }
    """
    start_time = time.time()
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    try:
        logger.info(f"Send profile link request from admin {admin_user} at {client_ip}")

        # Validate request
        if not request.json:
            logger.warning(f"Send profile link failed: missing JSON body from {client_ip}")
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json
        profile_uuid = data.get("profile_uuid")
        email = data.get("email")
        first_name = data.get("first_name")
        resend = data.get("resend", False)

        # Validate required fields
        if not profile_uuid or not email or not first_name:
            logger.warning(f"Send profile link failed: missing required fields from {client_ip}")
            return jsonify({"error": "profile_uuid, email, and first_name are required"}), 400

        # Send email
        success = send_profile_link_email(profile_uuid, email, first_name)

        if success:
            elapsed_time = time.time() - start_time
            action = "resent" if resend else "sent"
            logger.info(f"Profile link {action} to {email} by {admin_user} in {elapsed_time:.2f}s")
            return jsonify({"message": f"Profile link {action} successfully"}), 200
        else:
            logger.error(f"Failed to send profile link to {email}")
            return jsonify({"error": "Failed to send email"}), 500

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.exception(f"Send profile link failed after {elapsed_time:.2f}s: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@admin_profiles_bp.route("/profiles/bulk-send", methods=["POST"])
@limiter_admin_profiles.limit("10/hour")
def bulk_send_profile_links():
    """
    Send profile links to multiple users via email (admin only).
    Rate limited to prevent abuse.

    Request body:
        {
            "profile_uuids": [string] (required, max 100)
        }
    """
    start_time = time.time()
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    try:
        logger.info(f"Bulk send profile links request from admin {admin_user} at {client_ip}")

        # Validate request
        if not request.json:
            logger.warning(f"Bulk send failed: missing JSON body from {client_ip}")
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json
        profile_uuids = data.get("profile_uuids", [])

        # Validate
        if not profile_uuids or not isinstance(profile_uuids, list):
            logger.warning(f"Bulk send failed: invalid profile_uuids from {client_ip}")
            return jsonify({"error": "profile_uuids must be a non-empty list"}), 400

        if len(profile_uuids) > 100:
            logger.warning(
                f"Bulk send failed: too many UUIDs ({len(profile_uuids)}) from {client_ip}"
            )
            return jsonify({"error": "Maximum 100 profile links can be sent at once"}), 400

        # Get profile stats to get email addresses
        all_stats = get_profile_stats()
        uuid_to_profile = {stat["profile_uuid"]: stat for stat in all_stats}

        # Send emails
        sent_count = 0
        failed_count = 0

        for uuid in profile_uuids:
            profile = uuid_to_profile.get(uuid)
            if not profile:
                logger.warning(f"Profile UUID {uuid} not found, skipping")
                failed_count += 1
                continue

            success = send_profile_link_email(uuid, profile["email"], profile["first_name"])

            if success:
                sent_count += 1
            else:
                failed_count += 1

        elapsed_time = time.time() - start_time
        logger.info(
            f"Bulk send completed by {admin_user} in {elapsed_time:.2f}s: {sent_count} sent, {failed_count} failed"
        )

        return (
            jsonify({"message": "Bulk send completed", "sent": sent_count, "failed": failed_count}),
            200,
        )

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.exception(f"Bulk send failed after {elapsed_time:.2f}s: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
