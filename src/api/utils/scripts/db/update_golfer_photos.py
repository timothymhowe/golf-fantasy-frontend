import sys
import os

# Add the project root directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from models import Golfer
from utils.db_connector import db

def update_golfer_photos():
    """
    Updates all golfer photo URLs to point to their Google Cloud Storage headshots
    """
    try:
        print("Starting golfer photo URL update...")
        base_url = "https://storage.googleapis.com/golf-pickem.appspot.com/headshots"
        
        # Update all golfers with datagolf_ids in one query
        update_query = """
            UPDATE golfer 
            SET photo_url = CONCAT(:base_url, '/', datagolf_id, '_headshot.png')
            WHERE datagolf_id IS NOT NULL
        """
        
        result = db.session.execute(
            update_query,
            {"base_url": base_url}
        )
        
        db.session.commit()
        updated_count = result.rowcount
        print(f"Successfully updated {updated_count} golfer photos")
        
        # Verify a few random golfers
        sample_golfers = Golfer.query.filter(Golfer.datagolf_id.isnot(None)).limit(3).all()
        print("\nSample of updated golfers:")
        for golfer in sample_golfers:
            print(f"{golfer.full_name}: {golfer.photo_url}")
            
        return updated_count
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating golfer photos: {str(e)}")
        raise

if __name__ == "__main__":
    update_golfer_photos()
