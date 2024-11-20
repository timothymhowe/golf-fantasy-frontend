from models import LeagueInviteCode, LeagueMember, InviteCodeUsage, User
from utils.db_connector import db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def validate_and_use_invite_code(code: str, firebase_id: str):
    """
    Validates and processes a league invite code
    
    Args:
        code (str): The invite code to validate
        firebase_uid (str): Firebase UID of the user
    """
    logger.info(f"Validating invite code: {code} for Firebase user: {firebase_id}")
    
    try:
        # Convert Firebase UID to database user ID
        user = User.query.filter_by(firebase_id=firebase_id).first()
        if not user:
            logger.error(f"No database user found for Firebase UID: {firebase_id}")
            return False, "User not found in database", 404
            
        user_id = user.id
        logger.debug(f"Found database user ID: {user_id}")

        # Find and validate invite code
        invite = LeagueInviteCode.query.filter_by(code=code).first()
        logger.debug(f"Found invite code: {invite}")
        
        if not invite:
            logger.warning(f"Invalid invite code: {code}")
            return False, "Invalid invite code", 404

        # Check expiration
        if invite.expires_at and invite.expires_at < datetime.utcnow():
            logger.warning(f"Expired invite code: {code}")
            return False, "Invite code has expired", 400

        # Check max uses
        if invite.max_uses:
            usage_count = InviteCodeUsage.query.filter_by(invite_code_id=invite.id).count()
            logger.debug(f"Current usage count: {usage_count} of {invite.max_uses}")
            if usage_count >= invite.max_uses:
                return False, "Invite code has reached maximum uses", 400

        # Check if user is already in the league
        existing_member = LeagueMember.query.filter_by(
            user_id=user_id,
            league_id=invite.league_id
        ).first()
        
        if existing_member:
            logger.warning(f"User {user_id} is already a member of league {invite.league_id}")
            return False, "You are already a member of this league", 400

        try:
            # Create league membership
            new_member = LeagueMember(
                user_id=user_id,
                league_id=invite.league_id,
                role_id=invite.role_id
            )
            db.session.add(new_member)

            # Record invite code usage
            usage = InviteCodeUsage(
                invite_code_id=invite.id,
                user_id=user_id
            )
            db.session.add(usage)
            
            db.session.commit()
            logger.info(f"Successfully added user {user_id} to league {invite.league_id}")
            return True, {"league_id": invite.league_id}, 200

        except Exception as e:
            logger.error(f"Database error while processing invite: {str(e)}", exc_info=True)
            db.session.rollback()
            return False, "Failed to join league", 500

    except Exception as e:
        logger.error(f"Error validating invite code: {str(e)}", exc_info=True)
        return False, f"Internal server error: {str(e)}", 500