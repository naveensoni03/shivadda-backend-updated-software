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
    
    # ✅ Form se class yahan save hogi
    class_name = models.CharField(max_length=100, null=True, blank=True)
    
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('student', 'course') # 🛡️ Best practice for preventing duplicates

    def __str__(self):
        # Fallback if student name attribute varies
        student_name = getattr(self.student, 'first_name', getattr(self.student, 'name', f"Student {self.student.id}"))
        class_str = f" ({self.class_name})" if self.class_name else ""
        return f"{student_name}{class_str} -> {self.course.name}"


# 🚀 FIXED: Ek Single Smart Signal (Double EMI problem solved!)
@receiver(post_save, sender=Enrollment)
def generate_installments_on_enrollment(sender, instance, created, **kwargs):
    if created:
        try:
            # Pura logic try-except me hai taaki Installment fail hone se Enrollment fail na ho
            plan = FeePlan.objects.filter(course=instance.course).first()

            # SCENARIO 1: Agar Custom FeePlan mil gaya aur usme installments > 0 hain
            if plan and plan.installment_count > 0:
                amount_per_installment = plan.total_fee / plan.installment_count
                
                for i in range(plan.installment_count):
                    Installment.objects.create(
                        student=instance.student,
                        amount=round(amount_per_installment, 2), # ✅ Round off added
                        due_date=date.today() + timedelta(days=30 * (i + 1))
                    )

            # SCENARIO 2: Fallback (Agar FeePlan nahi mila toh Default 3 installments)
            else:
                total_fee = getattr(instance.course, 'fee_per_year', 0)
                
                if not total_fee and hasattr(instance.course, 'fee'):
                    total_fee = getattr(instance.course, 'fee', 0)
                    
                if total_fee > 0:
                    base_fee = total_fee / 3
                    
                    for i in range(3):
                        Installment.objects.create(
                            student=instance.student,
                            amount=round(base_fee, 2), # ✅ Round off added
                            due_date=date.today() + timedelta(days=30 * (i + 1))
                        )
                        
        except Exception as e:
            # Agar koi database error aaya toh yahan terminal pe dikhega
            print(f"❌ Error generating installments for Enrollment ID {instance.id}: {e}")