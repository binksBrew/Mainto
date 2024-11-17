from django.db import models
from tenants.models import User  # Importing User model from the 'tenants' app
from django.core.exceptions import ValidationError

# Property model linked to a User (owner/manager)
class Property(models.Model):
    property_name = models.CharField(
        max_length=255,
        blank=False,
        null=False,
        verbose_name="Property Name",
        help_text="Enter the name of the property."
    )
    property_address = models.TextField(
        blank=False,
        null=False,
        verbose_name="Property Address",
        help_text="Enter the complete address of the property."
    )
    manager_name = models.CharField(
        max_length=100,
        blank=False,
        null=False,
        verbose_name="Manager Name",
        help_text="Enter the name of the property manager."
    )
    manager_contact = models.CharField(
        max_length=100,
        blank=False,
        null=False,
        verbose_name="Manager Contact",
        help_text="Enter the contact number of the property manager."
    )
    property_type = models.CharField(
        max_length=100,
        blank=False,
        null=False,
        verbose_name="Property Type",
        help_text="Specify the type of property (e.g., apartment, house)."
    )
    property_image = models.ImageField(
        upload_to='property_images/',
        blank=True,
        null=True,
        verbose_name="Property Image",
        help_text="Upload an image of the property (optional)."
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='properties',
        verbose_name="User",
        help_text="Select the user managing this property."
    )

    def __str__(self):
        return self.property_name


# Room model linked to a specific property
class Room(models.Model):
    room_number = models.IntegerField(
        # max_length=10,
        verbose_name="Room Number",
        help_text="Enter the room number."
    )
    total_beds = models.IntegerField(
        verbose_name="Total Beds",
        help_text="Enter the total number of beds in this room."
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='rooms',
        verbose_name="Property",
        help_text="Select the property this room belongs to."
    )

    class Meta:
        unique_together = ['room_number', 'property']  # Ensures no duplicate room numbers within the same property

    def __str__(self):
        return f"Room {self.room_number} in {self.property.property_name}"

    def clean(self):
        if self.total_beds < 0:
            raise ValidationError("Total beds cannot be negative.")


# RoomAmenities model with a one-to-one relationship to a Room
class RoomAmenities(models.Model):
    room = models.OneToOneField(
        Room,
        on_delete=models.CASCADE,
        related_name='amenities',
        verbose_name="Room",
        help_text="Select the room for which these amenities apply."
    )
    bathrooms = models.BooleanField(default=False, verbose_name="Bathrooms", help_text="Is there a bathroom in the room?")
    kitchen = models.BooleanField(default=False, verbose_name="Kitchen", help_text="Is there a kitchen in the room?")
    living_area = models.BooleanField(default=False, verbose_name="Living Area", help_text="Is there a living area in the room?")
    dining_area = models.BooleanField(default=False, verbose_name="Dining Area", help_text="Is there a dining area in the room?")
    workspace = models.BooleanField(default=False, verbose_name="Workspace", help_text="Is there a workspace in the room?")
    parking = models.BooleanField(default=False, verbose_name="Parking", help_text="Is parking available?")
    security_features = models.BooleanField(default=False, verbose_name="Security Features", help_text="Does the property have security features?")
    community_facilities = models.BooleanField(default=False, verbose_name="Community Facilities", help_text="Are there community facilities available?")

    def __str__(self):
        return f"Amenities for Room {self.room.room_number}"
