import time
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from src.services.booking_service import get_up_to_date_form_content
from src.utils.logger import get_logger

formcontent_bp = Blueprint("formcontent", __name__)
limiter_formcontent = Limiter(get_remote_address)

# Get logger for this module
logger = get_logger(__name__)


@formcontent_bp.route("/formcontent", methods=["GET"])
@limiter_formcontent.limit("200/minute")
@jwt_required()
def get_formcontent():
    """Get form content with performance monitoring."""
    start_time = time.time()

    try:
        logger.info("Form content requested")

        data = get_up_to_date_form_content()
        item_count = len(data.get('work_shifts', [])) if isinstance(data, dict) else 0

        duration = time.time() - start_time
        logger.info(f"Form content generated successfully with {item_count} work shifts in {duration:.3f}s")

        if duration > 1.0:  # Log slow form content generation
            logger.warning(f"Slow form content generation: {duration:.3f}s")

        return jsonify(data), 200

    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Error generating form content after {duration:.3f}s: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to generate form content"}), 500