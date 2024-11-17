from django.contrib import admin
from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'amount', 'date_incurred', 'supervisor', 'property', 'created_by')
    list_filter = ('date_incurred', 'property__property_name', 'supervisor')
    search_fields = ('name', 'supervisor', 'property__property_name', 'created_by__email')
    ordering = ('-date_incurred',)
    fieldsets = (
        (None, {
            'fields': ('name', 'amount', 'document', 'description')
        }),
        ('Details', {
            'fields': ('supervisor', 'location', 'property', 'created_by', 'date_incurred', 'date_added')
        }),
    )
    readonly_fields = ('date_incurred', 'date_added')  # Make certain fields read-only in the admin interface

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        # Restrict the queryset for non-superusers
        if not request.user.is_superuser:
            return queryset.filter(created_by=request.user)
        return queryset

    def has_change_permission(self, request, obj=None):
        # Allow editing only if the user is a superuser or the creator of the expense
        if obj and not request.user.is_superuser and obj.created_by != request.user:
            return False
        return True

    def has_delete_permission(self, request, obj=None):
        # Allow deletion only if the user is a superuser or the creator of the expense
        if obj and not request.user.is_superuser and obj.created_by != request.user:
            return False
        return True
