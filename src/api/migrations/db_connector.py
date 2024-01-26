import mysql.connector

def create_connection():
    connection = mysql.connector.connect(
        host='localhost',  # replace with your server IP
        user='root',  # replace with your username
        password='password',  # replace with your password
        database='fantasy_golf'  # specify the database to use
    )
    return connection

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
CONFIG_STRING = 'mysql+mysqlconnector://root:eldrick@localhost/fantasy_golf'

def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = CONFIG_STRING
    db.init_app(app)