from models import (
    League, LeagueMember, User, LeagueMemberTournamentScore
)
from sqlalchemy import func
from sqlalchemy.sql import case
from utils.db_connector import db

def calculate_leaderboard(leagueID):
    """
    Calculates the leaderboard for a given league using tournament scores.
    Includes total points and count of missed picks (-5 point scores)
    """
    # Get all league members with their total points and missed picks in one query
    leaderboard = (db.session.query(
            User.id.label('user_id'),
            User.display_name,
            League.id.label('league_id'),
            League.name.label('league_name'),
            func.coalesce(func.sum(LeagueMemberTournamentScore.score), 0).label('total_points'),
            func.count(
                case(
                    (LeagueMemberTournamentScore.score <0, 1),
                    else_=None
                )
            ).label('missed_picks')
        )
        .join(LeagueMember, User.id == LeagueMember.user_id)
        .join(League, LeagueMember.league_id == League.id)
        .outerjoin(LeagueMemberTournamentScore, LeagueMember.id == LeagueMemberTournamentScore.league_member_id)
        .filter(League.id == leagueID)
        .group_by(User.id, User.display_name, League.id, League.name)
        .order_by(func.coalesce(func.sum(LeagueMemberTournamentScore.score), 0).desc())
        .all()
    )

    return [{
        "user_id": row.user_id,
        "username": row.display_name,
        "league_id": row.league_id,
        "league_name": row.league_name,
        "total_points": int(row.total_points),
        "missed_picks": int(row.missed_picks)
    } for row in leaderboard]
 


def get_leaderboard():
    pass