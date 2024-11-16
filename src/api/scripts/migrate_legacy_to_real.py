from flask import Flask
from utils.db_connector import db, init_db
from models import League, LegacyMember, LegacyMemberPick, LeagueMember, Pick, User

def get_role_id(first_name: str, last_name: str) -> int:
    """Determine role ID based on user name"""
    # for now, all legacy members are just members. 
    return 3  # Member

def migrate_legacy_to_real(legacy_league_id: int = 7):
    """
    Migrate legacy members and their picks to real league members and picks.
    Creates Users without Firebase auth for historical data.
    """
    # Get legacy league
    legacy_league = League.query.get(legacy_league_id)
    if not legacy_league:
        print(f"Legacy league {legacy_league_id} not found")
        return

    print(f"Migrating data from legacy league: {legacy_league.name}")
    
    # Get all legacy members
    legacy_members = LegacyMember.query.filter_by(league_id=legacy_league_id).all()
    print(f"Found {len(legacy_members)} legacy members")

    for legacy_member in legacy_members:
        # Create or get User
        user = User.query.filter_by(
            first_name=legacy_member.first_name,
            last_name=legacy_member.last_name
        ).first()
        
        if not user:
            print(f"Creating new user for {legacy_member.display_name}")
            user = User(
                firebase_id=f"LEGACY_{legacy_member.id}",
                display_name=legacy_member.display_name,
                first_name=legacy_member.first_name,
                last_name=legacy_member.last_name,
                email=f"legacy_{legacy_member.id}@historical.com"
            )
            db.session.add(user)
            db.session.flush()
            print(f"Created user with ID: {user.id}")

        # Get appropriate role ID
        role_id = get_role_id(legacy_member.first_name, legacy_member.last_name)

        # Check if LeagueMember already exists
        league_member = LeagueMember.query.filter_by(
            league_id=legacy_league.id,
            user_id=user.id
        ).first()

        if not league_member:
            league_member = LeagueMember(
                league_id=legacy_league.id,
                user_id=user.id,
                role_id=role_id
            )
            db.session.add(league_member)
            db.session.flush()
            print(f"Created league member for {user.display_name} with role {role_id}")

        # Get all picks for this legacy member
        legacy_picks = LegacyMemberPick.query.filter_by(
            legacy_member_id=legacy_member.id
        ).all()

        print(f"Migrating {len(legacy_picks)} picks for {legacy_member.display_name}")

        # Create real picks
        # TODO: undo the hardcoded year here, it should be dynamic based on information in the file, but this is a start
        picks_created = 0
        for legacy_pick in legacy_picks:
            if not legacy_pick.no_pick and legacy_pick.golfer_id:
                # Check if pick already exists
                existing_pick = Pick.query.filter_by(
                    league_member_id=league_member.id,  # Changed from member_id to league_member_id
                    tournament_id=legacy_pick.tournament_id,
                    year="2024"
                ).first()

                if not existing_pick:
                    pick = Pick(
                        league_member_id=league_member.id,  # Changed from member_id to league_member_id
                        tournament_id=legacy_pick.tournament_id,
                        golfer_id=legacy_pick.golfer_id,
                        year="2024"
                    )
                    db.session.add(pick)
                    picks_created += 1

        db.session.commit()
        print(f"Created {picks_created} picks for {legacy_member.display_name}")

    print("\nMigration complete!")
    print("Remember: These users are historical only and cannot log in")

if __name__ == "__main__":
    app = Flask(__name__)
    init_db(app)
    with app.app_context():
        migrate_legacy_to_real()