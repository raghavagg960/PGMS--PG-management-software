from django.db import models
from django.contrib.auth.models import User 

# Create your models here.
from django.db import models

class Staff(models.Model):
    ROLE_CHOICES = [
        ('warden', 'Warden'),
        ('cook', 'Cook / Kitchen Staff'),
        ('cleaner', 'Cleaning / Housekeeping'),
        ('security', 'Security Guard'),
        ('other', 'Other Support Staff'),
    ]

    user = models.OneToOneField(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="staff_profile"
    )

    email = models.EmailField(max_length=255, blank=True, null=True)
    property = models.ForeignKey('properties.PGProperty', on_delete=models.CASCADE, related_name="staff")
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=15)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.get_role_display()}"