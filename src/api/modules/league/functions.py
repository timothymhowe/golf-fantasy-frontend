from models import (
    Tournament,
    Pick,
    League,
    LeagueMember,
    User,
    TournamentGolfer,
    Golfer,
)
from modules.user.functions import get_league_member_ids


def calculate_leaderboard(leagueID):
    """
    Calculates the leaderboard for a given league.

    Returns:
        dict: A dictionary containing the leaderboard for the league.
    """

    # Get all the league members
    league_members = LeagueMember.query.filter_by(league_id=leagueID).all()
    leaderboard = []
    for member in league_members:
        
        # query db for data for each user, sum the results of their picks one by one
        user = User.query.filter_by(id=member.user_id).first()
        league = League.query.filter_by(id=leagueID).first()
        picks = Pick.query.filter_by(league_member_id=member.id).all()
        total_points = 0
        for pick in picks:
            tournament = Tournament.query.filter_by(id=pick.tournament_id).first()
            tournament_golfer = TournamentGolfer.query.filter_by(
                tournament_id=tournament.id, golfer_id=pick.golfer_id
            ).first()
            total_points += tournament_golfer.points
        leaderboard.append(
            {
                "user_id": user.id,
                "username": user.username,
                "league_id": league.id,
                "league_name": league.league_name,
                "total_points": total_points,
            }
        )
    leaderboard.sort(key=lambda x: x["total_points"], reverse=True)
    return leaderboard


def get_leaderboard():
    pass