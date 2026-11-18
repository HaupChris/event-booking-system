"""
Admin News API Blueprint
=========================

Admin-only API endpoints for news management.
Requires admin JWT authentication.
"""

import time

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from src.api.auth_guards import protect_blueprint
from src.services.news_service import (
    create_news,
    create_news_category,
    deactivate_news_category,
    delete_news,
    get_all_news,
    get_news_by_id,
    get_news_categories,
    move_news,
    update_news,
    update_news_category,
)
from src.utils.logger import get_logger
from src.utils.rate_limit import limiter

# Initialize logger
logger = get_logger(__name__)

admin_news_bp = Blueprint("admin_news", __name__)
protect_blueprint(admin_news_bp, "admin")
limiter_admin_news = limiter


@admin_news_bp.route("/news", methods=["GET"])
@limiter_admin_news.limit("200/minute")
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

        include_inactive = request.args.get("include_inactive", "false").lower() == "true"

        news_items = get_all_news(include_inactive=include_inactive)

        logger.debug(
            f"Retrieved {len(news_items)} news items (include_inactive={include_inactive})"
        )

        return jsonify({"news": news_items}), 200

    except Exception as e:
        logger.error(f"News list retrieval failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_news_bp.route("/news/categories", methods=["GET"])
@limiter_admin_news.limit("200/minute")
def get_news_categories_list():
    """Get all available news categories (admin)."""
    try:
        include_inactive = request.args.get("include_inactive", "false").lower() == "true"
        categories = get_news_categories(include_inactive=include_inactive)
        return jsonify({"categories": categories}), 200
    except Exception as e:
        logger.error(f"News category list retrieval failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_news_bp.route("/news/categories", methods=["POST"])
@limiter_admin_news.limit("60/minute")
def create_news_category_item():
    """Create a custom news category (admin)."""
    try:
        if not request.json:
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json
        category_key = str(data.get("category_key", "")).strip().lower()
        label = str(data.get("label", "")).strip()
        icon = str(data.get("icon", "")).strip().lower()

        if not category_key or not label or not icon:
            return jsonify({"error": "category_key, label and icon are required"}), 400

        category_id = create_news_category(category_key=category_key, label=label, icon=icon)
        return jsonify({"message": "Category created", "id": category_id}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"News category creation failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_news_bp.route("/news/categories/<int:category_id>", methods=["PUT"])
@limiter_admin_news.limit("60/minute")
def update_news_category_item(category_id: int):
    """Update a custom news category (admin)."""
    try:
        if not request.json:
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json
        label = data.get("label")
        icon = data.get("icon")
        is_active = data.get("is_active")

        if is_active is not None and not isinstance(is_active, bool):
            return jsonify({"error": "is_active must be a boolean"}), 400

        was_updated = update_news_category(
            category_id=category_id,
            label=str(label) if label is not None else None,
            icon=str(icon) if icon is not None else None,
            is_active=is_active,
        )
        response = (
            (jsonify({"message": "Category updated"}), 200)
            if was_updated
            else (jsonify({"error": "Category not found or no changes"}), 404)
        )
        return response
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"News category update failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_news_bp.route("/news/categories/<int:category_id>", methods=["DELETE"])
@limiter_admin_news.limit("30/minute")
def deactivate_news_category_item(category_id: int):
    """Deactivate a news category (admin)."""
    try:
        success = deactivate_news_category(category_id)
        if not success:
            return jsonify({"error": "Category not found"}), 404
        return jsonify({"message": "Category deactivated"}), 200
    except Exception as e:
        logger.error(f"News category deactivation failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_news_bp.route("/news/<int:news_id>", methods=["GET"])
@limiter_admin_news.limit("200/minute")
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
def create_news_item():
    """
    Create a new news item (admin only).

    Request body:
        {
            "title": string (required),
            "content": string (required),
            "category": string (optional),
            "author": string (optional),
            "is_active": bool (optional, default: true)
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
        title = data.get("title")
        content = data.get("content")
        category = data.get("category")
        author = data.get("author", admin_user)
        is_active = data.get("is_active")

        if is_active is not None and not isinstance(is_active, bool):
            return jsonify({"error": "is_active must be a boolean"}), 400

        # Validate required fields
        if not title or not content:
            logger.warning(f"News creation failed: missing required fields from {client_ip}")
            return jsonify({"error": "Title and content are required"}), 400

        # Create news item
        news_id = create_news(
            title=title,
            content=content,
            category=category,
            author=author,
            is_active=True if is_active is None else is_active,
        )

        elapsed_time = time.time() - start_time
        logger.info(
            f"News item {news_id} created successfully by {admin_user} in {elapsed_time:.2f}s"
        )

        return jsonify({"message": "News item created successfully", "id": news_id}), 201

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(f"News creation failed after {elapsed_time:.2f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_news_bp.route("/news/<int:news_id>", methods=["PUT"])
@limiter_admin_news.limit("60/minute")
def update_news_item(news_id: int):
    """
    Update an existing news item (admin only).

    Request body (all fields optional):
        {
            "title": string,
            "content": string,
            "category": string,
            "author": string,
            "is_active": bool
        }
    """
    start_time = time.time()
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    try:
        logger.info(
            f"News update request for item {news_id} from admin {admin_user} at {client_ip}"
        )

        # Validate request
        if not request.json:
            logger.warning(f"News update failed: missing JSON body from {client_ip}")
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json
        title = data.get("title")
        content = data.get("content")
        category = data.get("category")
        author = data.get("author")
        is_active = data.get("is_active")

        if is_active is not None and not isinstance(is_active, bool):
            return jsonify({"error": "is_active must be a boolean"}), 400

        # Update news item
        success = update_news(news_id, title, content, category, author, is_active)

        if success:
            elapsed_time = time.time() - start_time
            logger.info(
                f"News item {news_id} updated successfully by {admin_user} in {elapsed_time:.2f}s"
            )
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
        logger.info(
            f"News deletion request for item {news_id} from admin {admin_user} at {client_ip}"
        )

        permanent = request.args.get("permanent", "false").lower() == "true"

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


@admin_news_bp.route("/news/<int:news_id>/move", methods=["POST"])
@limiter_admin_news.limit("120/minute")
def move_news_item(news_id: int):
    """
    Move a news item up or down in display order.

    Request body:
        {
            "direction": "up" | "down"
        }
    """
    try:
        payload = request.json or {}
        direction = str(payload.get("direction", "")).strip().lower()
        if direction not in {"up", "down"}:
            return jsonify({"error": "direction must be 'up' or 'down'"}), 400

        was_moved = move_news(news_id, direction)
        response = (
            (jsonify({"message": "News item moved successfully"}), 200)
            if was_moved
            else (jsonify({"error": "News item not found or cannot be moved further"}), 404)
        )
        return response
    except Exception as e:
        logger.error(f"News move failed for item {news_id}: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
