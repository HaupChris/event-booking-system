from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging

from src.services.booking_service import get_up_to_date_form_content

formcontent_bp = Blueprint("formcontent", __name__)
limiter_formcontent = Limiter(get_remote_address)

# Create a logger specific to this module
logger = logging.getLogger(__name__)

@formcontent_bp.route("/formcontent", methods=["GET"])
@limiter_formcontent.limit("200/minute")
@jwt_required()
def get_formcontent():
    logger.debug("Formcontent endpoint accessed")
    try:
        data = get_up_to_date_form_content()
        logger.debug(f"Formcontent data generated successfully with {len(data)} items")
        return jsonify(data), 200
    except Exception as e:
        logger.error(f"Error in get_formcontent: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500