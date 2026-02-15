import logging
from .models import ActivityLog

# Console/Server logging setup
logger = logging.getLogger(__name__)

def log_action(user, action_type, target_repr, target_model="System", details="", request=None):
    """
    Universal Log Helper
    Logs user and system actions safely without interrupting main business logic.
    """
    ip = '127.0.0.1'
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            # .strip() added to remove any extra spaces
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '127.0.0.1')

    # Actor ko handle karein (Check if user object is valid and authenticated)
    actor = user if (user and hasattr(user, 'is_authenticated') and user.is_authenticated) else None

    try:
        ActivityLog.objects.create(
            actor=actor,
            action_type=action_type,
            target_model=target_model, # ✅ FIXED: Ab ye dynamic hai, hardcoded "UserManagement" nahi
            target_repr=str(target_repr), # ✅ Ensures string format
            details=details,
            ip_address=ip
        )
    except Exception as e:
        # ✅ FAIL-SAFE: Agar database log create na kar paye, toh app crash nahi hogi
        # Sirf server console par error print hoga
        logger.error(f"Failed to create ActivityLog for {action_type}: {e}")