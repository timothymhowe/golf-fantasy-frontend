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

def process_team_event(tournament_id: int, result: dict, year: str):
    """
    Process results for team events where names are stored with slashes
    
    Args:
        tournament_id (int): Tournament ID
        result (dict): Result data from API
        year (str): Tournament year
    
    Returns:
        tuple: (tournament_golfer_id, cleaned_position, status)
    """
    # Extract last names from the slash-formatted name
    first_name = result.get('first_name', '').strip()
    if not first_name.endswith('/'):
        return None
        
    last_name = result.get('last_name', '').strip()
    team_last_names = [
        first_name.rstrip('/'),  # First player's last name
        last_name  # Second player's last name
    ]
    
    print(f"\nProcessing team entry with last names: {team_last_names}")
    
    # Find matching golfers from tournament entries
    matching_entries = (db.session.query(TournamentGolfer, Golfer)
        .join(Golfer)
        .filter(
            TournamentGolfer.tournament_id == tournament_id,
            TournamentGolfer.year == year,
            Golfer.last_name.in_(team_last_names)
        ).all())
    
    if not matching_entries:
        print(f"No matching entries found for team: {team_last_names}")
        return None
        
    # Group entries by last name
    entries_by_lastname = {}
    for tg, golfer in matching_entries:
        if golfer.last_name not in entries_by_lastname:
            entries_by_lastname[golfer.last_name] = []
        entries_by_lastname[golfer.last_name].append((tg, golfer))
    
    selected_tournament_golfers = []
    
    # Process each team member
    for last_name in team_last_names:
        matching = entries_by_lastname.get(last_name, [])
        
        if not matching:
            print(f"No entries found for last name: {last_name}")
            continue
            
        if len(matching) == 1:
            # Single match - use it
            tg, golfer = matching[0]
            selected_tournament_golfers.append(tg)
            print(f"Found unique match for {last_name}: {golfer.first_name} {golfer.last_name}")
        else:
            # Multiple matches - need user disambiguation
            print(f"\nMultiple golfers found with last name '{last_name}':")
            for i, (tg, golfer) in enumerate(matching, 1):
                print(f"{i}. {golfer.first_name} {golfer.last_name}")
            
            while True:
                try:
                    choice = int(input("Enter number of correct golfer: "))
                    if 1 <= choice <= len(matching):
                        selected_tournament_golfers.append(matching[choice-1][0])
                        print(f"Selected: {matching[choice-1][1].first_name} {matching[choice-1][1].last_name}")
                        break
                    print("Invalid selection. Please try again.")
                except ValueError:
                    print("Please enter a number.")
    
    return selected_tournament_golfers

