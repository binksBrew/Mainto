from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True, blank=False, null=False)
    role = models.CharField(max_length=50, blank=False, null=False)  # 'admin', 'manager', etc.

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']

    class Meta:
        db_table = 'users'


class Tenant(models.Model):
    room = models.ForeignKey('properties.Room', on_delete=models.CASCADE, related_name='tenants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tenants')
    tenant_first = models.CharField(max_length=255, blank=False, null=False)
    tenant_surname = models.CharField(max_length=255, blank=False, null=False)
    tenant_ph = models.CharField(max_length=50, blank=False, null=False)
    tenant_email = models.EmailField(max_length=255, blank=False, null=False)
    rental_status = models.CharField(max_length=50)
    lease_start_date = models.DateField(blank=True, null=True)
    lease_end_date = models.DateField(blank=True, null=True)
    check_in_date = models.DateField(blank=False, null=False, default=date.today)
    check_out_date = models.DateField(blank=True, null=True)
    aadhar_number = models.CharField(max_length=12, blank=True, null=False)
    is_aadhar_verified = models.BooleanField(default=False)
    bed_allocated = models.PositiveIntegerField(blank=True, null=True, default=1)  # Default to 1 bed
    deposit = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    rent_paid = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    last_payment_date = models.DateField(blank=True, null=True)
    room_selected = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = 'tenants'

    @property
    def days_stayed(self):
        """Calculate the days stayed from check-in to today or check-out date."""
        end_date = self.check_out_date or date.today()
        return max((end_date - self.check_in_date).days, 0)

    @property
    def daily_rate(self):
        """Calculate daily rent rate based on monthly rent amount."""
        if self.rent_amount:
            return self.rent_amount / Decimal('30')
        return Decimal('0')

    @property
    def total_rent_due(self):
        """Calculate total rent due based on days stayed, daily rate, and beds allocated."""
        total_due = self.days_stayed * self.daily_rate * (self.bed_allocated or 1)
        # Round to two decimal places for consistency
        return total_due.quantize(Decimal('0.00'), rounding=ROUND_HALF_UP)

    @property
    def pending_rent(self):
        """Calculate pending rent based on rent due and amount paid."""
        pending = self.total_rent_due - self.rent_paid
        # Ensure no negative values and round to two decimal places
        return max(pending, Decimal('0')).quantize(Decimal('0.00'), rounding=ROUND_HALF_UP)

    # @property
    # def is_overdue(self):
    #     """Check if tenant is overdue on rent (no payment for 30 days or more)."""
    #     if self.last_payment_date:
    #         overdue_date = self.last_payment_date + timedelta(days=30)
    #         return date.today() > overdue_date and self.pending_rent > 0
    #     return False


    @property
    def is_overdue(self):
        """Check if tenant is overdue on rent (no payment for 30 days or more)."""
        # Determine the reference date to calculate overdue status
        reference_date = self.last_payment_date or self.check_in_date
        overdue_date = reference_date + timedelta(days=30)
        return date.today() > overdue_date and self.pending_rent > 0