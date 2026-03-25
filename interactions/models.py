from django.db import models
from django.contrib.auth import get_user_model
from courses.models import Course

User = get_user_model()

# 1. Course Ratings & Reviews (Marketplace Feature)
class CourseReview(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5, help_text="1 to 5 Stars")
    review_text = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rating} Star - {self.course.name} by {self.student.username}"

# 2. Doubts & Forums (Live Q&A)
class Doubt(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='asked_doubts')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True)
    question = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Doubt by {self.student.username} - {self.is_resolved}"

class DoubtReply(models.Model):
    doubt = models.ForeignKey(Doubt, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(User, on_delete=models.CASCADE, help_text="Teacher or Student replying")
    reply_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reply by {self.user.username}"
