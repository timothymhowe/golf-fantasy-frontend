import requests
from data_aggregator.sportcontentapi.headers import headers
from src.api.data_aggregator.sportcontentapi.leaderboard import get_tournament_leaderboard
from src.api.utils.scripts.private_imports import raw

url = "https://golf-leaderboard-data.p.rapidapi.com/leaderboard/"

def get_tournament_leaderboard_raw(tournament_id:int):
    """
    Retrieves the leaderboard for a specific tournament as a JSON object, with the data in raw format.

    Args:
        tournament_id (str): The ID of the tournament. This is the ID used by the SportContentAPI, which gets stored as sportcontentapi_id in the database.

    Returns:
        dict: The leaderboard data in JSON format.
    """
    
    query_url = url + f"{tournament_id}"
    response = requests.get(query_url, headers=headers)
    return response.json()

def get_tournament_leaderboard_clean(tournament_id:int):
    """
    Retrieves the leaderboard for a specific tournament as a JSON object, with the data cleaned and formatted.

    Args:
        tournament_id (str): The ID of the tournament. This is the ID used by the SportContentAPI, which gets stored as sportcontentapi_id in the database.

    Returns:
        dict: The cleaned and formatted leaderboard data in JSON format.
    """
    
    raw_data = get_tournament_leaderboard_raw(tournament_id)
    
    return raw_data['results']
    

if __name__ == "__main__":
    # TODO: for testing purposes.  Remove when done
    print(get_tournament_leaderboard_raw("640"))