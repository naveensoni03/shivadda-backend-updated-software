from datetime import date
from django.utils.timezone import now
from .models import Installment, FeePlan

def run_fee_automation():
    """
    Ye function daily run kiya ja sakta hai (via Cron Job or Celery).
    Ye check karega kaunsi fees due date cross kar chuki hai aur penalty lagayega.
    """
    print("🔄 Running Fee Automation...")
    
    # 1. Find overdue installments
    overdue_installments = Installment.objects.filter(
        due_date__lt=date.today(),
        is_paid=False
    )
    
    updates_count = 0
    
    for item in overdue_installments:
        # 2. Calculate Days Late
        days_late = (date.today() - item.due_date).days
        
        # 3. Determine Penalty Rate
        # Agar student ke course ka plan hai to wo use karo, nahi to default 50
        fee_plan = FeePlan.objects.filter(course=item.student.course).first() if hasattr(item.student, 'course') else None
        rate = fee_plan.penalty_per_day if fee_plan else 50.00
        
        # 4. Calculate Total Penalty
        new_penalty = days_late * rate
        
        # Update only if changed
        if item.penalty_applied != new_penalty:
            item.penalty_applied = new_penalty
            item.save()
            updates_count += 1
            
            # 5. Send Alert (Console Print for now, Real SMS API later)
            send_penalty_alert(item.student.first_name, item.student.primary_mobile, new_penalty)

    return f"Automation Complete. Updated {updates_count} records."

def send_penalty_alert(student_name, phone, amount):
    """
    Mock function to simulate sending WhatsApp/SMS alert
    """
    message = f"📢 Alert: Late fee penalty of ₹{amount} applied for {student_name}."
    print(f"📲 [SMS SENT] To: {phone} | Msg: {message}")