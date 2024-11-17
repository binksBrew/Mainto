# properties/urls.py
from django.urls import path
from .views import (
    property_list,
    property_detail,
    room_list,
    room_detail,
    room_amenities_list,
    room_amenities_detail,
    TenantListView,
)

urlpatterns = [
    # Property Endpoints
    path('properties/', property_list, name='property-list'),   # POST for creating
    path('properties/<int:property_id>/', property_detail, name='property-detail'),

    # Room Endpoints (nested under properties)
    path('properties/<int:property_id>/rooms/', room_list, name='property-room-list'),
    path('properties/<int:property_id>/rooms/<int:room_id>/', room_detail, name='room-detail'),

    # Room Amenities Endpoints (nested under properties and rooms)
    path('properties/<int:property_id>/rooms/<int:room_id>/room-amenities/', room_amenities_list, name='room-amenities-list'),
    path('properties/<int:property_id>/rooms/<int:room_id>/room-amenities/<int:pk>/', room_amenities_detail, name='room-amenities-detail'),

    # Tenants under properties
    path('properties/<int:property_id>/tenants/', TenantListView.as_view(), name='tenant-list'),
]
