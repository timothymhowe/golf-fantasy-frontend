# TODO: Potentially fix these imports
from modules.tournament.functions import get_upcoming_tournament
from utils.db_connector import db
from models import TournamentGolfer, Golfer
from utils.functions.golf_id import generate_golfer_id
from sqlalchemy import and_
import requests
import json
from datetime import datetime
from os import getenv
from dotenv import load_dotenv

"""
Updates tournament field data using DataGolf API.
More accurate and timely than SportContent API.
Maintains historical records with is_most_recent flag.
"""

load_dotenv() 
DATAGOLF_KEY = getenv('DATAGOLF_KEY')  
DATAGOLF_FIELD_URL = "https://api.datagolf.com/field-updates"


def update_tournament_entries():
    upcoming_tournament = get_upcoming_tournament()
    if upcoming_tournament is None:
        print("No upcoming tournament!")
        return None

    # Query the Golfer table for all golfers and their IDs
    golfers = Golfer.query.with_entities(Golfer.id, Golfer.sportcontent_api_id).all()
    golfer_dict = {golfer.sportcontent_api_id: golfer.id for golfer in golfers}
    existing_ids = set(golfer_dict.values())
    
    try:
        # Make DataGolf API request
        response = requests.get(
            DATAGOLF_FIELD_URL,
            params={
                "tour": "pga",
                "file_format": "json",
                "key": DATAGOLF_KEY
            }
        )
        data = response.json()
        
        if not data.get("field"):
            print("No field data available")
            return None

        year = str(datetime.now().year)

        for player in data["field"]:
            dg_id = player.get("dg_id")
            full_name = player["player_name"]
            
            # Try to find golfer by DataGolf ID first
            existing_golfer = Golfer.query.filter_by(datagolf_id=dg_id).first()
            
            # Fall back to name matching if no golfer found by ID
            if not existing_golfer:
                existing_golfer = Golfer.query.filter_by(full_name=full_name).first()
            
            if not existing_golfer:
                print(f"adding golfer {full_name} to database")
                first_name, last_name = full_name.split(" ", 1)
                
                new_golfer = Golfer(
                    id=generate_golfer_id(first_name, last_name, existing_ids),
                    datagolf_id=dg_id,
                    first_name=first_name,
                    last_name=last_name,
                    full_name=full_name,
                )
                db.session.add(new_golfer)
                db.session.commit()
                existing_ids.add(new_golfer.id)
            elif not existing_golfer.datagolf_id and dg_id:
                # Update the DataGolf ID if we don't have one
                existing_golfer.datagolf_id = dg_id
                db.session.add(existing_golfer)
                db.session.commit()

        # Update tournament entries
        TournamentGolfer.query.filter(
            and_(
                TournamentGolfer.tournament_id == upcoming_tournament["id"],
                TournamentGolfer.year == year,
            )
        ).update({TournamentGolfer.is_most_recent: False})

        # Add new entries
        for player in data["field"]:
            golfer = (Golfer.query.filter_by(datagolf_id=player["dg_id"])
                     .or_(Golfer.query.filter_by(full_name=player["player_name"]))
                     .first())
            
            if golfer:
                tg = TournamentGolfer(
                    tournament_id=upcoming_tournament["id"],
                    golfer_id=golfer.id,
                    year=year,
                    is_most_recent=True,
                    is_active=True
                )
                db.session.add(tg)

        db.session.commit()
        print("Tournament entries updated.")
    except Exception as e:
        print(repr(e))
        print("Ruh Roh.")


if __name__ == "__main__":
    update_tournament_entries()
