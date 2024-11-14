from flask import Blueprint
from modules.authentication.auth import require_auth

from .functions import get_leaderboard

TEMP_BOARD = {
    "status": "success",
    "data": {
        "leaderboard": [
                { "rank": 1, "name": "Scoop D. Sloop", "score": 100, "missedPicks": 2 },
                { "rank": 2, "name": "Jane", "score": 90, "missedPicks": 5 },
                { "rank": 3, "name": "Bob", "score": 80, "missedPicks": 3 },
                { "rank": 4, "name": "Alice", "score": 75, "missedPicks": 4 },
                { "rank": 5, "name": "Charlie", "score": 70, "missedPicks": 1 },
                { "rank": 6, "name": "David", "score": 65, "missedPicks": 2 },
                { "rank": 7, "name": "Eve", "score": 60, "missedPicks": 3 },
                { "rank": 8, "name": "Frank", "score": 55, "missedPicks": 4 },
                { "rank": 9, "name": "Grace", "score": 50, "missedPicks": 1 },
                { "rank": 10, "name": "Heidi", "score": 45, "missedPicks": 2 }
        ]
    },
    "message": "Retrieved leaderboard successfully."
}


league_bp = Blueprint('league', __name__)

@league_bp.route('/scoreboard')
@require_auth
def scoreboard(uid):
    
        return TEMP_BOARD