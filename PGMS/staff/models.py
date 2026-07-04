from django.db import models

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
    
    # Clean cross-app link to properties app
    property = models.ForeignKey('properties.PGProperty', on_delete=models.CASCADE, related_name="staff")
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=15)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.get_role_display()}"