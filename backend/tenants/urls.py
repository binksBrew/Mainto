# tenants/urls.py
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView  # Importing only the custom token view specifically

urlpatterns = [
    # User Endpoints
    path('users/', views.user_list, name='user-list'),
    path('users/<int:pk>/', views.user_detail, name='user-detail'),
    path('user-form-options/', views.user_form_options, name='user-form-options'),
    path('users/register/', views.user_register, name='user-register'),
    path('profile/', views.user_profile, name='user-profile'),  # New endpoint for user profile

    # Authentication and Token Endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # Using the custom view
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Properties and Rooms Endpoints
    path('properties/<int:property_id>/rooms/', views.room_list, name='room-list'),
    path('properties/<int:property_id>/rooms/<int:room_id>/', views.room_detail, name='room-detail'),
    path('properties/<int:property_id>/available_rooms/', views.available_rooms, name='available_rooms'),

    # Tenant Endpoints Nested Under Properties
    path('properties/<int:property_id>/tenants/', views.tenant_list, name='tenant-list'),
    path('properties/<int:property_id>/tenants/<int:tenant_id>/', views.tenant_detail, name='tenant-detail'),

    # Logout Endpoint
    path('logout/', views.logout_view, name='logout'),
    path('accounts/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
]
