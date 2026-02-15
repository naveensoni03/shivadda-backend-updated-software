from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import RoomAllocation
from fees.models import Installment
from datetime import date, timedelta

@receiver(post_save, sender=RoomAllocation)
def add_hostel_fee(sender, instance, created, **kwargs):
    if created:
        # 1. Room ki occupancy badhao
        room = instance.room
        room.current_occupancy += 1
        room.save()

        # 2. FEES MODULE MEIN ENTRY (Real Automation)
        # Maan lo hum 3 mahine ki fees advance le rahe hain
        total_rent = room.cost_per_month * 3 
        
        Installment.objects.create(
            student=instance.student,
            amount=total_rent,
            due_date=date.today() + timedelta(days=7), # 7 din mein pay karna hai
            is_paid=False
        )
        print(f"💰 Invoice Generated: ₹{total_rent} for {instance.student.name}")