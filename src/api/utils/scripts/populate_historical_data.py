import sys
from datetime import datetime
from flask import Flask
from models import Tournament
from utils.db_connector import db, init_db
from data_aggregator.sportcontentapi.entries import get_entry_list
from data_aggregator.sportcontentapi.leaderboard import get_tournament_leaderboard_clean
from jobs.calculate_points.calculate_points import update_tournament_entries_and_results

app = Flask(__name__)
init_db(app)

def populate_historical_data():
    """
    Populates historical tournament data for the current year.
    Gets both field and results data for each tournament.
    """
    current_year = datetime.now().year
    
    with app.app_context():
        # Get all tournaments for current year that have already finished
        tournaments = Tournament.query.filter(
            Tournament.year == current_year,
            Tournament.end_date < datetime.now().date()
        ).order_by(Tournament.start_date).all()
        
        print(f"Found {len(tournaments)} completed tournaments for {current_year}")
        
        for tournament in tournaments:
            print(f"\nProcessing tournament: {tournament.tournament_name}")
            
            # Get and process entry list
            print("Fetching entry list...")
            try:
                entries = get_entry_list(tournament.sportcontent_api_id)
                if entries and 'results' in entries:
                    print(f"Found {len(entries['results'])} entries")
                else:
                    print("No entry data found")
            except Exception as e:
                print(f"Error fetching entries: {e}")
                continue
            
            # Get and process results
            print("Fetching results...")
            try:
                success = update_tournament_entries_and_results(tournament.id)
                if success:
                    print("Successfully updated results")
                else:
                    print("Failed to update results")
            except Exception as e:
                print(f"Error updating results: {e}")
                continue
            
            print(f"Completed processing for {tournament.tournament_name}")

if __name__ == "__main__":
    populate_historical_data()