import sys
from datetime import datetime
from flask import Flask
from models import Tournament, TournamentGolfer, Golfer
from utils.db_connector import db, init_db
from data_aggregator.sportcontentapi.entries import get_entry_list
from data_aggregator.sportcontentapi.leaderboard import get_tournament_leaderboard_clean
from jobs.calculate_points.calculate_points import update_tournament_entries_and_results

app = Flask(__name__)
init_db(app)

def populate_single_tournament_entries(tournament_id: int):
    """
    Populates entry list data for a single tournament given its ID.
    
    Args:
        tournament_id (int): Internal database ID of the tournament
    """
    with app.app_context():
        # Get tournament to get its SportContent API ID
        tournament = Tournament.query.get(tournament_id)
        if not tournament:
            print(f"Tournament with ID {tournament_id} not found")
            return False
            
        print(f"\nProcessing entries for tournament: {tournament.tournament_name}")
        
        # Use the tournament's SportContent API ID to get entries
        print("Fetching entry list...")
        try:
            entries = get_entry_list(tournament.sportcontent_api_id)
            if not entries or 'results' not in entries:
                print("No entry data found")
                return False
                
            entry_count = len(entries['results']['entry_list'])
            print(f"Found {entry_count} entries")
            
            # Process each entry
            for entry in entries['results']['entry_list']:
                golfer_id = entry.get('player_id')
                if not golfer_id:
                    print(f"Missing player_id in entry: {entry}")
                    continue
                    
                # Check if golfer exists by sportcontent_api_id
                golfer = Golfer.query.filter_by(sportcontent_api_id=golfer_id).first()
                
                if not golfer:
                    # Fallback to name matching if sportcontent_api_id fails
                    first_name = entry.get('first_name', '').strip()
                    last_name = entry.get('last_name', '').strip()
                    
                    if first_name and last_name:
                        # Try exact name match first
                        golfer = Golfer.query.filter(
                            Golfer.first_name.ilike(first_name),
                            Golfer.last_name.ilike(last_name)
                        ).first()
                        
                        if golfer:
                            print(f"Found golfer by name match: {golfer.full_name} "
                                  f"(API ID: {golfer_id} -> DB ID: {golfer.sportcontent_api_id})")
                        else:
                            print(f"No match found for: {first_name} {last_name} (API ID: {golfer_id})")
                            continue
                    else:
                        print(f"Missing name data for player_id: {golfer_id}")
                        continue
                
                # Check if entry already exists
                existing_entry = TournamentGolfer.query.filter_by(
                    tournament_id=tournament.id,
                    golfer_id=golfer.id,
                    year=str(tournament.year)
                ).first()
                
                if not existing_entry:
                    # Create new entry
                    new_entry = TournamentGolfer(
                        tournament_id=tournament.id,
                        golfer_id=golfer.id,
                        year=str(tournament.year),
                        is_active=True,
                        is_most_recent=True
                    )
                    db.session.add(new_entry)
                    print(f"Added entry for {golfer.full_name}")
            
            db.session.commit()
            print(f"\nSuccessfully processed {entry_count} entries")
            return True
            
        except Exception as e:
            print(f"Error processing entries: {e}")
            db.session.rollback()
            return False

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

# if __name__ == "__main__":
#     populate_historical_data()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            tournament_id = int(sys.argv[1])
            print(f"Populating entries for tournament ID: {tournament_id}")
            populate_single_tournament_entries(tournament_id)
        except ValueError:
            print("Please provide a valid tournament ID number")
    else:
        print("Please provide a tournament ID as an argument")
        print("Usage: python populate_historical_data.py <tournament_id>")