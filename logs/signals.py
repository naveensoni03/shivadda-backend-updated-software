from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from institutions.models import Institution
from .models import ActivityLog
import socket

# Helper to get IP (Simple version)
def get_ip():
    try:
        return socket.gethostbyname(socket.gethostname())
    except:
        return '127.0.0.1'

@receiver(post_save, sender=Institution)
def log_institution_save(sender, instance, created, **kwargs):
    action = 'CREATE' if created else 'UPDATE'
    # Note: 'actor' yahan direct nahi milta signals me, usually request middleware se lete hain.
    # Abhi ke liye hum actor ko 'System' ya null rakhenge, ya Frontend se bhejna padega.
    # Lekin automatic tracking ke liye ye basic structure hai.
    
    ActivityLog.objects.create(
        action_type=action,
        target_model='Institution',
        target_object_id=str(instance.id),
        target_repr=instance.name,
        ip_address=get_ip(),
        details=f"Plan: {instance.subscription_plan} | Principal: {instance.principal_name}"
    )

@receiver(post_delete, sender=Institution)
def log_institution_delete(sender, instance, **kwargs):
    ActivityLog.objects.create(
        action_type='DELETE',
        target_model='Institution',
        target_object_id=str(instance.id),
        target_repr=instance.name,
        ip_address=get_ip(),
        details="School deleted from system"
    )