# expenses/urls.py
from django.urls import path
from .views import ExpenseListCreateView, ExpenseDetailView

urlpatterns = [
    path('properties/<int:property_id>/expenses/', ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('properties/<int:property_id>/expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense-detail'),
]
