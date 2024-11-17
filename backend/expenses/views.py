# # expenses/views.py
# from rest_framework import generics, permissions
# from .models import Expense
# from .serializers import ExpenseSerializer
# from properties.models import Property
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.exceptions import NotFound

# class ExpenseListCreateView(generics.ListCreateAPIView):
#     serializer_class = ExpenseSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         # Filter expenses by the property specified in the URL
#         property_id = self.kwargs.get('property_id')
#         return Expense.objects.filter(property__id=property_id)

#     def perform_create(self, serializer):
#         property_id = self.kwargs.get('property_id')
        
#         # Verify the property exists
#         try:
#             property_instance = Property.objects.get(id=property_id)
#         except Property.DoesNotExist:
#             raise NotFound("Property not found.")
        
#         # Save with the associated property and user
#         serializer.save(property=property_instance, created_by=self.request.user)


# class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = ExpenseSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         # Filter expenses by the property specified in the URL
#         property_id = self.kwargs.get('property_id')
#         return Expense.objects.filter(property__id=property_id)













from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound, PermissionDenied
from .models import Expense
from .serializers import ExpenseSerializer
from properties.models import Property
from rest_framework.permissions import IsAuthenticated


class ExpenseListCreateView(generics.ListCreateAPIView):
    """
    View for listing and creating expenses for a specific property.
    """
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        property_id = self.kwargs.get('property_id')

        # Ensure the property belongs to the logged-in user
        try:
            property_instance = Property.objects.get(id=property_id, user=self.request.user)
        except Property.DoesNotExist:
            raise PermissionDenied("You do not have permission to access this property's expenses.")

        return Expense.objects.filter(property=property_instance)

    def perform_create(self, serializer):
        property_id = self.kwargs.get('property_id')

        # Verify the property exists and belongs to the logged-in user
        try:
            property_instance = Property.objects.get(id=property_id, user=self.request.user)
        except Property.DoesNotExist:
            raise PermissionDenied("You do not have permission to create expenses for this property.")

        # Save with the associated property and user
        serializer.save(property=property_instance, created_by=self.request.user)


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View for retrieving, updating, and deleting a specific expense.
    """
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        property_id = self.kwargs.get('property_id')

        # Ensure the property belongs to the logged-in user
        try:
            property_instance = Property.objects.get(id=property_id, user=self.request.user)
        except Property.DoesNotExist:
            raise PermissionDenied("You do not have permission to access this property's expenses.")

        return Expense.objects.filter(property=property_instance)

    def get_object(self):
        """
        Ensure the expense belongs to the property and is accessible by the user.
        """
        queryset = self.get_queryset()
        expense_id = self.kwargs.get('pk')
        try:
            return queryset.get(id=expense_id)
        except Expense.DoesNotExist:
            raise NotFound("Expense not found.")
