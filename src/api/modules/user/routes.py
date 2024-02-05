from flask import Blueprint, jsonify
from modules.authentication.auth import require_auth
from modules.user.functions import get_most_recent_pick, pick_history, submit_pick
from src.api.modules.authentication.auth import default_app


my_pick_bp = Blueprint('pick', __name__)

@my_pick_bp.route('/current', methods=['GET'])
@require_auth
def get_my_pick():
    uid = ""
    pick = get_most_recent_pick(uid)
    
    if pick is None:
        return jsonify({'error': 'No pick found'}), 404
    
     # Assuming the Pick model has a method to convert it to a dict for jsonify
    return jsonify(pick.to_dict()), 200



@my_pick_bp.route('/history', methods=['GET'])
@require_auth
def get_my_history(uid):
    pick = pick_history(uid)
    if pick is None:
        return jsonify({'error': 'No picks found'}), 404
    
    return jsonify([p.to_dict() for p in pick]), 200


@my_pick_bp.route('/submit', methods=['POST'])
@require_auth
def submit_my_pick(uid,tournament_id, golfer_id):
    pick = submit_pick(uid, tournament_id, golfer_id)
    if pick is None:
        return jsonify({'error': 'Failed to submit pick'}), 500
    
    return jsonify(pick.to_dict()), 201
    