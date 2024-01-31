from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import importlib


from src.api.models import Role

app = Flask(__name__)
CONFIG_STRING = 'mysql+mysqlconnector://root:eldrick@localhost/fantasy_golf'

app.config['SQLALCHEMY_DATABASE_URI'] = CONFIG_STRING
db = SQLAlchemy(app)

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
    with app.app_context():

        create_roles(db)
        
     
        # commit the transaction
        db.session.commit()