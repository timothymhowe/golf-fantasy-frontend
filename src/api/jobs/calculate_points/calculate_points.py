from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json


from models import League, ScoringRuleset, ScoringRule, Tournament, Golfer, TournamentGolfer

from utils.db_connector import db 

# TODO: Flask instantiated here for testing purposes only. Remove when this module is integrated into the main app.
import flask


def get_scoring_ruleset(league_id):
    league = db.session.query(League).filter(League.id == league_id).first()
    
    if league:
        scoring_ruleset = db.session.query(ScoringRuleset).filter(ScoringRuleset.name == league.scoring_format).first()
        
        if scoring_ruleset:
            scoring_rules = db.session.query(ScoringRule).filter(ScoringRule.scoring_ruleset_id == scoring_ruleset.id).all()

            return scoring_rules

def get_tournament_golfers(tournament_id):
    tournament_golfers = db.session.query(TournamentGolfer).filter(TournamentGolfer.tournament_id == tournament_id).all()
    
    print(tournament_golfers)
    return tournament_golfers

def get_tournament_results():
    # TODO: implement this function making a call to the api, rather than reading a file.
    with open('src/api/api_samples/sportcontentapi/tournament_results.json', 'r') as f:
        tournament_results = json.load(f)
        print (tournament_results)
        
        
        

def calculate_score():
    pass
        
if __name__ == "__main__":
    get_tournament_results()
    # get_tournament_golfers(124)
