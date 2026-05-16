"""
Admin FAQ API Blueprint
=======================

Admin-only API endpoints for FAQ and FAQ category management.
Requires admin JWT authentication.
"""

import time

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from src.services.faq_service import (
    create_faq,
    create_faq_category,
    delete_faq,
    delete_faq_category,
    get_all_faq_categories,
    get_all_faqs,
    get_faq_by_id,
    get_faq_category_by_id,
    update_faq,
    update_faq_category,
)
from src.utils.logger import get_logger

# Initialize logger
logger = get_logger(__name__)

admin_faq_bp = Blueprint("admin_faq", __name__)
limiter_admin_faq = Limiter(get_remote_address)


@admin_faq_bp.route("/faqs", methods=["GET"])
@limiter_admin_faq.limit("200/minute")
@jwt_required()
def get_faqs_list():
    """
    Get all FAQ items (admin only).

    Query parameters:
        include_inactive: bool - Include inactive FAQs (default: false)
        category_id: int - Filter by category ID (optional)
    """
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    # Admin identity check
    if admin_user != "admin":
        logger.warning(f"Unauthorized FAQ list access attempt from {admin_user} at {client_ip}")
        return jsonify({"error": "Unauthorized"}), 403

    try:
        logger.info(f"FAQ list request from admin {admin_user} at {client_ip}")

        include_inactive = request.args.get("include_inactive", "false").lower() == "true"
        category_id = request.args.get("category_id")

        if category_id:
            category_id = int(category_id)

        faqs = get_all_faqs(include_inactive=include_inactive, category_id=category_id)

        logger.debug(
            f"Retrieved {len(faqs)} FAQs (include_inactive={include_inactive}, category_id={category_id})"
        )

        return jsonify({"faqs": faqs}), 200

    except Exception as e:
        logger.error(f"FAQ list retrieval failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_faq_bp.route("/faqs/<int:faq_id>", methods=["GET"])
@limiter_admin_faq.limit("200/minute")
@jwt_required()
def get_faq_item(faq_id: int):
    """Get a specific FAQ item by ID (admin only)."""
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    # Admin identity check
    if admin_user != "admin":
        logger.warning(f"Unauthorized FAQ access attempt from {admin_user} at {client_ip}")
        return jsonify({"error": "Unauthorized"}), 403

    try:
        logger.debug(f"FAQ item {faq_id} request from admin {admin_user} at {client_ip}")

        faq = get_faq_by_id(faq_id)

        if not faq:
            logger.warning(f"FAQ item {faq_id} not found")
            return jsonify({"error": "FAQ item not found"}), 404

        return jsonify(faq), 200

    except Exception as e:
        logger.error(f"FAQ item retrieval failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_faq_bp.route("/faqs", methods=["POST"])
@limiter_admin_faq.limit("60/minute")
@jwt_required()
def create_faq_item():
    """
    Create a new FAQ item (admin only).

    Request body:
        {
            "question": string (required),
            "answer": string (required),
            "category_id": int (required),
            "display_order": int (optional, default: 0)
        }
    """
    start_time = time.time()
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    # Admin identity check
    if admin_user != "admin":
        logger.warning(f"Unauthorized FAQ creation attempt from {admin_user} at {client_ip}")
        return jsonify({"error": "Unauthorized"}), 403

    try:
        logger.info(f"FAQ creation request from admin {admin_user} at {client_ip}")

        # Validate request
        if not request.json:
            logger.warning(f"FAQ creation failed: missing JSON body from {client_ip}")
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json
        question = data.get("question")
        answer = data.get("answer")
        category_id = data.get("category_id")
        display_order = data.get("display_order", 0)

        # Validate required fields
        if not question or not answer or category_id is None:
            logger.warning(f"FAQ creation failed: missing required fields from {client_ip}")
            return jsonify({"error": "Question, answer, and category_id are required"}), 400

        # Create FAQ item
        faq_id = create_faq(question, answer, category_id, display_order)

        elapsed_time = time.time() - start_time
        logger.info(
            f"FAQ item {faq_id} created successfully by {admin_user} in {elapsed_time:.2f}s"
        )

        return jsonify({"message": "FAQ item created successfully", "id": faq_id}), 201

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(f"FAQ creation failed after {elapsed_time:.2f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_faq_bp.route("/faqs/<int:faq_id>", methods=["PUT"])
@limiter_admin_faq.limit("60/minute")
@jwt_required()
def update_faq_item(faq_id: int):
    """
    Update an existing FAQ item (admin only).

    Request body (all fields optional):
        {
            "question": string,
            "answer": string,
            "category_id": int,
            "display_order": int,
            "is_active": bool
        }
    """
    start_time = time.time()
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    # Admin identity check
    if admin_user != "admin":
        logger.warning(f"Unauthorized FAQ update attempt from {admin_user} at {client_ip}")
        return jsonify({"error": "Unauthorized"}), 403

    try:
        logger.info(f"FAQ update request for item {faq_id} from admin {admin_user} at {client_ip}")

        # Validate request
        if not request.json:
            logger.warning(f"FAQ update failed: missing JSON body from {client_ip}")
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json
        question = data.get("question")
        answer = data.get("answer")
        category_id = data.get("category_id")
        display_order = data.get("display_order")
        is_active = data.get("is_active")

        if is_active is not None and not isinstance(is_active, bool):
            return jsonify({"error": "is_active must be a boolean"}), 400

        # Update FAQ item
        success = update_faq(faq_id, question, answer, category_id, display_order, is_active)

        if success:
            elapsed_time = time.time() - start_time
            logger.info(
                f"FAQ item {faq_id} updated successfully by {admin_user} in {elapsed_time:.2f}s"
            )
            return jsonify({"message": "FAQ updated successfully"}), 200
        else:
            logger.warning(f"FAQ update failed: item {faq_id} not found")
            return jsonify({"error": "FAQ item not found"}), 404

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(f"FAQ update failed after {elapsed_time:.2f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_faq_bp.route("/faqs/<int:faq_id>", methods=["DELETE"])
@limiter_admin_faq.limit("30/minute")
@jwt_required()
def delete_faq_item(faq_id: int):
    """
    Delete a FAQ item (admin only).

    Query parameters:
        permanent: bool - Permanently delete instead of soft delete (default: false)
    """
    start_time = time.time()
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    # Admin identity check
    if admin_user != "admin":
        logger.warning(f"Unauthorized FAQ deletion attempt from {admin_user} at {client_ip}")
        return jsonify({"error": "Unauthorized"}), 403

    try:
        logger.info(
            f"FAQ deletion request for item {faq_id} from admin {admin_user} at {client_ip}"
        )

        permanent = request.args.get("permanent", "false").lower() == "true"

        # Delete FAQ item
        success = delete_faq(faq_id, soft_delete=not permanent)

        if success:
            elapsed_time = time.time() - start_time
            delete_type = "permanently deleted" if permanent else "deactivated"
            logger.info(f"FAQ item {faq_id} {delete_type} by {admin_user} in {elapsed_time:.2f}s")
            return jsonify({"message": "FAQ deleted successfully"}), 200
        else:
            logger.warning(f"FAQ deletion failed: item {faq_id} not found")
            return jsonify({"error": "FAQ item not found"}), 404

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(f"FAQ deletion failed after {elapsed_time:.2f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_faq_bp.route("/faq-categories", methods=["GET"])
@limiter_admin_faq.limit("200/minute")
@jwt_required()
def get_categories_list():
    """
    Get all FAQ categories (admin only).

    Query parameters:
        include_inactive: bool - Include inactive categories (default: false)
    """
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    # Admin identity check
    if admin_user != "admin":
        logger.warning(
            f"Unauthorized category list access attempt from {admin_user} at {client_ip}"
        )
        return jsonify({"error": "Unauthorized"}), 403

    try:
        logger.info(f"FAQ category list request from admin {admin_user} at {client_ip}")

        include_inactive = request.args.get("include_inactive", "false").lower() == "true"

        categories = get_all_faq_categories(include_inactive=include_inactive)

        logger.debug(
            f"Retrieved {len(categories)} FAQ categories (include_inactive={include_inactive})"
        )

        return jsonify({"categories": categories}), 200

    except Exception as e:
        logger.error(f"FAQ category list retrieval failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_faq_bp.route("/faq-categories/<int:category_id>", methods=["GET"])
@limiter_admin_faq.limit("200/minute")
@jwt_required()
def get_category_item(category_id: int):
    """Get a specific FAQ category by ID (admin only)."""
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    # Admin identity check
    if admin_user != "admin":
        logger.warning(f"Unauthorized category access attempt from {admin_user} at {client_ip}")
        return jsonify({"error": "Unauthorized"}), 403

    try:
        logger.debug(f"FAQ category {category_id} request from admin {admin_user} at {client_ip}")

        category = get_faq_category_by_id(category_id)

        if not category:
            logger.warning(f"FAQ category {category_id} not found")
            return jsonify({"error": "Category not found"}), 404

        return jsonify(category), 200

    except Exception as e:
        logger.error(f"FAQ category retrieval failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_faq_bp.route("/faq-categories", methods=["POST"])
@limiter_admin_faq.limit("60/minute")
@jwt_required()
def create_category_item():
    """
    Create a new FAQ category (admin only).

    Request body:
        {
            "name": string (required),
            "display_order": int (optional, default: 0)
        }
    """
    start_time = time.time()
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    # Admin identity check
    if admin_user != "admin":
        logger.warning(f"Unauthorized category creation attempt from {admin_user} at {client_ip}")
        return jsonify({"error": "Unauthorized"}), 403

    try:
        logger.info(f"FAQ category creation request from admin {admin_user} at {client_ip}")

        # Validate request
        if not request.json:
            logger.warning(f"Category creation failed: missing JSON body from {client_ip}")
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json
        name = data.get("name")
        display_order = data.get("display_order", 0)

        # Validate required fields
        if not name:
            logger.warning(f"Category creation failed: missing required fields from {client_ip}")
            return jsonify({"error": "Name is required"}), 400

        # Create category
        category_id = create_faq_category(name, display_order)

        elapsed_time = time.time() - start_time
        logger.info(
            f"FAQ category {category_id} created successfully by {admin_user} in {elapsed_time:.2f}s"
        )

        return jsonify({"message": "Category created successfully", "id": category_id}), 201

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(f"Category creation failed after {elapsed_time:.2f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_faq_bp.route("/faq-categories/<int:category_id>", methods=["PUT"])
@limiter_admin_faq.limit("60/minute")
@jwt_required()
def update_category_item(category_id: int):
    """
    Update an existing FAQ category (admin only).

    Request body (all fields optional):
        {
            "name": string,
            "display_order": int,
            "is_active": bool
        }
    """
    start_time = time.time()
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    # Admin identity check
    if admin_user != "admin":
        logger.warning(f"Unauthorized category update attempt from {admin_user} at {client_ip}")
        return jsonify({"error": "Unauthorized"}), 403

    try:
        logger.info(
            f"FAQ category update request for item {category_id} from admin {admin_user} at {client_ip}"
        )

        # Validate request
        if not request.json:
            logger.warning(f"Category update failed: missing JSON body from {client_ip}")
            return jsonify({"error": "Missing JSON body"}), 400

        data = request.json
        name = data.get("name")
        display_order = data.get("display_order")
        is_active = data.get("is_active")

        if is_active is not None and not isinstance(is_active, bool):
            return jsonify({"error": "is_active must be a boolean"}), 400

        # Update category
        success = update_faq_category(category_id, name, display_order, is_active)

        if success:
            elapsed_time = time.time() - start_time
            logger.info(
                f"FAQ category {category_id} updated successfully by {admin_user} in {elapsed_time:.2f}s"
            )
            return jsonify({"message": "Category updated successfully"}), 200
        else:
            logger.warning(f"Category update failed: item {category_id} not found")
            return jsonify({"error": "Category not found"}), 404

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(f"Category update failed after {elapsed_time:.2f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@admin_faq_bp.route("/faq-categories/<int:category_id>", methods=["DELETE"])
@limiter_admin_faq.limit("30/minute")
@jwt_required()
def delete_category_item(category_id: int):
    """
    Delete a FAQ category (admin only).

    Query parameters:
        permanent: bool - Permanently delete instead of soft delete (default: false)
    """
    start_time = time.time()
    client_ip = request.remote_addr
    admin_user = get_jwt_identity()

    # Admin identity check
    if admin_user != "admin":
        logger.warning(f"Unauthorized category deletion attempt from {admin_user} at {client_ip}")
        return jsonify({"error": "Unauthorized"}), 403

    try:
        logger.info(
            f"FAQ category deletion request for item {category_id} from admin {admin_user} at {client_ip}"
        )

        permanent = request.args.get("permanent", "false").lower() == "true"

        # Delete category
        success = delete_faq_category(category_id, soft_delete=not permanent)

        if success:
            elapsed_time = time.time() - start_time
            delete_type = "permanently deleted" if permanent else "deactivated"
            logger.info(
                f"FAQ category {category_id} {delete_type} by {admin_user} in {elapsed_time:.2f}s"
            )
            return jsonify({"message": "Category deleted successfully"}), 200
        else:
            logger.warning(f"Category deletion failed: item {category_id} not found")
            return jsonify({"error": "Category not found"}), 404

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(f"Category deletion failed after {elapsed_time:.2f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
