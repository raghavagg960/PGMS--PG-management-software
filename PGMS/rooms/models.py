from django.db import models

class Room(models.Model):
    SHARING_CHOICES = [
        (1, 'Single Sharing'),
        (2, 'Double Sharing'),
        (3, 'Triple Sharing'),
        (4, 'Four Sharing'),
    ]

    property = models.ForeignKey('properties.PGProperty', on_delete=models.CASCADE, related_name="rooms")
    floor_number = models.IntegerField(help_text="0 for Ground floor, 1 for 1st floor, etc.")
    room_number = models.CharField(max_length=10, help_text="e.g., 101, 204")
    sharing_type = models.IntegerField(choices=SHARING_CHOICES, default=2)
    
    has_ac = models.BooleanField(default=False)
    has_attached_bathroom = models.BooleanField(default=True)
    total_beds = models.PositiveIntegerField(default=2)
    total_almirahs = models.PositiveIntegerField(default=2)

    class Meta:
        unique_together = ('property', 'floor_number', 'room_number')

    def __str__(self):
        return f"Room {self.room_number} (Floor {self.floor_number})"