from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from models import (
    League, ScoringRuleset, ScoringRule, Tournament, 
    Golfer, TournamentGolfer, TournamentGolferResult
)
from data_aggregator.sportcontentapi.leaderboard import get_tournament_leaderboard_clean
from utils.db_connector import db

def update_tournament_entries_and_results(tournament_id: int):
    """
    Updates tournament entries and results based on leaderboard data.
    
    Args:
        tournament_id (int): The database ID of the tournament
    
    Returns:
        bool: True if update was successful, False otherwise
    """
    try:
        tournament = Tournament.query.get(tournament_id)
        if not tournament or not tournament.sportcontent_api_id:
            print(f"Tournament {tournament_id} not found or missing API ID")
            return False

        results = get_tournament_leaderboard_clean(tournament.sportcontent_api_id)
        if not results or not isinstance(results, list):
            print(f"Invalid results format for tournament {tournament_id}")
            print(f"Results: {results}")
            return False

        year = str(datetime.now().year)

        # Mark existing entries as not most recent
        TournamentGolfer.query.filter_by(
            tournament_id=tournament_id,
            year=year
        ).update({"is_most_recent": False})

        # Process each player in the results
        for result in results:
            if not isinstance(result, dict):
                print(f"Invalid result format: {result}")
                continue
                
            player_id = result.get('player_id')
            position = result.get('position')
            status = result.get('status', 'unknown')
            
            if not player_id:
                print(f"Missing player_id in result: {result}")
                continue

            # Find or create golfer entry
            golfer = Golfer.query.filter_by(sportcontent_api_id=player_id).first()
            if not golfer:
                print(f"Golfer not found for player_id: {player_id}")
                continue

            # Update or create TournamentGolfer entry
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
            else:
                tournament_golfer.is_most_recent = True
                tournament_golfer.is_active = True

            db.session.add(tournament_golfer)
            db.session.flush()  # Get the ID for the new tournament_golfer if created

            # Create new result record
            new_result = TournamentGolferResult(
                tournament_golfer_id=tournament_golfer.id,
                result=result['position']  # This matches your current model
            )
            db.session.add(new_result)

            # Update points
            points = calculate_position_points(position, status)
            tournament_golfer.points = points

        db.session.commit()
        return True

    except Exception as e:
        print(f"Error updating tournament data: {e}")
        db.session.rollback()
        return False

def calculate_position_points(position: int, status: str) -> int:
    """
    Calculates points based on finishing position and status.
    
    Args:
        position (int): The finishing position
        status (str): Player's status (active, complete, cut, wd, dsq, etc.)

    Returns:
        int: Points earned for that position

    # TODO: Pull scoring system from database instead of hardcoding
    # Current point structure:
    # 1st:        100
    # 2nd:         75
    # 3rd:         60
    # 4th:         50
    # 5th:         40
    # 6th-10th:    30
    # 11th-20th:   25
    # 21st-30th:   20
    # 31st-40th:   15
    # 41st-50th:   10
    # 51st-DFL:     5
    # MDF:          5
    # MC/WD/DQ:     0
    # No Pick:    -10
    """
    # Check status first
    status = status.lower()
    if status in ['cut', 'wd', 'dsq','withdrawn','mc','missed cut','did not finish','disqualified']:
        return 0
    elif status == 'mdf':
        return 5
    elif status not in ['active', 'complete']:
        print(f"Unknown status: {status}")
        return 0

    # Now handle position points for active/complete players, ugh this sucks ass, pardon my french
    if position == 1:
        return 100
    elif position == 2:
        return 75
    elif position == 3:
        return 60
    elif position == 4:
        return 50
    elif position == 5:
        return 40
    elif position <= 10:
        return 30
    elif position <= 20:
        return 25
    elif position <= 30:
        return 20
    elif position <= 40:
        return 15
    elif position <= 50:
        return 10
    else:
        return 5  # 51st to DFL

def parse_tournament_results(results):
    tournament_info = results['tournament']
    leaderboard = results['leaderboard']
    
    # Extract key tournament details
    tournament_data = {
        'name': tournament_info['name'],
        'course': tournament_info['course'],
        'start_date': tournament_info['start_date'],
        'end_date': tournament_info['end_date'],
        'prize_fund': tournament_info['prize_fund'],
        'currency': tournament_info['fund_currency'],
        'status': tournament_info['live_details']['status']
    }
    
    # Process leaderboard entries
    processed_leaderboard = []
    for player in leaderboard:
        player_entry = {
            'position': player['position'],
            'name': f"{player['first_name']} {player['last_name']}",
            'country': player['country'],
            'total_score': player['strokes'],
            'to_par': player['total_to_par'],
            'prize_money': player['prize_money'],
            'rounds': [round['strokes'] for round in player['rounds']]
        }
        processed_leaderboard.append(player_entry)
    
    return {
        'tournament': tournament_data,
        'leaderboard': processed_leaderboard
    }

if __name__ == "__main__":
    from flask import Flask
    from utils.db_connector import init_db
    
    app = Flask(__name__)
    init_db(app)
    
    with app.app_context():
        test_tournament_id = 1  # Replace with actual tournament ID
        success = update_tournament_entries_and_results(test_tournament_id)
        if success:
            print("Tournament data updated successfully")
