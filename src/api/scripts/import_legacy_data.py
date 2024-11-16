import pandas as pd
from flask import Flask
from utils.db_connector import db, init_db
from models import League, LegacyMember, LegacyMemberPick, Tournament, Golfer

def normalize_word(word: str) -> str:
    """Normalize a single word for comparison"""
    return word.lower().strip('.,()').replace('&', 'and')

def find_best_tournament_match(target_name: str, tournaments: list[Tournament]) -> Tournament:
    """Find tournament with most words in common"""
    target_words = set(normalize_word(word) for word in target_name.split())
    
    best_match = None
    most_matches = 0
    
    for tournament in tournaments:
        tournament_words = set(normalize_word(word) for word in tournament.tournament_name.split())
        matching_words = len(target_words.intersection(tournament_words))
        
        if matching_words > most_matches:
            most_matches = matching_words
            best_match = tournament
            
    if best_match:
        print(f"Matched '{target_name}' to '{best_match.tournament_name}' with {most_matches} matching words")
    else:
        print(f"No match found for '{target_name}'")
        
    return best_match

def find_golfer_by_name(pick_name: str) -> Golfer:
    """
    Find golfer, handling team events and matching by last name if needed.
    """
    # Handle team events (e.g., "McIlroy / Lowry")
    if '/' in pick_name:
        pick_name = pick_name.split('/')[0].strip()
    
    # Try exact match first
    golfer = Golfer.query.filter(
        Golfer.full_name.ilike(f"%{pick_name}%")
    ).first()
    
    if not golfer:
        # Try matching by last name
        last_name = pick_name.split()[-1]
        golfer = Golfer.query.filter(
            Golfer.last_name.ilike(last_name)
        ).first()
        
        if golfer:
            print(f"Matched '{pick_name}' to '{golfer.full_name}' by last name")
    
    return golfer

def import_picks_for_existing_league(csv_path: str, league_id: int = 7):
    """Import picks for existing league and members"""
    # Get existing league
    league = League.query.get(league_id)
    if not league:
        print(f"League with id {league_id} not found")
        return
    
    print(f"Importing picks for league: {league.name}")
    
    # Read the CSV file
    df = pd.read_csv(csv_path, header=[0,1])
    df.set_index(df.columns[0], inplace=True)
    df = df.drop(df.columns[0], axis=1)  # Drop "number of no picks"
    
    tournament_names = df.columns.get_level_values(1)
    print(f"Found {len(tournament_names)} tournaments in CSV")
    
    # Get all 2024 tournaments once
    tournaments = Tournament.query.filter(
        Tournament.start_date.between('2024-01-01', '2024-12-31')
    ).all()
    
    # Process each user's picks
    for user_name in df.index:
        member = LegacyMember.query.filter_by(
            league_id=league_id,
            user_name=user_name.lower().replace(' ', '_').replace("'", "")
        ).first()
        
        if not member:
            print(f"Member not found for {user_name}")
            continue
            
        print(f"\nProcessing picks for {member.display_name}")
        
        # Process each tournament pick
        for tournament_name, pick_name in zip(tournament_names, df.loc[user_name]):
            # Find tournament with word matching
            matched_tournament = find_best_tournament_match(tournament_name, tournaments)
            
            if not matched_tournament:
                print(f"Tournament not found: {tournament_name}")
                continue
                
            # Handle no picks
            if pd.isna(pick_name) or pick_name.lower() in ['no pick', 'n/a']:
                no_pick = True
                golfer_id = None
                golfer_name = None
            else:
                no_pick = False
                golfer_name = pick_name
                
                # Find golfer with enhanced matching
                golfer = find_golfer_by_name(pick_name)
                golfer_id = golfer.id if golfer else None
                
                if not golfer:
                    print(f"Golfer not found: {pick_name}")
            
            # Create pick
            pick = LegacyMemberPick(
                legacy_member_id=member.id,
                tournament_id=matched_tournament.id,
                golfer_name=golfer_name,
                golfer_id=golfer_id,
                no_pick=no_pick
            )
            db.session.add(pick)
            
        # Commit after each member's picks
        db.session.commit()
        print(f"Added picks for {member.display_name}")

if __name__ == "__main__":
    app = Flask(__name__)
    init_db(app)
    with app.app_context():
        import_picks_for_existing_league("src/api/data/legacy_imports/2024_squilliam.csv")
