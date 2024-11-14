"""
Tournament Schedule Population Script

Fetches and updates the tournament schedule from the SportContent API.
Handles both creation of new tournaments and updates to existing ones,
with special handling for major championships.
"""

import os
import requests
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from src.api.models import Tournament
from src.api.utils.db_connector import db, init_db
from flask import Flask

# Load environment variables
load_dotenv()

# Constants for tournament identification and API configuration
MAJOR_NAMES = ["US OPEN", "MASTERS", "PGA CHAMPIONSHIP", "OPEN CHAMPIONSHIP"]
TOUR_IDS = {
    "PGA": 2,
    "DPWORLD": 1,
}

def get_target_season():
    """
    Determines the appropriate golf season based on current date.
    
    Returns the year of the season that starts 7 days from now, 
    accounting for the PGA Tour's January start.

    Returns:
        int: The target season year
    """
    future_date = datetime.now() + timedelta(days=7)
    return future_date.year

# Build API URL with PGA Tour ID and target season
SCHEDULE_URL = f"https://golf-leaderboard-data.p.rapidapi.com/fixtures/{TOUR_IDS['PGA']}/{get_target_season()}"

HEADERS = {
    "X-RapidAPI-Key": os.getenv("SPORTCONTENTAPI_KEY"),
    "X-RapidAPI-Host": "golf-leaderboard-data.p.rapidapi.com"
}

def fetch_schedule_from_api():
    """
    Fetches the PGA Tour tournament schedule from SportContent API.

    Returns:
        dict: Raw API response containing tournament schedule data
        None: If API request fails

    Raises:
        RequestException: If API request fails (caught and logged)
    """
    try:
        response = requests.get(SCHEDULE_URL, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        print("API Response structure:", data.keys())  # Debug log
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching schedule from API: {e}")
        return None

def populate_tournaments():
    """
    Updates the tournament database with current PGA Tour schedule.

    Fetches tournament data from SportContent API and either creates new
    tournament records or updates existing ones. Identifies major championships
    and preserves tournament formats.
    """
    response = fetch_schedule_from_api()
    if not response:
        print("Failed to fetch schedule data")
        return
    
    data = response["results"]
    print(f"Processing {len(data)} tournaments...")

    # Start a new transaction
    try:
        for item in data:
            clean_name = item["name"].replace(".", "").upper()
            
            is_a_major = any(major_name in clean_name for major_name in MAJOR_NAMES)
            if "MASTERS" in clean_name and "AUGUSTA" not in item["course"].upper():
                is_a_major = False

            tournament_data = {
                "tournament_name": item["name"],
                "tournament_format": item["type"],
                "year": item["season"],
                "start_date": item["start_date"].split()[0],  # Remove time portion
                "time_zone": item["timezone"],
                "end_date": item["end_date"].split()[0],      # Remove time portion
                "course_name": item["course"],
                "location_raw": item["country"],
                "sportcontent_api_id": str(item["id"]),       # Convert to string
                "sportcontent_api_tour_id": str(item["tour_id"]),  # Convert to string
                "is_major": is_a_major,
            }

            # Try to find existing tournament by API ID
            existing = Tournament.query.filter_by(
                sportcontent_api_id=str(item["id"])
            ).first()

            if existing:
                print(f"Found existing tournament: {tournament_data['tournament_name']}")
                # Update fields individually
                for key, value in tournament_data.items():
                    setattr(existing, key, value)
            else:
                print(f"Creating new tournament: {tournament_data['tournament_name']}")
                new_tournament = Tournament(**tournament_data)
                db.session.add(new_tournament)

            # Commit after each tournament to avoid batch issues
            try:
                db.session.commit()
                print(f"Successfully {'updated' if existing else 'added'}: {tournament_data['tournament_name']}")
            except Exception as e:
                db.session.rollback()
                print(f"Error processing tournament {tournament_data['tournament_name']}: {str(e)}")
                continue

    except Exception as e:
        db.session.rollback()
        print(f"Fatal error in populate_tournaments: {str(e)}")
        raise

    print("Tournament population completed")

if __name__ == "__main__":
    # Initialize Flask app and database connection
    app = Flask(__name__)
    init_db(app)
    
    # Execute population within app context
    with app.app_context():
        populate_tournaments()
    print("Done populating tournaments.")