def process_tour_championship_results(results: list) -> list:
    """
    Process TOUR Championship results to use actual scoring instead of 
    starting strokes adjusted scoring.
    
    Args:
        results (list): List of player result dictionaries
        
    Returns:
        list: Modified results with recalculated scores and positions
    """
    try:
        
        # Sort players by actual strokes
        sorted_results = sorted(results, key=lambda x: x.get('strokes', float('inf')))
        print(f"\nSorted {len(sorted_results)} TOUR Championship results by their strokes.")
        # Track position and ties
        current_position = 1
        current_strokes = None
        course_par = 71 * 4  # Par 71 * 4 rounds
        
        # Process each player
        for i, player in enumerate(sorted_results):
            strokes = player.get('strokes')
            if strokes is None:
                continue
                
            # Calculate actual score to par
            total_score = int(strokes)
            score_to_par = total_score - course_par
            player['total_to_par'] = score_to_par
            
            # Handle position and ties
            if current_strokes is None:
                current_strokes = strokes
                player['position'] = str(current_position)
            elif strokes == current_strokes:
                # Tied with previous player(s)
                player['position'] = str(current_position)
            else:
                # New position, accounting for ties
                current_position = i + 1
                current_strokes = strokes
                player['position'] = str(current_position)
        
        print(f"\nProcessed {len(sorted_results)} TOUR Championship results")
        return sorted_results
        
    except Exception as e:
        print(f"Error processing TOUR Championship results: {e}")
        return results

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
        
        # TODO: Improve TOUR Championship detection
        # Currently using hard-coded tournament ID (19) for TOUR Championship
        # Need to modify get_tournament_results() to preserve tournament metadata
        # so we can properly detect tournament type from API response
        is_tour_championship = tournament_id == 39
        if is_tour_championship:
            print("\nProcessing TOUR Championship special scoring...")
            results = process_tour_championship_results(results)
        
        for result in results:
            position = result.get('position', '')
            raw_status = result.get('status', 'unknown').lower()
            score_to_par = result.get('total_to_par')
            
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
                    clean_status = status_mappings[raw_status]
                    print(f"Using existing mapping for '{raw_status}': {clean_status}")
                elif raw_status in unknown_statuses:
                    clean_status = unknown_statuses[raw_status]
                    print(f"Using new mapping for '{raw_status}': {clean_status}")
                elif interactive:
                    print(f"\nUnknown status '{raw_status}'")
                    print("Known statuses: complete, cut, wd, dq, mdf, active")
                    clean_status = input("Enter correct status: ").lower().strip()
                    unknown_statuses[raw_status] = clean_status
                    print(f"Added new status mapping: {raw_status} -> {clean_status}")
                else:
                    print(f"Unknown status '{raw_status}' defaulting to 'complete'")
                    clean_status = 'complete'

            
            # Check for team event
            first_name = result.get('first_name', '').strip()
            if first_name.endswith('/'):
                tournament_golfers = process_team_event(tournament_id, result, year)
                if not tournament_golfers:
                    print("Failed to process team entry")
                    continue
                    
                # Create result entries for both team members
                for tournament_golfer in tournament_golfers:
                    new_result = TournamentGolferResult(
                        tournament_golfer_id=tournament_golfer.id,
                        result=position,
                        status=clean_status,
                        score_to_par=score_to_par if score_to_par is not None else None
                    )
                    db.session.add(new_result)
                continue
            
            # Not a team event - proceed with normal player_id lookup
            player_id = result.get('player_id')
            if not player_id:
                print(f"Missing player_id in result: {result}")
                continue


            # TODO: Create new golfer entry when not found
            # 1. Extract first_name and last_name from result['player_name']
            # 2. Create new Golfer with:
            #    - sportcontent_api_id = player_id
            #    - first_name, last_name from player_name
            #    - full_name = result['player_name']
            #    - Set other fields as nullable for now
            # 3. Add and commit before continuing
            # Find golfer entry
            
            golfer = Golfer.query.filter_by(sportcontent_api_id=player_id).first()
            if not golfer:
                # Fallback to name matching if sportcontent_api_id fails
                first_name = result.get('first_name', '').strip()
                last_name = result.get('last_name', '').strip()
                
                if first_name and last_name:
                    # Try exact name match first
                    golfer = Golfer.query.filter(
                        Golfer.first_name.ilike(first_name),
                        Golfer.last_name.ilike(last_name)
                    ).first()
                    
                    if golfer:
                        print(f"Found golfer by name match: {golfer.full_name} "
                              f"(API ID: {player_id} -> DB ID: {golfer.sportcontent_api_id})")
                    else:
                        print(f"No match found for: {first_name} {last_name} (API ID: {player_id})")
                        continue
                else:
                    print(f"Missing name data for player_id: {player_id}")
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
    
    with app.app_context():
        try:
            # Get all tournaments
            tournaments = Tournament.query.all()
            print(f"\nFound {len(tournaments)} tournaments")
            
            # Ask user for update preference
            print("\nWould you like to:")
            print("1. Update a specific tournament")
            print("2. Update all tournaments")
            choice = input("Enter your choice (1 or 2): ").strip()
            
            if choice == "1":
                # Show available tournaments
                print("\nAvailable tournaments:")
                for t in tournaments:
                    print(f"ID: {t.id} - {t.tournament_name}")
                
                # Get tournament ID from user
                tournament_id = input("\nEnter tournament ID to update: ").strip()
                try:
                    tournament_id = int(tournament_id)
                    tournament = Tournament.query.get(tournament_id)
                    if tournament:
                        print(f"\nProcessing {tournament.tournament_name}...")
                        success = update_tournament_entries_and_results(tournament.id, interactive=True)
                        if success:
                            print(f"✓ Results updated successfully for {tournament.tournament_name}")
                        else:
                            print(f"✗ Failed to update results for {tournament.tournament_name}")
                    else:
                        print(f"Tournament with ID {tournament_id} not found")
                except ValueError:
                    print("Invalid tournament ID. Please enter a number.")
                
            elif choice == "2":
                # Original logic for updating all tournaments
                for tournament in tournaments:
                    print(f"\nProcessing {tournament.tournament_name}...")
                    success = update_tournament_entries_and_results(tournament.id, interactive=True)
                    if success:
                        print(f"✓ Results updated successfully for {tournament.tournament_name}")
                    else:
                        print(f"✗ Failed to update results for {tournament.tournament_name}")
                    
                    if input("\nContinue to next tournament? (y/n): ").lower() != 'y':
                        print("Stopping...")
                        break
            
            else:
                print("Invalid choice. Please run the script again and enter 1 or 2.")
                    
        except Exception as e:
            print(f"An error occurred: {e}")
