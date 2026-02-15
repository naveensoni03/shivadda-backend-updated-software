from django.db import models

# Create your models here.
from django.db import models

class ExamCenter(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    country = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    capacity = models.IntegerField(default=0)
    
    # IP Ranges for Security
    ip_range_start = models.GenericIPAddressField(blank=True, null=True)
    ip_range_end = models.GenericIPAddressField(blank=True, null=True)
    
    contact_email = models.EmailField(blank=True, null=True)
    
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Maintenance', 'Maintenance'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"