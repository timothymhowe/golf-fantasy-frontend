from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

import argparse
from getpass import getpass

db = SQLAlchemy()
CONFIG_STRING = 'mysql+mysqlconnector://root:eldrick@localhost/fantasy_golf'


def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = CONFIG_STRING
    db.init_app(app)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--drop', action='store_true', help='Drop all tables before running the script')
    args = parser.parse_args()

    app = Flask(__name__)
    init_db(app)

    dropTables = args.drop

    if dropTables:
        confirmation = getpass('Are you sure you want to drop all tables? (yes/no): ')
        if confirmation.lower() != 'yes':
            print('Aborting.')
            exit()

    with app.app_context():
        if dropTables:
            db.engine.execute(text("SET FOREIGN_KEY_CHECKS=0;"))
            db.drop_all()
            db.engine.execute(text("SET FOREIGN_KEY_CHECKS=1;"))

        db.create_all()
        db.session.commit()