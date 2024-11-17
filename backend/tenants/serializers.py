from rest_framework import serializers
from .models import User, Tenant
from properties.models import Room

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    role = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'first_name', 'last_name', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'role': {'required': True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            role=validated_data['role'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        return user


class TenantSerializer(serializers.ModelSerializer):
    room_selected = serializers.IntegerField(write_only=True, required=True)
    # Define calculated fields explicitly
    pending_rent = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Tenant
        fields = [
            'id', 'tenant_first', 'tenant_surname', 'tenant_ph', 'tenant_email',
            'rental_status', 'lease_start_date', 'lease_end_date', 'check_in_date',
            'check_out_date', 'room_selected', 'room', 'bed_allocated', 'aadhar_number',
            'is_aadhar_verified', 'deposit', 'rent_amount', 'rent_paid', 'pending_rent',
            'last_payment_date', 'is_overdue'
        ]
        read_only_fields = ['user', 'room', 'pending_rent', 'is_overdue']
        extra_kwargs = {
            'tenant_first': {'required': True},
            'tenant_surname': {'required': True},
            'tenant_ph': {'required': True},
            'tenant_email': {'required': True},
            'aadhar_number': {'required': True},
            'is_aadhar_verified': {'required': False},
            'bed_allocated': {'required': True},
            'deposit': {'required': True},
            'rent_amount': {'required': True},
        }

    def create(self, validated_data):
        room_number = validated_data.pop('room_selected', None)
        property_instance = self.context.get('property')

        if room_number is None or property_instance is None:
            raise serializers.ValidationError("room_selected and Property must be provided.")

        try:
            room = Room.objects.get(room_number=room_number, property=property_instance)
        except Room.DoesNotExist:
            raise serializers.ValidationError("Room with specified number and property does not exist.")

        user = self.context.get('user')
        if user is None:
            raise serializers.ValidationError("User must be provided in the context.")

        tenant = Tenant.objects.create(
            user=user,
            room=room,
            **validated_data
        )
        return tenant

    def update(self, instance, validated_data):
        room_selected = validated_data.pop('room_selected', None)
        if room_selected:
            property_instance = instance.room.property
            try:
                room = Room.objects.get(room_number=room_selected, property=property_instance)
                instance.room = room
            except Room.DoesNotExist:
                raise serializers.ValidationError("Room with specified number and property does not exist.")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Recalculate pending_rent and is_overdue explicitly to ensure they reflect the latest values
        representation['pending_rent'] = str(instance.pending_rent)  # Convert to string for consistent JSON format
        representation['is_overdue'] = instance.is_overdue
        # Add room_number from related Room model
        representation['room_number'] = instance.room.room_number if instance.room else None
        return representation
