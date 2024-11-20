import logging
from flask import Blueprint, jsonify, request
from modules.authentication.auth import require_auth
from modules.commish.functions import validate_and_use_invite_code

logger = logging.getLogger(__name__)

commish_bp = Blueprint('commish', __name__)

@commish_bp.route('/join', methods=['POST'])
@require_auth
def join_league(uid):
    """Handle league invite code submission"""
    logger.info(f"Received join request for user {uid}")
    
    try:
        data = request.get_json()
        logger.debug(f"Request data: {data}")
        
        user_id = uid
        code = data.get('code')
        
        logger.info(f"Processing invite code: {code} for user: {user_id}")

        if not code:
            logger.warning("No invite code provided")
            return jsonify({'message': 'Invite code is required'}), 400

        success, result, status_code = validate_and_use_invite_code(code, user_id)
        logger.info(f"Validation result: success={success}, status={status_code}, result={result}")
        
        if success:
            return jsonify(result), status_code
        else:
            return jsonify({'message': result}), status_code
            
    except Exception as e:
        logger.error(f"Error processing join request: {str(e)}", exc_info=True)
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500