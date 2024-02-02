import re
from unidecode import unidecode

def generate_golfer_id(first_name: str, last_name: str, existing_ids: set):
    """_summary_

    Args:
        first_name (str): _description_ golfer's first name
        last_name (str): _description_ golfer's last name
        set (set): _description_ the set of existing ids in the database

    Returns:
        _type_: _description_
    """
    
    # Remove accent marks and convert to lowercase
    first_name = unidecode(first_name).lower()
    last_name = unidecode(last_name).lower()
    
    # Remove non-alphabetic characters
    first_name = re.sub('[^a-z]', '', first_name)
    last_name = re.sub('[^a-z]', '', last_name)

    base_id = last_name[:5] + first_name[:2]
    counter = 1
    golfer_id = f"{base_id}{str(counter).zfill(2)}"
    
    while golfer_id in existing_ids:
        counter += 1
        golfer_id = f"{base_id}{str(counter).zfill(2)}"
        
    existing_ids.add(golfer_id)
    return golfer_id   