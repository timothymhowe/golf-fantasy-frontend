from flask import Flask
from src.api.utils.db_connector import db, init_db
from src.api.models import Role

def create_roles(db):
    """
    Create predefined roles in the database.

    Args:
        db (SQLAlchemy): SQLAlchemy database object.

    Returns:
        None
    """
    member_role = Role(id=3, name="member")
    commissioner_role = Role(id=1, name="commissioner")
    admin_role = Role(id=2, name="admin")
    
    # add roles to session
    db.session.add(member_role)
    db.session.add(commissioner_role)
    db.session.add(admin_role) 
     
        

if __name__ == "__main__":
    app = Flask(__name__)
    init_db(app)
    with app.app_context():
        create_roles(db)

        
     
        # commit the transaction
        db.session.commit()