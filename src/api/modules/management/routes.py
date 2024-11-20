from flask import Blueprint, jsonify, request
from modules.authentication.auth import require_auth
from modules.management.functions import create_user_in_db
import logging

logger = logging.getLogger(__name__)

management_bp = Blueprint('management', __name__)

@management_bp.route('/create-user', methods=['POST'])
@require_auth
def create_user_endpoint(uid):
    """System management endpoint to create a new user in the database
    
    TODO: This endpoint will be deprecated when migrating to Firebase Functions.
    """
    response, status_code = create_user_in_db(uid, request.get_json())
    return jsonify(response), status_code
