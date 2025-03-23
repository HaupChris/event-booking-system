from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from src.services.booking_service import get_up_to_date_form_content

formcontent_bp = Blueprint("formcontent", __name__)
limiter_formcontent = Limiter(get_remote_address)


@formcontent_bp.route("/formcontent", methods=["GET"])
@limiter_formcontent.limit("200/minute")
@jwt_required()
def get_formcontent():
    data = get_up_to_date_form_content()
    return jsonify(data), 200
