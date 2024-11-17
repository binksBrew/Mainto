# from django.contrib import admin
# from .models import User, Tenant  # Importing models from the tenants app

# # Admin for User model
# @admin.register(User)
# class UserAdmin(admin.ModelAdmin):
#     list_display = ('username', 'email', 'first_name', 'last_name', 'role')
#     search_fields = ('username', 'email', 'first_name', 'last_name')

# # Admin for Tenant model
# @admin.register(Tenant)
# class TenantAdmin(admin.ModelAdmin):
#     list_display = (
#         'tenant_first', 'tenant_surname', 'tenant_ph', 'tenant_email', 
#         'rental_status', 'lease_start_date', 'lease_end_date', 'room',
#         'aadhar_number', 'is_aadhar_verified'
#     )
#     search_fields = ('tenant_first', 'tenant_surname', 'tenant_email', 'rental_status', 'aadhar_number')












from django.contrib import admin
from .models import User, Tenant


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'username', 'role', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('email', 'username', 'role')
    ordering = ('-date_joined',)
    readonly_fields = ('date_joined', 'last_login')
    fieldsets = (
        (None, {
            'fields': ('email', 'username', 'password')
        }),
        ('Permissions', {
            'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'role')
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'tenant_first', 'tenant_surname', 'tenant_email', 'room', 'rental_status',
        'check_in_date', 'check_out_date', 'pending_rent', 'is_overdue'
    )
    list_filter = ('rental_status', 'is_aadhar_verified', 'check_in_date', 'check_out_date')
    search_fields = ('tenant_first', 'tenant_surname', 'tenant_email', 'aadhar_number')
    ordering = ('-check_in_date',)
    fieldsets = (
        (None, {
            'fields': (
                'tenant_first', 'tenant_surname', 'tenant_ph', 'tenant_email', 'aadhar_number',
                'is_aadhar_verified', 'user', 'room'
            )
        }),
        ('Rental Details', {
            'fields': (
                'rental_status', 'lease_start_date', 'lease_end_date', 'check_in_date',
                'check_out_date', 'bed_allocated', 'deposit', 'rent_amount', 'rent_paid',
                'last_payment_date'
            )
        }),
    )
    readonly_fields = ('pending_rent', 'is_overdue')

    def pending_rent(self, obj):
        return obj.pending_rent
    pending_rent.short_description = 'Pending Rent'

    def is_overdue(self, obj):
        return obj.is_overdue
    is_overdue.short_description = 'Overdue'
    is_overdue.boolean = True
