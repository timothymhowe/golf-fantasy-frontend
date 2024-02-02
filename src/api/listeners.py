from sqlalchemy import event
from sqlalchemy.orm import object_session
from src.api.models import Golfer
from src.api.utils.functions.golf_id import generate_golfer_id

@event.listens_for(Golfer, 'before_insert')
def receive_before_insert(mapper, connection, target):
    if not target.id:
        session = object_session(target)
        target.id = generate_golfer_id(target.first_name, target.last_name, session)