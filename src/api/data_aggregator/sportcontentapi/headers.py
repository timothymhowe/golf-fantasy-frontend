import os
sportcontentapi_key = os.getenv("SPORTCONTENTAPI_KEY")

headers = {
    "X-RapidAPI-Key": sportcontentapi_key,
    "X-RapidAPI-Host": "golf-leaderboard-data.p.rapidapi.com"
}