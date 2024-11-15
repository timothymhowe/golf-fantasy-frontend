"""
Adds the development user to the test league.
"""

from flask import Flask
from src.api.models import League, User, LeagueMember, Role
from src.api.utils.db_connector import db, init_db

def add_dev_to_league():
    """
    Adds the admin user to the Development League.
    """
    app = Flask(__name__)
    init_db(app)
    
    with app.app_context():
        # Get admin user by display_name
        dev_user = User.query.filter_by(display_name="sysadmin").first()
        if not dev_user:
            print("Admin user not found!")
            return

        # Get test league
        test_league = League.query.filter_by(name="Development League").first()
        if not test_league:
            print("Test league not found!")
            return

        # Get member role
        member_role = Role.query.filter_by(name="member").first()
        if not member_role:
            print("Member role not found!")
            return

        # Check if already a member
        existing_membership = LeagueMember.query.filter_by(
            user_id=dev_user.id,
            league_id=test_league.id
        ).first()

        if existing_membership:
            print(f"User {dev_user.display_name} is already a member of {test_league.name}")
            return

        # Add to league
        new_member = LeagueMember(
            user_id=dev_user.id,
            league_id=test_league.id,
            role_id=2
        )

        db.session.add(new_member)
        db.session.commit()
        print(f"Added {dev_user.display_name} to {test_league.league_name}")

if __name__ == "__main__":
    add_dev_to_league()
 