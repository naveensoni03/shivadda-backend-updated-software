from django.db import models
from django.conf import settings

class ActivityLog(models.Model):
    ACTION_TYPES = [
        ('CREATE', 'Created'),
        ('UPDATE', 'Updated'),
        ('DELETE', 'Deleted'),
        ('LOGIN', 'Logged In'),
        ('LOGOUT', 'Logged Out'),
        # ✅ Added New Action Types from Requirement
        ('INQUIRED', 'Inquired'),
        ('FAQ', 'FAQ Accessed'),
        ('SUGGESTION', 'Suggestion Given'),
        ('FEEDBACK', 'Feedback Submitted'),
        ('COMPLAIN', 'Complain Registered'),
    ]

    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action_type = models.CharField(max_length=15, choices=ACTION_TYPES)
    target_model = models.CharField(max_length=50)  # e.g., 'Institution', 'Student'
    target_object_id = models.CharField(max_length=50, null=True, blank=True)
    target_repr = models.CharField(max_length=255, null=True, blank=True) # e.g., "Green Valley School"
    
    # ✅ Group 1: User Identity & Group Details
    user_type = models.CharField(max_length=50, null=True, blank=True) # e.g., MANAGER, PROVIDER, SEEKER, GUEST
    group_id = models.CharField(max_length=50, null=True, blank=True)
    subgroup_id = models.CharField(max_length=50, null=True, blank=True)
    registration_status = models.CharField(max_length=20, null=True, blank=True) # REGISTERED, NON-REGISTERED
    
    # ✅ Group 2: Contact & Geolocation Details
    mobile = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    place_id = models.CharField(max_length=100, null=True, blank=True)
    subplace_id = models.CharField(max_length=100, null=True, blank=True)
    services_id = models.CharField(max_length=100, null=True, blank=True)
    latitude = models.CharField(max_length=50, null=True, blank=True)
    longitude = models.CharField(max_length=50, null=True, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.actor} {self.action_type} {self.target_repr}"