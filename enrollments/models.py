from django.db import models
from students.models import Student
from courses.models import Course
from django.db.models.signals import post_save
from django.dispatch import receiver
from fees.models import FeePlan, Installment
from datetime import date, timedelta

class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        # Fallback if student name attribute varies
        student_name = getattr(self.student, 'first_name', getattr(self.student, 'name', f"Student {self.student.id}"))
        return f"{student_name} -> {self.course.name}"

# Signal 1: FeePlan ke through installment banana
@receiver(post_save, sender=Enrollment)
def generate_installments(sender, instance, created, **kwargs):
    if created:
        # Course ka fee plan dhoondein
        plan = FeePlan.objects.filter(course=instance.course).first()
        if plan:
            amount_per_installment = plan.total_fee / plan.installment_count
            for i in range(plan.installment_count):
                # Har mahine ki installment generate karein (PDF Point 51)
                Installment.objects.create(
                    student=instance.student,
                    amount=amount_per_installment,
                    due_date=date.today() + timedelta(days=30 * (i + 1))
                )

# Signal 2: Default 3 installments (Agar FeePlan nahi mila toh)
@receiver(post_save, sender=Enrollment)
def create_student_installments(sender, instance, created, **kwargs):
    if created:
        # 🚀 FIX YAHAN HAI: 
        # Pehle 'instance.course.fee' likha tha jo exist nahi karta.
        # Ab hum safely 'fee_per_year' nikal rahe hain, aur crash se bachne ke liye 0 set kar diya hai.
        total_fee = getattr(instance.course, 'fee_per_year', 0)
        
        # Fallback agar galti se model mein 'fee' ho
        if not total_fee and hasattr(instance.course, 'fee'):
            total_fee = getattr(instance.course, 'fee', 0)
            
        if total_fee > 0:
            base_fee = total_fee / 3
            for i in range(3):
                Installment.objects.create(
                    student=instance.student,
                    amount=base_fee,
                    due_date=date.today() + timedelta(days=30 * (i + 1))
                )