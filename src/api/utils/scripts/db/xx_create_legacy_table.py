from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text


db = SQLAlchemy()
CONFIG_STRING = 'mysql+mysqlconnector://root:eldrick@localhost/fantasy_golf'


def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = CONFIG_STRING
    db.init_app(app)

