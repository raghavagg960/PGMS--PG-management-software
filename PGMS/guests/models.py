from django.db import models

class Guest(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active (Staying)'),
        ('notice', 'On Notice Period'),
        ('moved_out', 'Moved Out'),
    ]

    property = models.ForeignKey('properties.PGProperty', on_delete=models.CASCADE, related_name="guests")
    # Cross-app reference to the rooms application model
    room = models.ForeignKey('rooms.Room', on_delete=models.SET_NULL, null=True, blank=True, related_name="guests")
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    
    hometown_address = models.TextField()
    organization = models.CharField(max_length=255, blank=True)
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)
    move_in_date = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')

    def __str__(self):
        return f"{self.name} ({self.status})"