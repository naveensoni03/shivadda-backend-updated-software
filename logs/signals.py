from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from institutions.models import Institution
from .models import ActivityLog
import socket

# 🔥 आपका Custom User Model इम्पोर्ट किया गया
User = get_user_model()

def get_ip():
    try:
        return socket.gethostbyname(socket.gethostname())
    except:
        return '127.0.0.1'

# ========================================================
# 1. INSTITUTION TRACKING (आपका पुराना सुरक्षित कोड)
# ========================================================
@receiver(post_save, sender=Institution)
def log_institution_save(sender, instance, created, **kwargs):
    action = 'CREATE' if created else 'UPDATE'
    
    ActivityLog.objects.create(
        action_type=action,
        target_model='Institution',
        target_object_id=str(instance.id),
        target_repr=instance.name,
        ip_address=get_ip(),
        details=f"Plan: {instance.subscription_plan} | Principal: {instance.principal_name}",
        user_type='SYSTEM',
        place_id=getattr(instance, 'place_id', None),
        email=getattr(instance, 'email', None)
    )

@receiver(post_delete, sender=Institution)
def log_institution_delete(sender, instance, **kwargs):
    ActivityLog.objects.create(
        action_type='DELETE',
        target_model='Institution',
        target_object_id=str(instance.id),
        target_repr=instance.name,
        ip_address=get_ip(),
        details="School deleted from system",
        user_type='SYSTEM'
    )

# ========================================================
# 2. 🔥 NEW: USER TRACKING (ADD, UPDATE, DELETE ACTIVITY)
# ========================================================
@receiver(post_save, sender=User)
def log_user_save(sender, instance, created, **kwargs):
    # अगर नया बना है तो 'CREATE', अगर एडिट हुआ है तो 'UPDATE'
    action = 'CREATE' if created else 'UPDATE'
    
    # चुपचाप ActivityLog में डेटाबेस एंट्री बना देगा
    ActivityLog.objects.create(
        action_type=action,
        target_model='User',
        target_object_id=str(instance.id),
        target_repr=f"{instance.full_name or instance.email} ({instance.role})",
        ip_address=get_ip(),
        details=f"User profile was {action.lower()}d in the system. Assigned Role: {instance.role}",
        user_type='SYSTEM',
        email=instance.email,
        mobile=getattr(instance, 'phone', None)
    )

@receiver(post_delete, sender=User)
def log_user_delete(sender, instance, **kwargs):
    # जब कोई Admin यूज़र को डिलीट करेगा तो यह 'DELETE' लॉग बनाएगा
    ActivityLog.objects.create(
        action_type='DELETE',
        target_model='User',
        target_object_id=str(instance.id),
        target_repr=f"{instance.full_name or instance.email} ({instance.role})",
        ip_address=get_ip(),
        details="User permanently deleted from the system.",
        user_type='SYSTEM'
    )