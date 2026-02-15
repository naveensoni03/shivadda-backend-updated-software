from django.db import models
from django.conf import settings

class ActivityLog(models.Model):
    ACTION_TYPES = [
        ('CREATE', 'Created'),
        ('UPDATE', 'Updated'),
        ('DELETE', 'Deleted'),
        ('LOGIN', 'Logged In'),
        ('LOGOUT', 'Logged Out'),
    ]

    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action_type = models.CharField(max_length=10, choices=ACTION_TYPES)
    target_model = models.CharField(max_length=50)  # e.g., 'Institution', 'Student'
    target_object_id = models.CharField(max_length=50, null=True, blank=True)
    target_repr = models.CharField(max_length=255, null=True, blank=True) # e.g., "Green Valley School"
    
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.actor} {self.action_type} {self.target_repr}"