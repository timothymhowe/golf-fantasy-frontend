from models import Tournament, TournamentGolfer, Golfer, Pick, User, LeagueMember
from datetime import datetime
from sqlalchemy import text
from utils.db_connector import db
import logging

from modules.user.functions import get_league_member_ids


def get_upcoming_tournament():
    try:
        # Query the database for the tournament that has the closest start date in the future
        upcoming_tournament = (
            Tournament.query.filter(Tournament.start_date > datetime.utcnow())
            .order_by(Tournament.start_date)
            .first()
        )

        if upcoming_tournament is None:
            logging.warning("No upcoming tournaments found")
            return None

        # Return the tournament's details
        return {
            "id": upcoming_tournament.id,
            "sportcontent_api_id": upcoming_tournament.sportcontent_api_id,
            "tournament_name": upcoming_tournament.tournament_name,
            "tournament_format": upcoming_tournament.tournament_format,
            "start_date": upcoming_tournament.start_date.strftime("%Y-%m-%d"),
            "start_time": upcoming_tournament.start_time.strftime("%H:%M:%S") if upcoming_tournament.start_time else None,
            "time_zone": upcoming_tournament.time_zone,
            "course_name": upcoming_tournament.course_name,
            "location_raw": upcoming_tournament.location_raw,
        }
    except Exception as e:
        logging.error(f"Error in get_upcoming_tournament: {str(e)}")
        raise


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
    """
    Retrieves golfers with roster and picks information for a specific tournament.
    """
    try:
        league_member_ids = get_league_member_ids(uid)
        if not league_member_ids:
            return None
            
        league_member_id = league_member_ids[0][0]
        
        # Updated query to use MySQL's TINYINT instead of BOOLEAN
        sql_query = text("""
            SELECT 
                g.id,
                g.full_name,
                g.first_name,
                g.last_name,
                g.photo_url,
                g.datagolf_id,
                CASE
                    WHEN p.golfer_id IS NOT NULL THEN 1
                    ELSE 0
                END AS has_been_picked,
                CASE
                    WHEN tg.tournament_id = :tournament_id THEN 1
                    ELSE 0
                END AS is_playing_in_tournament
            FROM golfer g
            LEFT OUTER JOIN pick p ON 
                g.id = p.golfer_id 
                AND p.is_most_recent = TRUE
                AND p.league_member_id = :league_member_id
            LEFT OUTER JOIN tournament_golfer tg ON 
                g.id = tg.golfer_id
                AND tg.is_most_recent = TRUE 
            ORDER BY 
                is_playing_in_tournament DESC,
                g.full_name ASC
        """)
        
        result = db.session.execute(
            sql_query,
            {
                "league_member_id": league_member_id, 
                "tournament_id": tournament_id
            }
        )
        
        golfers = [dict(x) for x in result.mappings()]
        
        return {
            "ids": {"tournament_id": tournament_id},
            "golfers": golfers
        }
        
    except Exception as e:
        print(f"Error fetching golfer data: {str(e)}")
        return None

def get_is_tournament_live():
    pass