import requests
from pytz import timezone

def fetch_owgr_rankings():
    first_url = "https://apiweb.owgr.com/api/owgr/rankings/getRankings?pageNumber=1&regionId=0&countryId=0&sortString=Rank+ASC"
    response = requests.get(first_url)
    
    numberOfRankings = response.json()['totalNumberOfRankings']
    second_url = f"https://apiweb.owgr.com/api/owgr/rankings/getRankings?pageSize={numberOfRankings}&pageNumber=1&regionId=0&countryId=0&sortString=Rank+ASC"
    
    response = requests.get(second_url)
    data = response.json()['rankingsList']
    return (data)

def schedule_owgr_rankings_fetch(scheduler):
    # Schedule the function to run every Monday at 8:00 AM EST
    scheduler.add_job(fetch_owgr_rankings, 'cron', day_of_week='mon', hour=8, timezone=timezone('America/New_York'))
    
    

# Call the function
if __name__=='__main__':
    fetch_owgr_rankings()