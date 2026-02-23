from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from institutions.models import Institution
from .models import ActivityLog
import socket

def get_ip():
    try:
        return socket.gethostbyname(socket.gethostname())
    except:
        return '127.0.0.1'

@receiver(post_save, sender=Institution)
def log_institution_save(sender, instance, created, **kwargs):
    action = 'CREATE' if created else 'UPDATE'
    
    # ✅ Ab signals me bhi direct create karte waqt naye parameters pass kar sakte hain
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