"""
Creates a test user for development purposes.
This is a temporary solution and should not be used in production.
"""

from src.api.models import User
from src.api.utils.db_connector import db, init_db
from flask import Flask

def create_test_user():
    """
    Creates a test user if it doesn't exist.
    Returns the created/existing user.
    """
    # Check if test user exists
    test_user = User.query.filter_by(email="test@example.com").first()
    if test_user:
        print("Test user already exists")
        return test_user

    # Create test user
    test_user = User(
        firebase_id="test123",  # dummy firebase ID
        display_name="Test User",
        first_name="Test",
        last_name="User",
        email="test@example.com",
        avatar_url=None
    )

    db.session.add(test_user)
    db.session.commit()
    print(f"Created test user with ID: {test_user.id}")
    return test_user

if __name__ == "__main__":
    app = Flask(__name__)
    init_db(app)
    with app.app_context():
        create_test_user() 