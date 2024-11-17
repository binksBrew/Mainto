# from django.contrib import admin
# from .models import Property, Room, RoomAmenities  # Importing models from the properties app

# # Admin for Property model
# @admin.register(Property)
# class PropertyAdmin(admin.ModelAdmin):
#     list_display = ('property_name', 'property_address', 'manager_name', 'manager_contact', 'property_type', 'user')
#     search_fields = ('property_name', 'property_address', 'manager_name', 'user__username')

# # Admin for Room model
# @admin.register(Room)
# class RoomAdmin(admin.ModelAdmin):
#     list_display = ('room_number', 'total_beds', 'property')
#     search_fields = ('room_number', 'property__property_name')

# # Admin for RoomAmenities model
# @admin.register(RoomAmenities)
# class RoomAmenitiesAdmin(admin.ModelAdmin):
#     list_display = ('room', 'bathrooms', 'kitchen', 'living_area', 'dining_area', 'workspace', 'parking', 'security_features', 'community_facilities')
#     search_fields = ('room__room_number', 'room__property__property_name')













from django.contrib import admin
from .models import Property, Room, RoomAmenities


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('id', 'property_name', 'manager_name', 'property_type', 'user')
    list_filter = ('property_type',)
    search_fields = ('property_name', 'manager_name', 'property_type', 'user__email')
    ordering = ('-id',)
    fieldsets = (
        (None, {
            'fields': ('property_name', 'property_address', 'manager_name', 'manager_contact', 'property_type', 'property_image')
        }),
        ('Owner', {
            'fields': ('user',)
        }),
    )
    readonly_fields = ('id',)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        if request.user.is_superuser:
            return queryset
        return queryset.filter(user=request.user)


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'room_number', 'total_beds', 'property')
    list_filter = ('property__property_type',)
    search_fields = ('room_number', 'property__property_name')
    ordering = ('-id',)
    fieldsets = (
        (None, {
            'fields': ('room_number', 'total_beds', 'property')
        }),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        if request.user.is_superuser:
            return queryset
        return queryset.filter(property__user=request.user)


@admin.register(RoomAmenities)
class RoomAmenitiesAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'bathrooms', 'kitchen', 'living_area', 'dining_area', 'workspace', 'parking', 'security_features', 'community_facilities')
    list_filter = ('bathrooms', 'kitchen', 'living_area', 'workspace', 'parking', 'security_features', 'community_facilities')
    search_fields = ('room__room_number', 'room__property__property_name')
    ordering = ('-id',)
    fieldsets = (
        (None, {
            'fields': ('room', 'bathrooms', 'kitchen', 'living_area', 'dining_area', 'workspace', 'parking', 'security_features', 'community_facilities')
        }),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        if request.user.is_superuser:
            return queryset
        return queryset.filter(room__property__user=request.user)
