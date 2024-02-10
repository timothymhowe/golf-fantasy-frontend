from sqlalchemy import desc, select
from models import User, Pick, League, LeagueMember, db

# TODO: Deprecate this function and fully migrate to the pick module
# Query for the most recent pick for the week by a user with a given UID
def get_most_recent_pick(uid,tournament_id):
    """Get the most recent pick for a user.
        TODO: Deprecate this function and fully migrate to the pick module
    Args:
        uid (int): The user ID.

    Returns:
        Pick: The most recent pick for the user, or None if no pick is found.
    """

    user_stmt = select(User).where(User.firebase_id == uid)
    user_result = db.session.execute(user_stmt)
    user = user_result.fetchone()
    
    # If the valid user session exists, query for the most recent pick
    if user:
        pick_stmt = select(Pick).where(Pick.user_id == user.id).order_by(desc(Pick.date))
        pick_result = db.session.execute(pick_stmt)
        pick = pick_result.scalars().first()
        return pick

    return None

def pick_history(uid):
    """Get the pick history for a user.

    Args:
        uid (int): The user ID.

    Returns:
        list: A list of the user's picks.
    """
    user_stmt = select(User).where(User.firebase_id == uid)
    user_result = db.session.execute(user_stmt)
    user = user_result.fetchone()
    
    # If the valid user session exists, query for the most recent pick
    if user:
        pick_stmt = select(Pick).where(Pick.user_id == user.id).order_by(desc(Pick.date))
        pick_result = db.session.execute(pick_stmt)
        picks = pick_result.scalars().all()
        return picks

    return None

def submit_pick(uid, tournament_id, golfer_id):
    """Submit a pick for a user in a tournament.

    Args:
        uid (str): The unique identifier of the user.
        tournament_id (int): The ID of the tournament.
        golfer_id (int): The ID of the golfer.

    Returns:
        Pick: The created pick object if successful, None otherwise.
    """
    user_stmt = select(User).where(User.firebase_id == uid)
    user_result = db.session.execute(user_stmt)
    user = user_result.fetchone()
    
    if user:
        pick = Pick(user_id=user.id, tournament_id=tournament_id, golfer_id=golfer_id)
        db.session.add(pick)
        db.session.commit()
        return pick
    return None

def get_league_member_ids(uid):
    """Get the list of league member IDs for a user.

    Args:
        uid (str): The unique identifier of the user.

    Returns:
        int: The league member IDs for the user.
    """
    print("The UID: ", uid)

    user_stmt = select(User).where(User.firebase_id == uid)
    user_result = db.session.execute(user_stmt)
    user = user_result.fetchone()[0]
    if user:
        league_member_stmt = select(LeagueMember.id).where(LeagueMember.user_id == user.id)
        league_member_result = db.session.execute(league_member_stmt)
        league_member_ids = league_member_result.fetchall()
        return league_member_ids
    return None
    