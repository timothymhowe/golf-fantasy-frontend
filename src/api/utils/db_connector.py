from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

from google.cloud.sql.connector import Connector
from google.cloud import firestore
import os



load_dotenv()

username = os.getenv('DB_USER')
password = os.getenv('DB_PASS')
database_name = os.getenv('DB_NAME')

instance_connection_prefix = os.getenv('INSTANCE_CONNECTION_PREFIX')
db2_name = os.getenv('DB2_NAME')
db2_password = os.getenv('DB2_PASS')
password=db2_password
instance_connection_name = f"{instance_connection_prefix}{db2_name}"
print('Instance Connection Name: ', instance_connection_name)

connector = Connector()

# Create a function that will be used by SQLAlchemy to create connections
def connect():
    return connector.connect(
        f"{instance_connection_name}",
        "pymysql",
        user=username,
        password=password,
        db=database_name
    )

db = SQLAlchemy()
firestore_db = firestore.Client()


def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://'

    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'creator': connect
    }
    db.init_app(app)