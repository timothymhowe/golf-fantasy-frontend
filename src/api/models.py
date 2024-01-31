from flask_sqlalchemy import SQLAlchemy
from api.utils.db_connector import db

class User(db.Model):
    """
    Represents a user in the system.
    """

    id = db.Column(db.Integer, primary_key=True)
    firebase_uid = db.Column(db.String(255), unique=True, nullable=False)
    display_name = db.Column(db.String(40), nullable=False)
    first_name = db.Column(db.String(40), nullable=False)
    last_name = db.Column(db.String(40), nullable=False)
    email = db.Column(db.String(40), unique=True, nullable=False)
    avatar_url = db.Column(db.String(512))  # new field for avatar URL

class League(db.Model):
    """
    Represents a league in the system.
    """

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    scoring_format = db.Column(db.String(100), nullable=False)
    commissioner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class LeagueMember(db.Model):
    """
    Represents a member of a league in the system.
    """

    id = db.Column(db.Integer, primary_key=True)
    league_id = db.Column(db.Integer, db.ForeignKey('league.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False, default=0)


class Pick(db.Model):
    """
    Represents a pick made by a league member for a tournament.
    """

    id = db.Column(db.Integer, primary_key=True)
    league_member_id = db.Column(db.Integer, db.ForeignKey('league_member.id'), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    player_name = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    tournament_id = db.Column(db.Integer, db.ForeignKey('tournament.id'))

class Tournament(db.Model):
    """
    Represents a golf tournament in the system.
    """

    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    tournament_name = db.Column(db.String(100), nullable=False)
    tournament_format = db.Column(db.String(100), nullable=False,default='stroke')
    year = db.Column(db.Integer, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    course_name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    state = db.Column(db.String(50), nullable=False)


class Golfer(db.Model):
    """
    Represents a golfer in the system.
    """

    id = db.Column(db.Integer, primary_key=True)
    sportcontent_api_id = db.Column(db.Integer, unique=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    photo_url = db.Column(db.String(512))
    
    
class TournamentGolfer(db.Model):
    """
    Represents a golfer participating in a tournament.
    """

    id = db.Column(db.Integer, primary_key=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey('tournament.id'), nullable=False)
    golfer_id = db.Column(db.Integer, db.ForeignKey('golfer.id'), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    is_alternate = db.Column(db.Boolean, nullable=False, default=False)
    is_injured = db.Column(db.Boolean, nullable=False, default=False)

class Role(db.Model):
    """
    Represents a role in the system.
    """

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

class ScoringRule(db.Model):
    """
    Represents a scoring rule for a golf tournament.
    """

    id = db.Column(db.Integer, primary_key=True)
    start_position = db.Column(db.Integer, nullable=False)
    end_position = db.Column(db.Integer, nullable=False)
    points = db.Column(db.Integer, nullable=False)

class UserScore(db.Model):
    """
    Represents the score of a user in a tournament.
    """

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tournament_id = db.Column(db.Integer, db.ForeignKey('tournament.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False, default=0)


class LegacyMember(db.Model):
    """
    Represents a legacy member in the system.
    """

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100))
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))

class LegacyMemberPick(db.Model):
    """
    Represents a pick made by a legacy member for a tournament.
    """

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('legacy_member.id'))
    week = db.Column(db.Integer)
    tournament_id = db.Column(db.Integer, db.ForeignKey("tournament.id"))
    golfer_name = db.Column(db.String(100))
