# # expenses/serializers.py
# from rest_framework import serializers
# from .models import Expense
# from tenants.models import User
# from properties.models import Room

# class ExpenseSerializer(serializers.ModelSerializer):
#     created_by = serializers.HiddenField(default=serializers.CurrentUserDefault())
#     property = serializers.PrimaryKeyRelatedField(read_only=True)  # Make property read-only
    
#     class Meta:
#         model = Expense
#         fields = [
#             'id', 'name', 'document', 'supervisor', 'location', 'amount',
#             'date_incurred', 'date_added', 'description', 'created_by', 'property'
#         ]
#         read_only_fields = ['date_incurred','date_added', 'property']
#         extra_kwargs = {
#             'name': {'required': True},
#             'supervisor': {'required': True},
#             # 'location': {'required': True},
#             'amount': {'required': True},
#         }


# def validate(self, data):
#         # Ensure at least one of room or custom_location is provided
#         if not data.get('room') and not data.get('custom_location'):
#             raise serializers.ValidationError("Either 'room' or 'custom_location' must be provided.")
#         return data








from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    created_by = serializers.HiddenField(default=serializers.CurrentUserDefault())
    property = serializers.PrimaryKeyRelatedField(read_only=True)  # Make property read-only

    class Meta:
        model = Expense
        fields = [
            'id', 'name', 'document', 'supervisor', 'location', 'amount',
            'date_incurred', 'date_added', 'description', 'created_by', 'property'
        ]
        read_only_fields = ['date_incurred', 'date_added', 'property']
        extra_kwargs = {
            'name': {'required': True},
            'supervisor': {'required': True},
            'amount': {'required': True},
        }

    def validate(self, data):
        """
        Custom validation to ensure either 'location' or another key is properly provided.
        """
        if not data.get('location'):
            raise serializers.ValidationError("Location must be provided.")
        return data
