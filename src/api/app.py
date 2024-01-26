from flask import Flask
from migrations.db_connector import init_db, db

app = Flask(__name__)
init_db(app)

