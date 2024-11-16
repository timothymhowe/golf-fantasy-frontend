from flask import Flask
from utils.db_connector import db, init_db
from sqlalchemy import inspect
from models import Schedule, ScheduleTournament

app = Flask(__name__)
init_db(app)

def create_schedule_tables():
    """Check if schedule tables exist, create them if they don't"""
    with app.app_context():
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        tables_to_create = []
        if 'schedule' not in existing_tables:
            tables_to_create.append('schedule')
        if 'schedule_tournament' not in existing_tables:
            tables_to_create.append('schedule_tournament')
            
        if tables_to_create:
            print(f"Creating tables: {', '.join(tables_to_create)}")
            db.create_all()
            print("Schedule tables created successfully")
        else:
            print("Schedule tables already exist")

if __name__ == "__main__":
    create_schedule_tables()