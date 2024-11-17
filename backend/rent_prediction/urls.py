# rent_prediction/urls.ppy

from django.urls import path
from .views import predict_rent_view

urlpatterns = [
    path('predict/', predict_rent_view, name='predict_rent'),
]
