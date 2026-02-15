from django.db import models
from django.utils import timezone

class Payroll(models.Model):
    staff_name = models.CharField(max_length=255)
    role = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.CharField(max_length=100) # Ex: "February 2026"
    status = models.CharField(max_length=50, default='Paid')
    
    # ✅ FIX: Auto-add date (Frontend se bhejne ki zaroorat nahi)
    payment_date = models.DateTimeField(auto_now_add=True) 

    def __str__(self):
        return f"{self.staff_name} - {self.amount}"