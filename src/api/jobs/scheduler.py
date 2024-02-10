from models import Tournament
from datetime import datetime
from flask import Flask
from utils.db_connector import db, init_db

from jobs.update_field.update_field import update_tournament_entries

app = Flask (__name__)
init_db(app)
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
        "start_date": upcoming_tournament.start_date.strftime('%Y-%m-%d'),
        "start_time": upcoming_tournament.start_time.strftime('%H:%M:%S'),
        "time_zone": upcoming_tournament.time_zone,
        "course_name": upcoming_tournament.course_name,
        "location_raw": upcoming_tournament.location_raw,
    }
    
    
def update_database():
    print("Updating tournament entries.")
    with app.app_context():
        update_tournament_entries()
        # next_tourney = get_upcoming_tournament()
        # print(next_tourney['sportcontent_api_id'])
