"""
Template for creating a development user account.
Copy this file to '06_create_dev_user.py' and fill in your details.
DO NOT commit the filled-in version.
"""

from src.api.models import User
from src.api.utils.db_connector import db, init_db
from flask import Flask

def create_dev_user():
    """
    Creates a development user account if it doesn't exist.
    """
    # Check if dev user exists
    dev_user = User.query.filter_by(firebase_id="YOUR_FIREBASE_UID").first()
    if dev_user:
        print("Dev user already exists")
        return dev_user

    # Create dev user
    dev_user = User(
        firebase_id="YOUR_FIREBASE_UID",
        display_name="YOUR_DISPLAY_NAME",
        first_name="YOUR_FIRST_NAME",
        last_name="YOUR_LAST_NAME",
        email="YOUR_EMAIL",
        avatar_url="YOUR_AVATAR_URL"
    )

    db.session.add(dev_user)
    db.session.commit()
    print(f"Created dev user with ID: {dev_user.id}")
    return dev_user

if __name__ == "__main__":
    app = Flask(__name__)
    init_db(app)
    with app.app_context():
        create_dev_user() 