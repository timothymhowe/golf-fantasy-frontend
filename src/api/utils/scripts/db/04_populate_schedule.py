import json
from src.api.models import Tournament
from src.api.utils.db_connector import db, init_db

from flask import Flask

major_names = ["US OPEN", "MASTERS", "PGA CHAMPIONSHIP", "OPEN CHAMPIONSHIP"]


def populate_tournaments(from_sample = True):
    # load sample data from file, representing the fixtures endpoint response from the sportcontentapi
    with open("src/api/api_samples/sportcontentapi/schedule_body.json", "r") as f:
        response = json.load(f)
        data = response["results"]

    for item in data:
        # create a new tournament object
        clean_name =  item["name"].replace(".", "").upper()
        
        is_a_major = any(major_name in clean_name for major_name in major_names)
        if "MASTERS" in clean_name:
            if "AUGUSTA" not in item["course"].upper():
                is_a_major = False
        
        
        tournament = Tournament(
            tournament_name=item["name"],
            tournament_format=item["type"],
            year=item["season"],
            start_date=item["start_date"],
            time_zone=item["timezone"],
            end_date=item["end_date"],
            course_name=item["course"],
            location_raw=item["country"],
            sportcontent_api_id=item["id"],
            sportcontent_api_tour_id=item["tour_id"],
            is_major=is_a_major,
        )

        # add the new object to the session
        db.session.add(tournament)

    db.session.commit()


if __name__ == "__main__":
    app = Flask(__name__)
    init_db(app)
    with app.app_context():
        populate_tournaments(from_sample=True)
    print("Done populating tournaments.")
