# expenses/models.py
from django.db import models
from tenants.models import User
from properties.models import Room, Property
from django.core.exceptions import ValidationError


class Expense(models.Model):
    name = models.CharField(
        max_length=255,
        blank=False,
        null=False,
        verbose_name="Expense Name",
        help_text="Brief description of the expense (e.g., Plumbing Repair, Furniture)."
    )
    document = models.FileField(
        upload_to='expense_documents/',
        blank=True,
        null=True,
        verbose_name="Expense Document",
        help_text="Upload a document or receipt for this expense."
    )
    supervisor = models.CharField(
        max_length=255,
        blank=False,
        null=False,
        verbose_name="Supervisor",
        help_text="Name of the person supervising the expense."
    )
    location = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Custom Location",
        help_text="Room or area where the expense was incurred."
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=False,
        null=False,
        verbose_name="Amount Spent",
        help_text="Total amount spent for this expense."
    )
    date_incurred = models.DateField(
        auto_now_add=True,
        verbose_name="Date Incurred",
        help_text="The date this expense was incurred."
    )
    date_added = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date Added",
        help_text="The date and time this expense was added to the system."
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Description",
        help_text="Additional details or notes about this expense."
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_expenses",
        verbose_name="Created By",
        help_text="The user who logged this expense."
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="expenses",
        verbose_name="Property",
        help_text="Property associated with this expense."
    )

    def __str__(self):
        return f"{self.name} - {self.amount}"
    
    def clean(self):
        # Ensure at least one location field is provided
        if not self.room and not self.custom_location:
            raise ValidationError("Either room or custom location must be provided.")


    class Meta:
        ordering = ['-date_incurred']  # Orders expenses by most recent date
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"
