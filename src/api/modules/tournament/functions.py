from models import Tournament, TournamentGolfer, Golfer, Pick, User, LeagueMember
from datetime import datetime
from sqlalchemy import text
from utils.db_connector import db

from modules.user.functions import get_league_member_ids


def get_upcoming_tournament():
    # Query the database for the tournament that has the closest start date in the future
    upcoming_tournament = (
        Tournament.query.filter(Tournament.start_date > datetime.utcnow())
        .order_by(Tournament.start_date)
        .first()
    )

    if upcoming_tournament is None:
        return None

    # Return the tournament's details
    return {
        "id": upcoming_tournament.id,
        "sportcontent_api_id": upcoming_tournament.sportcontent_api_id,
        "tournament_name": upcoming_tournament.tournament_name,
        "tournament_format": upcoming_tournament.tournament_format,
        "start_date": upcoming_tournament.start_date.strftime("%Y-%m-%d"),
        "start_time": upcoming_tournament.start_time.strftime("%H:%M:%S"),
        "time_zone": upcoming_tournament.time_zone,
        "course_name": upcoming_tournament.course_name,
        "location_raw": upcoming_tournament.location_raw,
    }


def get_upcoming_roster():
    """
    Retrieves the upcoming roster for a tournament.

    Returns:
        dict: A dictionary containing the tournament ID, tournament name, start date, and roster.
    """

    upcoming_tournament = get_upcoming_tournament()
    tournament_id = upcoming_tournament["id"]
    # upcoming_roster = TournamentGolfer.query.filter_by(tournament_id=tournament_id,is_most_recent=True).all()

    upcoming_roster_with_owgr = (
        TournamentGolfer.query.join(Golfer, TournamentGolfer.golfer_id == Golfer.id)
        .filter(
            TournamentGolfer.tournament_id == tournament_id,
            TournamentGolfer.is_most_recent == True,
        )
        .with_entities(TournamentGolfer.id, Golfer.full_name)
        .all()
    )

    final_roster = [str(tg) for tg in upcoming_roster_with_owgr]

    return {
        "tournament_id": upcoming_tournament["id"],
        "tournament_name": upcoming_tournament["tournament_name"],
        "tournament_start_date": upcoming_tournament["start_date"],
        "tournament_roster": final_roster,
    }


def populate_drop_down(uid):
    upcoming_tournament = get_upcoming_tournament()
    tournament_id = upcoming_tournament["id"]
    upcoming_roster = TournamentGolfer.query.filter_by(
        tournament_id=tournament_id, is_most_recent=True
    ).all()
    
    
    return upcoming_roster


# TODO: Ger rid of shortcut for first league_member_id
        # TODO: Implement lazy loading for the golfers not on the upcoming roster
def get_golfers_with_roster_and_picks(tournament_id: int, uid: str):
    """Retrieve golfers with roster and picks information for a specific tournament.

    Args:
        tournament_id (int): The ID of the tournament.
        uid (str): The user ID.

    Returns:
        dict: A dictionary containing the tournament ID and a list of golfers with their information.
    """

    league_member_ids = get_league_member_ids(uid)
    league_member_id = league_member_ids[0][0]

    # TODO: Refactor this as an SQLAlchemy process rather than raw sql
    sql_query = text(
        """SELECT golfer.id,
    golfer.full_name,
    golfer.first_name,
    golfer.last_name,
    golfer.photo_url,
    CASE
        WHEN pick.golfer_id IS NOT NULL THEN TRUE
        ELSE FALSE
    END AS has_been_picked,
    CASE
        WHEN tournament_golfer.tournament_id = :tournament_id THEN TRUE
        ELSE FALSE
    END AS is_playing_in_tournament
FROM golfer
    LEFT OUTER JOIN pick ON golfer.id = pick.golfer_id AND pick.is_most_recent = TRUE
    AND pick.league_member_id = :league_member_id
    LEFT OUTER JOIN tournament_golfer ON golfer.id = tournament_golfer.golfer_id
    AND tournament_golfer.is_most_recent = TRUE 
    """
    )
    
    # TODO: Delete this old query once we know the new one works
#     sql_query = text(
#         """SELECT golfer.id,
#     golfer.full_name,
#     golfer.first_name,
#     golfer.last_name,
#     CASE
#         WHEN pick.golfer_id IS NOT NULL THEN TRUE
#         ELSE FALSE
#     END AS has_been_picked,
#     CASE
#         WHEN tournament_golfer.tournament_id = :tournament_id THEN TRUE
#         ELSE FALSE
#     END AS is_playing_in_tournament
# FROM golfer
#     LEFT OUTER JOIN pick ON golfer.id = pick.golfer_id AND pick.is_most_recent = TRUE
#     AND pick.league_member_id IN (
#         SELECT id
#         FROM league_member
#         WHERE user_id = :user_id
#     )
#     LEFT OUTER JOIN tournament_golfer ON golfer.id = tournament_golfer.golfer_id
#     AND tournament_golfer.is_most_recent = TRUE 
#     """
#     )

    result = db.session.execute(
        sql_query,
        {"league_member_id": league_member_id, "tournament_id": tournament_id},
    )
    print(type(result))
    print()
    ids = {"tournament_id": tournament_id}
    golfers = [dict(x) for x in result.mappings()]
    return {"ids": ids, "golfers": golfers}

def get_is_tournament_live():
    pass