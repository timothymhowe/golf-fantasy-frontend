from modules.tournament.functions import get_upcoming_tournament
from utils.db_connector import db
from models import TournamentGolfer, Golfer

from utils.functions.golf_id import generate_golfer_id

from sqlalchemy import and_
import json


with open("api_samples/sportcontentapi/entries_body.json") as f:
    data = json.load(f)


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
        # print(upcoming_tournament["id"])
        # print(upcoming_tournament["sportcontent_api_id"])
        # print("Tournament Entries: ",
        #     [(x["first_name"], x["last_name"]) for x in data["results"]["entry_list"]]
        # )

        # TODO: Make this less sketchy, it's hardcoded but that string format could change potentiall.
        year = data["results"]["tournament"]["start_date"][:4]
        print(year)

        for x in data["results"]["entry_list"]:
            
            # First, eheck to make sure each golfer is already in the fantasy database, and if not, add them to it.
            new_sportcontent_api_id = x["player_id"]
            if new_sportcontent_api_id not in golfer_dict.keys():
                print(f"adding golfer {x['first_name']} {x['last_name']} to database")
                # add the unknown golfer to the database
                new_golfer = Golfer(
                    id=generate_golfer_id(x["first_name"], x["last_name"], existing_ids),
                    sportcontent_api_id=new_sportcontent_api_id,
                    first_name=x["first_name"],
                    last_name=x["last_name"],
                    full_name=f"{x['first_name']} {x['last_name']}",
                )
                db.session.add(new_golfer)
                db.session.commit()

                # get the new id from the database
                new_golfer_id = (
                    Golfer.query.with_entities(Golfer.id, Golfer.sportcontent_api_id)
                    .where(Golfer.sportcontent_api_id == new_sportcontent_api_id)
                    .first()
                )

                # update the golfer dict
                golfer_dict[new_sportcontent_api_id] = new_golfer_id
                existing_ids = set(golfer_dict.values())

        # now that we know that every golfer is in the dict, and has an entry in the database, we can update the Tournament Entry records

        # First, set is_most_recent to False for all TournamentGolfer rows for this tournament ID this year
        TournamentGolfer.query.filter(
            and_(
                TournamentGolfer.tournament_id == upcoming_tournament["id"],
                TournamentGolfer.year == year,
            )
        ).update({TournamentGolfer.is_most_recent: False})

        #  Then, add the new records
        for x in data["results"]["entry_list"]:
            converted_golfer_id = golfer_dict[x["player_id"]]

            tg = TournamentGolfer(
                tournament_id=upcoming_tournament["id"],
                golfer_id=converted_golfer_id,
                year=year,
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
