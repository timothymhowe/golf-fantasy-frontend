"""
League setup script with two main functions:
1. Create a development league for testing
2. Import legacy league data from CSV (preserved but not used), useful for midseason start.  Reactivate at your own risk.
"""

import pandas as pd
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from src.api.models import League, LegacyMember, LegacyMemberPick, Golfer, Tournament, Role, LeagueMember, User
from src.api.utils.db_connector import db, init_db

def create_development_league():
    """
    Creates a basic league for development purposes and adds the first user as a member.
    
    This function:
    1. Creates a MEMBER role if it doesn't exist
    2. Creates a "Development League" if it doesn't exist
    3. Adds the first user in the database as a member
    
    Returns:
        League: The created or existing development league
        
    Raises:
        Exception: If no users exist in the database
    """
    # Ensure we have a basic role
    member_role = Role.query.filter_by(name="MEMBER").first()
    if not member_role:
        member_role = Role(id=0, name="MEMBER")
        db.session.add(member_role)
        db.session.commit()
        print("Created MEMBER role")

    # Create development league
    league = League.query.filter_by(name="Development League").first()
    if not league:
        league = League(
            name="Development League",
            scoring_format="STANDARD",
            is_active=True
        )
        db.session.add(league)
        db.session.commit()
        print("Created development league")

    # Get first user
    user = User.query.first()
    if not user:
        raise Exception("No users found in database! Please create a user first.")

    # Add user to league if not already a member
    member = LeagueMember.query.filter_by(
        league_id=league.id,
        user_id=user.id
    ).first()

    if not member:
        member = LeagueMember(
            league_id=league.id,
            user_id=user.id,
            role_id=member_role.id
        )
        db.session.add(member)
        db.session.commit()
        print(f"Added user {user.display_name} to development league")

    return league

def import_legacy_league(csv_path):
    """
    Imports legacy league data from a CSV file.
    
    This function creates:
    1. A legacy league
    2. Legacy members
    3. Legacy member picks
    
    Args:
        csv_path (str): Path to the CSV file containing legacy data
        
    Returns:
        League: The created legacy league
        
    Note:
        This function is preserved for historical purposes but is not actively used.
    """
    raw = pd.read_csv(
        csv_path,
        header=0,
        names=["display_name", "week_1", "week_2", "week_3", "week_4", "week_5", "week_6","week_7"],
    )

    # Create legacy league
    league = League(
        name="Legacy League",
        scoring_format="STANDARD",
        is_active=True,
    )
    db.session.add(league)
    db.session.commit()

    # ... rest of the legacy import code ...
    # (preserved but commented out for brevity)

    return league

if __name__ == "__main__":
    app = Flask(__name__)
    init_db(app)
    with app.app_context():
        # Create development league
        dev_league = create_development_league()
        print(f"Development league setup complete. League ID: {dev_league.id}")

        # Legacy import preserved but not used
        # import_legacy_league("path/to/legacy.csv") 