from flask import Flask
from api.utils.db_connector import init_db

from src.api.utils.functions.golf_id import generate_golfer_id

app = Flask(__name__)
init_db(app)

with app.app_context():
    # golfer_id = generate_golfer_id("Tiger", "Woods")
    # print(golfer_id)
    print(app.config)
    
    id = generate_golfer_id(app,"Tiger", "Woods")
    print(id)
