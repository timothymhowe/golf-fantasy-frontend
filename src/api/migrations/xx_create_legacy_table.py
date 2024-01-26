from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text


db = SQLAlchemy()
CONFIG_STRING = 'mysql+mysqlconnector://root:eldrick@localhost/fantasy_golf'


def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = CONFIG_STRING
    db.init_app(app)

class LegacyMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100))
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))

class LegacyMemberPick(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('legacy_member.id'))
    week = db.Column(db.Integer)
    tournament_id = db.Column(db.Integer)
    golfer_name = db.Column(db.String(100))
