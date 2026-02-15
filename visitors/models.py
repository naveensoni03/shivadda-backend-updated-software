from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone

class Visitor(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    purpose = models.TextField()
    person_to_meet = models.CharField(max_length=100, help_text="Whom to meet?")
    check_in_time = models.DateTimeField(default=timezone.now)
    check_out_time = models.DateTimeField(null=True, blank=True)
    is_checked_out = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.purpose}"