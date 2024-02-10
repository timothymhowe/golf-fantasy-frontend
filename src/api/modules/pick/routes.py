from flask import Blueprint, jsonify, request
from modules.authentication.auth import require_auth
from modules.pick.functions import submit_pick, get_most_recent_pick

pick_bp = Blueprint('pick', __name__)

@pick_bp.route('/submit', methods=['POST'])
@require_auth
def submit_my_pick(uid):
    data = request.get_json()
    tournament_id = data.get('tournament_id')
    golfer_id = data.get('golfer_id')
    print("Request params")
    print("Tournament ID: ", tournament_id)
    print("Golfer ID: ", golfer_id)
    
    pick = submit_pick(uid, tournament_id, golfer_id)
    if pick is None:
        return jsonify({'error': 'Failed to submit pick'}), 500
    
    return jsonify(pick.to_dict()), 201


@pick_bp.route('/current', methods=['GET'])
@require_auth
def get_current_pick(uid):
    pick = get_most_recent_pick(uid,124)
    
    if pick is None:
        return jsonify({'error': 'No pick found'}), 404
    
     # Assuming the Pick model has a method to convert it to a dict for jsonify
    return jsonify(pick), 200