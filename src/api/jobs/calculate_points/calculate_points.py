from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from models import (
    League, ScoringRuleset, ScoringRule, Tournament, 
    Golfer, TournamentGolfer, TournamentGolferResult
)
from data_aggregator.sportcontentapi.leaderboard import get_tournament_leaderboard_clean
from utils.db_connector import db, init_db
from flask import Flask
import json
import os

STATUS_MAP_PATH = os.path.join(os.path.dirname(__file__), 'status_map.json')

def load_status_map():
    """Load status mappings from JSON file, creating if doesn't exist"""
    if os.path.exists(STATUS_MAP_PATH):
        with open(STATUS_MAP_PATH, 'r') as f:
            return json.load(f)
    return {}

def save_status_map(mappings):
    """Save status mappings to JSON file"""
    with open(STATUS_MAP_PATH, 'w') as f:
        json.dump(mappings, f, indent=4)

def get_tournament_results(tournament_id: int):
    """
    Gets tournament results from SportContent API
    
    Args:
        tournament_id (int): Database ID of the tournament

    Returns:
        list: Cleaned leaderboard results or None if no data available
    """
    # Get the tournament to find its API ID
    tournament = Tournament.query.get(tournament_id)
    if not tournament:
        print(f"Tournament {tournament_id} not found in database")
        return None
        
    # Get results using the SportContent API ID
    return get_tournament_leaderboard_clean(tournament.sportcontent_api_id)

def update_tournament_entries_and_results(tournament_id: int, interactive: bool = False):
    """
    Updates tournament entries and results from the API
    
    Args:
        tournament_id (int): ID of the tournament to update
        interactive (bool): If True, prompts for unknown statuses
    """
    try:
        # Load existing status mappings at start
        status_mappings = load_status_map()
        unknown_statuses = {}  # Track new mappings for this run
        
        # Clear existing results for this tournament
        existing_results = (TournamentGolferResult.query
            .join(TournamentGolfer)
            .filter(TournamentGolfer.tournament_id == tournament_id)
            .all())
        
        for result in existing_results:
            db.session.delete(result)
        
        db.session.commit()
        print("Cleared existing results")

        # Get fresh results from API
        results = get_tournament_results(tournament_id)
        if not results:
            print("No results available")
            return False

        year = str(datetime.now().year)
        
        for result in results:
            player_id = result.get('player_id')
            position = result.get('position', '')
            raw_status = result.get('status', 'unknown').lower()
            score_to_par = result.get('total_to_par')
            
            if not player_id:
                print(f"Missing player_id in result: {result}")
                continue

            # Find golfer entry
            golfer = Golfer.query.filter_by(sportcontent_api_id=player_id).first()
            if not golfer:
                # TODO: Create new golfer entry when not found
                # 1. Extract first_name and last_name from result['player_name']
                # 2. Create new Golfer with:
                #    - sportcontent_api_id = player_id
                #    - first_name, last_name from player_name
                #    - full_name = result['player_name']
                #    - Set other fields as nullable for now
                # 3. Add and commit before continuing
                print(f"Golfer not found for player_id: {player_id}")
                continue

            # Get tournament_golfer entry
            tournament_golfer = TournamentGolfer.query.filter_by(
                tournament_id=tournament_id,
                golfer_id=golfer.id,
                year=year
            ).first()

            if not tournament_golfer:
                tournament_golfer = TournamentGolfer(
                    tournament_id=tournament_id,
                    golfer_id=golfer.id,
                    year=year,
                    is_most_recent=True,
                    is_active=True
                )
                db.session.add(tournament_golfer)
                db.session.flush()

            # Clean up the status
            clean_status = 'complete'
            if raw_status in ['cut', 'mc', 'missed cut']:
                clean_status = 'cut'
            elif raw_status in ['wd', 'withdrawn','withdrew']:
                clean_status = 'wd'
            elif raw_status in ['dq', 'disqualified','dsq']:
                clean_status = 'dq'
            elif raw_status == 'mdf':
                clean_status = 'mdf'
            elif raw_status in ['active', 'in progress']:
                clean_status = 'active'
            elif raw_status in ['complete', 'finished']:
                clean_status = 'complete'
            else:
                if raw_status in status_mappings:
                    # Use existing mapping from file
                    clean_status = status_mappings[raw_status]
                    print(f"Using existing mapping for '{raw_status}': {clean_status}")
                elif raw_status in unknown_statuses:
                    # Use mapping from current run
                    clean_status = unknown_statuses[raw_status]
                    print(f"Using new mapping for '{raw_status}': {clean_status}")
                elif interactive:
                    # Get new mapping from user
                    print(f"\nUnknown status '{raw_status}' for {golfer.full_name}")
                    print("Known statuses: complete, cut, wd, dq, mdf, active")
                    clean_status = input("Enter correct status: ").lower().strip()
                    unknown_statuses[raw_status] = clean_status
                    print(f"Added new status mapping: {raw_status} -> {clean_status}")
                else:
                    print(f"Unknown status '{raw_status}' defaulting to 'complete' for {golfer.full_name}")
                    clean_status = 'complete'

            # Create new result record
            new_result = TournamentGolferResult(
                tournament_golfer_id=tournament_golfer.id,
                result=position,
                status=clean_status,
                score_to_par=score_to_par if score_to_par is not None else None
            )
            db.session.add(new_result)

        # After processing all results, update the status map file with any new mappings
        if unknown_statuses:
            status_mappings.update(unknown_statuses)
            save_status_map(status_mappings)
            print(f"Saved {len(unknown_statuses)} new status mappings to file")

        db.session.commit()
        print("Tournament results updated successfully")
        return True

    except Exception as e:
        print(f"Error updating tournament results: {e}")
        db.session.rollback()
        return False

if __name__ == "__main__":
    app = Flask(__name__)
    init_db(app)
    
    print(os.getenv('SPORTCONTENTAPI_KEY'))
    
    with app.app_context():
        try:
            # Get all tournaments
            tournaments = Tournament.query.all()
            print(f"\nFound {len(tournaments)} tournaments")
            
            for tournament in tournaments:
                print(f"\nProcessing {tournament.tournament_name}...")
                success = update_tournament_entries_and_results(tournament.id, interactive=True)
                if success:
                    print(f"✓ Results updated successfully for {tournament.tournament_name}")
                else:
                    print(f"✗ Failed to update results for {tournament.tournament_name}")
                
                # # Optional: ask to continue after each tournament
                # if input("\nContinue to next tournament? (y/n): ").lower() != 'y':
                #     print("Stopping...")
                #     break
                    
        except Exception as e:
            print(f"An error occurred: {e}")
