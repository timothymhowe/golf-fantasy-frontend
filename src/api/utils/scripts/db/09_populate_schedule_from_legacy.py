"""
Script to populate schedule tables from legacy data CSV.

TODO:
1. Make CSV path configurable (currently hardcoded to src/api/data/legacy_imports/2024_squilliam.csv)
2. Make year configurable (currently hardcoded to 2024)
3. Make schedule name configurable (currently hardcoded to "DEFAULT")
4. Add command line arguments for these configurations
5. Consider moving CSV path to environment variable
6. Add validation for chronological order of tournaments
7. Add option to show multiple potential matches for manual selection
"""

from flask import Flask
from utils.db_connector import db, init_db
from models import Schedule, ScheduleTournament, Tournament
import pandas as pd

def normalize_word(word: str) -> str:
    return word.lower().strip('.,()').replace('&', 'and')

def find_best_tournament_match(target_name: str, tournaments: list[Tournament]) -> Tournament:
    target_words = set(normalize_word(word) for word in target_name.split())
    
    best_match = None
    most_matches = 0
    
    for tournament in tournaments:
        tournament_words = set(normalize_word(word) for word in tournament.tournament_name.split())
        matching_words = len(target_words.intersection(tournament_words))
        
        if matching_words > most_matches:
            most_matches = matching_words
            best_match = tournament
            
    return best_match

def create_default_schedule():
    """Create 2024 DEFAULT schedule from legacy data with manual confirmation"""
    # Read tournament names from CSV
    df = pd.read_csv("src/api/data/legacy_imports/2024_squilliam.csv", header=[0,1])
    tournament_names = df.columns.get_level_values(1)
    tournament_names=tournament_names[2:]
    
    # Get all 2024 tournaments
    tournaments = Tournament.query.filter(
        Tournament.start_date.between('2024-01-01', '2024-12-31')
    ).order_by(Tournament.start_date).all()
    
    # Create DEFAULT schedule
    schedule = Schedule(
        year=2024,
        schedule_name="DEFAULT"
    )
    db.session.add(schedule)
    db.session.flush()
    
    # Match tournaments and create schedule entries
    schedule_entries = []
    
    print("\nMatching tournaments...")
    print("For each match, enter:")
    print("  y - accept match")
    print("  n - skip this tournament")
    print("  q - quit without saving\n")
    
    for week_number, tournament_name in enumerate(tournament_names, 1):
        matched_tournament = find_best_tournament_match(tournament_name, tournaments)
        
        if matched_tournament:
            print(f"\nWeek {week_number}")
            print(f"Legacy name: {tournament_name}")
            print(f"Matched to: {matched_tournament.tournament_name}")
            print(f"Start date: {matched_tournament.start_date}")
            
            response = input("Accept this match? (y/n/q): ").lower()
            
            if response == 'q':
                print("Quitting without saving...")
                return
            
            if response == 'y':
                schedule_entries.append({
                    'schedule_id': schedule.id,
                    'tournament_id': matched_tournament.id,
                    'week_number': week_number
                })
                print("Match accepted!")
            else:
                print("Skipping this tournament...")
        else:
            print(f"\nWeek {week_number}: No match found for '{tournament_name}'")
            input("Press Enter to continue...")
    
    # Final confirmation
    print(f"\nReady to create schedule with {len(schedule_entries)} tournaments")
    if input("Create schedule? (y/n): ").lower() != 'y':
        print("Cancelled without saving")
        return
    
    # Create all confirmed entries
    for entry in schedule_entries:
        schedule_tournament = ScheduleTournament(**entry)
        db.session.add(schedule_tournament)
    
    db.session.commit()
    print(f"Created DEFAULT schedule with {len(schedule_entries)} tournaments")

if __name__ == "__main__":
    app = Flask(__name__)
    init_db(app)
    with app.app_context():
        create_default_schedule() 