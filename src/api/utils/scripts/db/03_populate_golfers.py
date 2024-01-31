import json
from src.api.models import Golfer
from api.utils.db_connector import db


with open ('owgr_body.json', 'r') as f:
    data = json.load(f)
    
for golfer in data:
    pass
    