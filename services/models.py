from django.db import models

# 1. Education Level
class EducationLevel(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

# 2. Service Type
class ServiceType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

# 3. Service Mode
class ServiceMode(models.Model):
    name = models.CharField(max_length=50, unique=True)
    icon_name = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name
    
# 4. Management Type
class ManagementType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

# 5. Place & Service Code Mapping
class PlaceCodeMapping(models.Model):
    place_code = models.CharField(max_length=50, unique=True)
    longitude = models.DecimalField(max_digits=12, decimal_places=8, null=True, blank=True)
    latitude = models.DecimalField(max_digits=12, decimal_places=8, null=True, blank=True)
    services_code = models.CharField(max_length=50)
    users_code = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.place_code

# 6. Nature of Services (Permanent, Adhoc, etc.)
class NatureOfService(models.Model):
    name = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

# 7. Service Seekers Groups (Students, Parents, Guests)
class ServiceSeekerGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

# 8. Service Providers Groups (Office, Fields Working, Both)
class ServiceProviderGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

# 9. Service Charges / Validity
class ServiceCharge(models.Model):
    service_name = models.CharField(max_length=150)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    validity_months = models.IntegerField(default=1)
    status = models.CharField(max_length=20, default='Active', choices=[('Active','Active'), ('Inactive','Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return f"{self.service_name} - {self.amount}"

# --- 🚀 NEW COMMUNICATION MODELS ---

# 10. Notice Board
class Notice(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    notice_type = models.CharField(max_length=50, choices=[('General', 'General'), ('Holiday', 'Holiday'), ('Event', 'Event'), ('Meeting', 'Meeting')])
    date_posted = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.title

# 11. Support Ticket (Helpdesk)
class SupportTicket(models.Model):
    ticket_id = models.CharField(max_length=20, unique=True)
    ticket_type = models.CharField(max_length=50, choices=[('Complain', 'Complain'), ('Enquiry', 'Enquiry'), ('Feedback', 'Feedback')])
    user_name = models.CharField(max_length=150)
    subject = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default='Pending', choices=[('Pending', 'Pending'), ('Resolved', 'Resolved'), ('Read', 'Read')])
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.ticket_id

# 12. Mailbox Storage Stats
class MailboxStat(models.Model):
    total_allocated_mb = models.FloatField(default=5000.0)
    downloaded_mb = models.FloatField(default=0.0)
    uploaded_mb = models.FloatField(default=0.0)
    updated_at = models.DateTimeField(auto_now=True)
    
    
    
    
# 13. Live Tracking & Sessions (Phase 6)
class SystemSession(models.Model):
    user_name = models.CharField(max_length=150, default='Anonymous')
    ip_address = models.CharField(max_length=50, blank=True, null=True)
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    # Saves format: Years, Months, Days, Hours, Minutes, Seconds, Milliseconds
    duration_calculated = models.CharField(max_length=255, blank=True, null=True) 
    is_live = models.BooleanField(default=True)

    def __str__(self): return f"{self.user_name} - {'Live' if self.is_live else 'Offline'}"

# 14. Action History / Audit Logs (Phase 6)
class ActionLog(models.Model):
    ACTION_TYPES = [
        ('Save', 'Save'), ('Share', 'Share'), ('Send', 'Send'), 
        ('Copy', 'Copy'), ('Paste', 'Paste'), ('Bulk Action', 'Bulk Action'), 
        ('Delete', 'Delete'), ('Update', 'Update')
    ]
    user_name = models.CharField(max_length=150, default='Super Admin')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    module_affected = models.CharField(max_length=100) # e.g., 'Exams', 'Users'
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self): return f"{self.action_type} on {self.module_affected}"