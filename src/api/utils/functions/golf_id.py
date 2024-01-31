from src.api.models import Golfer

def generate_golfer_id(app, first_name, last_name):
    base_id = last_name[:5].lower() + first_name[:2].lower()
    counter = 1
    golfer_id = f"{base_id}{str(counter).zfill(2)}"

    with app.app_context():
        while Golfer.query.filter_by(id=golfer_id).first() is not None:
            counter += 1
            golfer_id = f"{base_id}{str(counter).zfill(2)}"

    return golfer_id