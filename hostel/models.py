from django.db import models
from students.models import Student

class Hostel(models.Model):
    name = models.CharField(max_length=100) # e.g., Boys Hostel A
    type = models.CharField(max_length=20, choices=(('Boys', 'Boys'), ('Girls', 'Girls')))
    warden = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Room(models.Model):
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE)
    room_number = models.CharField(max_length=10)
    capacity = models.IntegerField(default=3)
    current_occupancy = models.IntegerField(default=0)
    cost_per_month = models.DecimalField(max_digits=10, decimal_places=2, default=5000.00)
    is_ac = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.hostel.name} - Room {self.room_number}"

class RoomAllocation(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE) # Ek student ko ek hi room milega
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    allocated_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.student.name} -> {self.room.room_number}"