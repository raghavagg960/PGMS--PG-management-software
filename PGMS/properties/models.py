from django.db import models
from django.contrib.auth.models import User



class OwnerProfile(models.Model):
    """
    Extends the base Django User model to add business-specific fields 
    like verified mobile numbers for PG Owners.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    mobile_number = models.CharField(
        max_length=15, 
        unique=True, 
        help_text="Primary contact number used for login"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.first_name}'s Profile ({self.mobile_number})"



class PGProperty(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="properties")
    name = models.CharField(max_length=255, verbose_name="PG Name")
    address = models.TextField()
    total_floors = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    total_rooms = models.PositiveIntegerField(default=0)
    total_beds = models.PositiveIntegerField(default=0)
    occupied_beds = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=50, default='Active')

    class Meta:
        verbose_name_plural = "PG Properties"

    def __str__(self):
        return self.name