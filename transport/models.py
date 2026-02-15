from django.db import models

class Transport(models.Model):
    vehicle_number = models.CharField(max_length=20)
    driver_name = models.CharField(max_length=100)
    driver_phone = models.CharField(max_length=15)
    route_name = models.CharField(max_length=100)
    vehicle_type = models.CharField(max_length=50, choices=[('Bus', 'Bus'), ('Van', 'Van')])
    capacity = models.IntegerField()
    
    def __str__(self):
        return f"{self.vehicle_number} - {self.route_name}"