from flask import Flask
from utils.db_connector import init_db
from utils.functions.golf_id import generate_golfer_id



app = Flask(__name__)
init_db(app)
