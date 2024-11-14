from apscheduler.schedulers.background import BackgroundScheduler
from data_aggregator.owgr.rankings_sheet import schedule_owgr_rankings_fetch
from data_aggregator.sportcontentapi.entries import schedule_entry_list_update

def schedule_all_jobs(scheduler:BackgroundScheduler):
    """
    Schedule all the jobs for data aggregation. Schedules are defined inside the functions themselves,

    Args:
        scheduler: The scheduler object used to schedule the jobs. An APScheduler BackgroundScheduler object.

    Returns:
        None
    """

    schedule_owgr_rankings_fetch(scheduler)
    schedule_entry_list_update(scheduler)
    # Add more jobs here
    