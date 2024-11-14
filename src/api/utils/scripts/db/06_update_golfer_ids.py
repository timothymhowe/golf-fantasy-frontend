import sys
import os
from flask import Flask
from src.api.models import Golfer
from src.api.utils.db_connector import db, init_db
import requests
from dotenv import load_dotenv
import unicodedata

load_dotenv()


# app = Flask(__name__)
# init_db(app)

def normalize_name(name):
    """
    Normalizes a name by removing accents and special characters.
    
    Args:
        name (str): Name to normalize
        
    Returns:
        str: Normalized name
    """
    # Decompose the unicode characters and remove combining characters
    normalized = unicodedata.normalize('NFKD', name).encode('ASCII', 'ignore').decode('ASCII')
    return normalized.strip()

def get_datagolf_rankings():
    """
    Fetches the top 500 players from the DataGolf rankings API endpoint.
    
    Returns:
        dict: A dictionary mapping normalized player names to their DataGolf IDs
    """
    url = "https://feeds.datagolf.com/preds/get-dg-rankings"
    params = {
        "file_format": "json",
        "key": os.getenv('DATAGOLFAPI_KEY')
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        # Create mappings of normalized names to DG IDs
        full_name_map = {}
        first_last_map = {}
        
        if 'rankings' in data:
            for player in data['rankings']:
                if 'dg_id' in player and 'player_name' in player:
                    # Convert "Last, First" to "First Last"
                    last_first = player['player_name'].split(', ')
                    if len(last_first) == 2:
                        last_name = normalize_name(last_first[0])
                        first_name = normalize_name(last_first[1])
                        
                        # Store both full name and first/last separately
                        normalized_full = f"{first_name} {last_name}"
                        full_name_map[normalized_full] = player['dg_id']
                        first_last_map[(first_name, last_name)] = player['dg_id']
                    
        return full_name_map, first_last_map
        
    except requests.RequestException as e:
        print(f"Error fetching DataGolf rankings: {e}")
        return {}, {}

def update_golfer_datagolf_ids():
    """Updates the golfer table with DataGolf IDs"""
    
    # Get the DataGolf rankings data with normalized names
    full_name_map, first_last_map = get_datagolf_rankings()
    
    # Update golfers
    with app.app_context():
        golfers = Golfer.query.all()
        matches = 0
        total = 0
        
        for golfer in golfers:
            total += 1
            
            # Try matching on normalized full name first
            normalized_full = normalize_name(golfer.full_name)
            if normalized_full in full_name_map:
                golfer.datagolf_id = full_name_map[normalized_full]
                matches += 1
                continue
                
            # If no match, try matching on normalized first/last name combination
            normalized_first = normalize_name(golfer.first_name)
            normalized_last = normalize_name(golfer.last_name)
            if (normalized_first, normalized_last) in first_last_map:
                golfer.datagolf_id = first_last_map[(normalized_first, normalized_last)]
                matches += 1
        
        db.session.commit()
        print(f"Finished updating golfer DataGolf IDs. Matched {matches} out of {total} golfers.")

if __name__ == "__main__":
    app = Flask(__name__)
    init_db(app)
    with app.app_context():
        update_golfer_datagolf_ids()

