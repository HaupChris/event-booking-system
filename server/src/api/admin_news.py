"""
Admin News API Blueprint
=========================

Admin-only API endpoints for news management.
Requires admin JWT authentication.
"""

import time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from src.services.news_service import (
    get_all_news,
    get_news_by_id,
    create_news,
    update_news,
    delete_news
)
from src.utils.logger import get_logger

# Initialize logger
logger = get_logger(__name__)

admin_news_bp = Blueprint("admin_news", __name__)
limiter_admin_news = Limiter(get_remote_address)


@admin_news_bp.route("/news", methods=["GET"])
@limiter_admin_news.limit("200/minute")
@jwt_required()
def get_news_list():
    """
    Get all news items (admin only).

    Query parameters:
        include_inactive: bool - Include inactive news items (default: false)
    """
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    try:
        logger.info(f"News list request from admin {admin_user} at {client_ip}")

        include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'

        news_items = get_all_news(include_inactive=include_inactive)

        logger.debug(f"Retrieved {len(news_items)} news items (include_inactive={include_inactive})")

        return jsonify({"news": news_items}), 200

    except Exception as e:
        logger.error(f"News list retrieval failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_news_bp.route("/news/<int:news_id>", methods=["GET"])
@limiter_admin_news.limit("200/minute")
@jwt_required()
def get_news_item(news_id: int):
    """Get a specific news item by ID (admin only)."""
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    try:
        logger.debug(f"News item {news_id} request from admin {admin_user} at {client_ip}")

        news = get_news_by_id(news_id)

        if not news:
            logger.warning(f"News item {news_id} not found")
            return jsonify({"error": "News item not found"}), 404

        return jsonify(news), 200

    except Exception as e:
        logger.error(f"News item retrieval failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_news_bp.route("/news", methods=["POST"])
@limiter_admin_news.limit("60/minute")
@jwt_required()
def create_news_item():
    """
    Create a new news item (admin only).

    Request body:
        {
            "title": string (required),
            "content": string (required),
            "category": string (optional),
            "author": string (optional)
        }
    """
    start_time = time.time()
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    try:
        logger.info(f"News creation request from admin {admin_user} at {client_ip}")

        # Validate request
        if not request.json:
            logger.warning(f"News creation failed: missing JSON body from {client_ip}")
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json
        title = data.get('title')
        content = data.get('content')
        category = data.get('category')
        author = data.get('author', admin_user)

        # Validate required fields
        if not title or not content:
            logger.warning(f"News creation failed: missing required fields from {client_ip}")
            return jsonify({"error": "Title and content are required"}), 400

        # Create news item
        news_id = create_news(title, content, category, author)

        elapsed_time = time.time() - start_time
        logger.info(f"News item {news_id} created successfully by {admin_user} in {elapsed_time:.2f}s")

        return jsonify({
            "message": "News item created successfully",
            "id": news_id
        }), 201

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(f"News creation failed after {elapsed_time:.2f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_news_bp.route("/news/<int:news_id>", methods=["PUT"])
@limiter_admin_news.limit("60/minute")
@jwt_required()
def update_news_item(news_id: int):
    """
    Update an existing news item (admin only).

    Request body (all fields optional):
        {
            "title": string,
            "content": string,
            "category": string,
            "author": string
        }
    """
    start_time = time.time()
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    try:
        logger.info(f"News update request for item {news_id} from admin {admin_user} at {client_ip}")

        # Validate request
        if not request.json:
            logger.warning(f"News update failed: missing JSON body from {client_ip}")
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json
        title = data.get('title')
        content = data.get('content')
        category = data.get('category')
        author = data.get('author')

        # Update news item
        success = update_news(news_id, title, content, category, author)

        if success:
            elapsed_time = time.time() - start_time
            logger.info(f"News item {news_id} updated successfully by {admin_user} in {elapsed_time:.2f}s")
            return jsonify({"message": "News item updated successfully"}), 200
        else:
            logger.warning(f"News update failed: item {news_id} not found")
            return jsonify({"error": "News item not found"}), 404

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(f"News update failed after {elapsed_time:.2f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_news_bp.route("/news/<int:news_id>", methods=["DELETE"])
@limiter_admin_news.limit("30/minute")
@jwt_required()
def delete_news_item(news_id: int):
    """
    Delete a news item (admin only).

    Query parameters:
        permanent: bool - Permanently delete instead of soft delete (default: false)
    """
    start_time = time.time()
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    try:
        logger.info(f"News deletion request for item {news_id} from admin {admin_user} at {client_ip}")

        permanent = request.args.get('permanent', 'false').lower() == 'true'

        # Delete news item
        success = delete_news(news_id, soft_delete=not permanent)

        if success:
            elapsed_time = time.time() - start_time
            delete_type = "permanently deleted" if permanent else "deactivated"
            logger.info(f"News item {news_id} {delete_type} by {admin_user} in {elapsed_time:.2f}s")
            return jsonify({"message": f"News item {delete_type} successfully"}), 200
        else:
            logger.warning(f"News deletion failed: item {news_id} not found")
            return jsonify({"error": "News item not found"}), 404

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(f"News deletion failed after {elapsed_time:.2f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
