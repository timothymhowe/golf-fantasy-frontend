from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import importlib

app = Flask(__name__)
CONFIG_STRING = 'mysql+mysqlconnector://root:eldrick@localhost/fantasy_golf'

app.config['SQLALCHEMY_DATABASE_URI'] = CONFIG_STRING
db = SQLAlchemy(app)

if __name__ == "__main__":
    with app.app_context():
        create_tables = importlib.import_module('01_create_tables')
        Role = create_tables.Role

        # create roles
        member_role = Role(id=3, name="member")
        commissioner_role = Role(id=1, name="commissioner")
        admin_role = Role(id=2, name="admin")
        
     
        

        # add roles to session
        db.session.add(member_role)
        db.session.add(commissioner_role)
        db.session.add(admin_role)

        # commit the transaction
        db.session.commit()