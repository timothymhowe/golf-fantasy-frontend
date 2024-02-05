import json
from src.api.models import Golfer
from src.api.utils.db_connector import db, init_db
from src.api.utils.functions.golf_id import generate_golfer_id
import re

from flask import Flask

from sqlalchemy import select

app = Flask(__name__)
init_db(app)
session = db.session

def populate_golfers():
    with open ('src/api/api_samples/sportcontentapi/owgr_body.json', 'r') as f:
        data = json.load(f)
        
        print(data['results']['rankings']) 
        rankings = data['results']['rankings']   
    
    # Execute the query
    result = session.execute(select(Golfer.id))
    print(type(result.scalars()))
    existing_ids = {str(id) for id in result.scalars()} 
    print (type(existing_ids))       
    for golfer in rankings:
        api_id = golfer['player_id']
        
        player_name = golfer['player_name']
        player_name = re.sub(' -|- ', '-', player_name)
        
        
        first_name, last_name = player_name.split(' ', 1)        
        new_golfer = Golfer(id=generate_golfer_id(first_name,last_name,existing_ids), sportcontent_api_id=api_id, first_name=first_name, last_name=last_name, full_name=player_name)
        
        db.session.add(new_golfer)
        
    db.session.commit()
            
if __name__ == "__main__":
    with app.app_context():
        populate_golfers()
    print("Done populating golfers.")
    