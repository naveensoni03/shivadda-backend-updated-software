from django.db import models
from datetime import date, timedelta

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    isbn = models.CharField(max_length=50, unique=True, help_text="Unique Barcode/ISBN")
    category = models.CharField(max_length=100)
    
    # ✅ Price Field Added
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    total_copies = models.IntegerField(default=1)
    available_copies = models.IntegerField(default=1)
    location = models.CharField(max_length=50, blank=True)
    publisher = models.CharField(max_length=100, blank=True)
    year = models.CharField(max_length=4, blank=True)
    language = models.CharField(max_length=50, default="English")
    pdf_url = models.URLField(blank=True, null=True)
    
    added_on = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.isbn})"

# ... (BookIssue model same rahega)
class BookIssue(models.Model):
    # ... (No changes needed here)
    student_roll = models.CharField(max_length=50)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField(blank=True, null=True)
    return_date = models.DateField(null=True, blank=True)
    fine_amount = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, default='Issued', choices=(('Issued', 'Issued'), ('Returned', 'Returned')))

    def save(self, *args, **kwargs):
        if not self.pk and not self.due_date:
            self.due_date = date.today() + timedelta(days=15)
        super().save(*args, **kwargs)

    @property
    def calculate_fine(self):
        if self.status == 'Issued' and date.today() > self.due_date:
            return (date.today() - self.due_date).days * 10.0
        return self.fine_amount