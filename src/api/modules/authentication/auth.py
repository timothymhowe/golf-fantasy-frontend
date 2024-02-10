from functools import wraps
from flask import request, jsonify
import firebase_admin
from firebase_admin import auth, credentials

# Initialize the Firebase Admin SDK
# TODO: Replace this with environent variable because this is bad practice
cred = credentials.Certificate('/Users/thowe/Downloads/golf-pickem-firebase-adminsdk-f2z45-a539dc64d9.json')
default_app = firebase_admin.initialize_app(cred)

def verify_id_token(id_token):
    try:
        # Verify the ID token and extract the user's UID
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        return uid
    except ValueError:
        # The ID token is invalid
        return None

def require_auth(f):
    """
    Decorator function that requires authentication for the decorated function.
    
    Args:
        f (function): The function to be decorated.
        
    Returns:
        function: The decorated function.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        # checks the validity of the auth header
        if not auth_header or ' ' not in auth_header:
            return jsonify({'error': 'Invalid authorization header'}), 401
        bearer, id_token = auth_header.split(' ')
        
        if bearer.lower() != 'bearer':
            return jsonify({'error': 'Invalid authorization header'}), 401
        uid = verify_id_token(id_token)
        
        
        if uid is None:
            return jsonify({'error': 'Invalid token'}), 401
        return f(uid, *args, **kwargs)
    
        # TODO: Delete this, nephew.  Debug only
        print(uid)
    return decorated