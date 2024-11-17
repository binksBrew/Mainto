# main urls.py
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from .views import CustomTokenObtainPairView  # Importing only the custom token view specifically


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('tenants.urls')),
    path('', include('properties.urls')),
    path('', include('expenses.urls')),

    # Password Reset URLs
    path('password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),

    # Login URL for Token
    # path('accounts/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    path('rent_prediction/', include('rent_prediction.urls')),  # Include rent_prediction URLs

]
