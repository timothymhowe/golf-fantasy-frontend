from flask import Flask
from utils.db_connector import db, init_db
from models import Pick, TournamentGolferResult, TournamentGolfer, LeagueMember, User, LeagueMemberTournamentScore

def preview_tournament_scores(tournament_id: int, league_id: int):
    """
    Preview scores for a tournament (no database writes)
    
    Args:
        tournament_id: ID of the tournament
        league_id: ID of the league
    """
    # Get all picks for this tournament in this league with user info
    picks = (db.session.query(Pick, User.display_name)
        .select_from(Pick)
        .join(LeagueMember, Pick.league_member_id == LeagueMember.id)
        .join(User, LeagueMember.user_id == User.id)
        .filter(
            Pick.tournament_id == tournament_id,
            LeagueMember.league_id == league_id
        ).all())
    
    all_scores = []
    
    for pick, display_name in picks:
        # Get result directly through tournament_golfer
        result = (db.session.query(TournamentGolferResult)
            .join(TournamentGolfer, TournamentGolferResult.tournament_golfer_id == TournamentGolfer.id)
            .filter(
                TournamentGolfer.tournament_id == tournament_id,
                TournamentGolfer.golfer_id == pick.golfer_id
            ).first())
        
        if result:
            all_scores.append({
                'member_name': display_name,
                'position': result.result,
                'score': result.points
            })
    
    # Add no-pick entries for members without picks
    members_with_picks = {pick.league_member_id for pick, _ in picks}
    no_pick_members = (db.session.query(LeagueMember, User.display_name)
        .select_from(LeagueMember)
        .join(User, LeagueMember.user_id == User.id)
        .filter(
            LeagueMember.league_id == league_id,
            ~LeagueMember.id.in_(members_with_picks)
        ).all())
    
    for member, display_name in no_pick_members:
        all_scores.append({
            'member_name': display_name,
            'position': 'NO PICK',
            'score': -5
        })
    
    # Sort and display
    all_scores.sort(key=lambda x: x['score'], reverse=True)
    print(f"\n{'Member':<20} {'Position':<10} {'Score':<5}")
    print("-" * 35)
    for score in all_scores:
        print(f"{score['member_name']:<20} {score['position']:<10} {score['score']:<5}")
        
def calculate_position_points(position: int, status: str) -> int:
    """
    Calculates points based on finishing position and status.
    
    Args:
        position (int): The finishing position
        status (str): Player's status (active, complete, cut, wd, dsq, etc.)

    Returns:
        int: Points earned for that position

    # TODO: Pull scoring system from database instead of hardcoding, deprecate this shitty mess of garbage code that doesn't make sense you awful person unworthy of love. Really claude? Your autocomplete suggested unworthy of "life"?  Wow.
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

def calculate_tournament_scores(tournament_id: int, league_id: int):
    """Calculate and save scores for a tournament"""
    print(f"\nCalculating scores for Tournament {tournament_id}, League {league_id}")
    
    # Get league member IDs for this league
    league_member_ids = db.session.query(LeagueMember.id).filter(
        LeagueMember.league_id == league_id
    ).all()
    league_member_ids = [id[0] for id in league_member_ids]
    
    # Clear existing scores using proper SQLAlchemy pattern
    deleted = db.session.query(LeagueMemberTournamentScore).filter(
        LeagueMemberTournamentScore.tournament_id == tournament_id,
        LeagueMemberTournamentScore.league_member_id.in_(league_member_ids)
    ).delete(synchronize_session=False)
    
    print(f"Cleared {deleted} existing score records")
    
    # Get all picks
    picks = (db.session.query(Pick, LeagueMember, User.display_name)
        .join(LeagueMember, Pick.league_member_id == LeagueMember.id)
        .join(User, LeagueMember.user_id == User.id)
        .filter(
            Pick.tournament_id == tournament_id,
            LeagueMember.league_id == league_id
        ).all())
    
    print(f"\nProcessing {len(picks)} picks...")
    scores_created = 0
    
    # Process picks
    for pick, league_member, display_name in picks:
        result = (db.session.query(TournamentGolferResult)
            .join(TournamentGolfer, TournamentGolferResult.tournament_golfer_id == TournamentGolfer.id)
            .filter(
                TournamentGolfer.tournament_id == tournament_id,
                TournamentGolfer.golfer_id == pick.golfer_id
            ).first())
        
        if result:
            try:
                position = int(result.result.strip('T'))
            except ValueError:
                position = 999
            
            points = calculate_position_points(position, result.status)
            
            score = LeagueMemberTournamentScore(
                league_member_id=league_member.id,
                tournament_id=tournament_id,
                tournament_golfer_result_id=result.id,
                score=points
            )
            db.session.add(score)
            scores_created += 1
            print(f"✓ {display_name}: {result.result} ({result.status}) = {points} points")
        else:
            print(f"✗ No result found for {display_name}'s pick")
    
    # Handle no-picks
    members_with_picks = {pick.league_member_id for pick, _, _ in picks}
    no_pick_members = (db.session.query(LeagueMember, User.display_name)
        .join(User, LeagueMember.user_id == User.id)
        .filter(
            LeagueMember.league_id == league_id,
            ~LeagueMember.id.in_(members_with_picks)
        ).all())
    
    print(f"\nProcessing {len(no_pick_members)} no-picks...")
    
    for member, display_name in no_pick_members:
        score = LeagueMemberTournamentScore(
            league_member_id=member.id,
            tournament_id=tournament_id,
            tournament_golfer_result_id=None,
            score=-5
        )
        db.session.add(score)
        scores_created += 1
        print(f"✓ {display_name}: NO PICK = -5 points")
    
    db.session.commit()
    print(f"\nSummary:")
    print(f"- {deleted} old scores deleted")
    print(f"- {scores_created} new scores created")
    print(f"- {len(picks)} picks processed")
    print(f"- {len(no_pick_members)} no-picks processed")
    return True

if __name__ == "__main__":
    app = Flask(__name__)
    init_db(app)
    
    with app.app_context():
        try:
            tournament_id = int(input("Enter tournament ID: "))
            league_id = int(input("Enter league ID: "))
            success = calculate_tournament_scores(tournament_id, league_id)
            if success:
                print("\nFinal standings:")
                preview_tournament_scores(tournament_id, league_id)
        except ValueError:
            print("Please enter valid numeric IDs")
        except Exception as e:
            print(f"An error occurred: {e}")
            db.session.rollback()