from .models import Property, Room, RoomAmenities

# properties/serializers.py
from rest_framework import serializers
# from .models import Tenant
from tenants.models import Tenant

from rent_prediction.views import predict_rent_view  # Import prediction logic



class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = '__all__'


class RoomAmenitiesSerializer(serializers.ModelSerializer):
        room = serializers.PrimaryKeyRelatedField(read_only=True)  # Make room field read-only
        # room = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all())  # Make room field writable if needed


        class Meta:
            model = RoomAmenities
            fields = ['room','bathrooms', 'kitchen', 'living_area', 'dining_area', 'workspace', 'parking', 'security_features', 'community_facilities']


class RoomSerializer(serializers.ModelSerializer):
    amenities = RoomAmenitiesSerializer(many=False, read_only=True)  # Include room amenities data (if present)
    # available_beds = serializers.IntegerField(source='available_beds', read_only=True)
    
    amenities_id = serializers.IntegerField(source='amenities.id', read_only=True)  # Include the ID of amenities


    
    class Meta:
        model = Room
        # fields = '__all__'
        # exclude = ['property']   # no exposure of 'property' field directly as it is being handled by the view
        
        
        fields = ['id', 'room_number', 'total_beds', 'amenities', 'amenities_id']  # Include amenities ID

    
    
    
    
    def get_predicted_rent(self, obj):
        try:
            # Extract property and address details for prediction
            property_type = obj.property.property_type
            city = obj.property.property_address.split(",")[0]  # Extract city from address

            # Prepare feature data
            feature_data = {
                "Total_Beds": obj.total_beds,
                "Bathrooms": obj.amenities.bathrooms,
                "Kitchen": obj.amenities.kitchen,
                "Living_Area": obj.amenities.living_area,
                "Dining_Area": obj.amenities.dining_area,
                "Workspace": obj.amenities.workspace,
                "Parking": obj.amenities.parking,
                "Security_Features": obj.amenities.security_features,
                "Community_Facilities": obj.amenities.community_facilities,
                "Property_Type": property_type,
                "City": city
            }

            # Call rent prediction logic
            response = predict_rent_view({"data": feature_data})
            if response.status_code == 200:
                return response.data.get("predicted_rent", 0)

        except Exception as e:
            print(f"Prediction error: {str(e)}")

        return None  # Return None if prediction fails
        

class PropertySerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())  # Automatically set the user

    class Meta:
        model = Property
        fields = '__all__'
        extra_kwargs = {
            'property_name': {'required': True},  # Mandate property_name
            'property_address': {'required': True},  # Mandate property_address
            'manager_name': {'required': True},   # Mandate manager_name
            'manager_contact': {'required': True},   # Mandate manager_contact
            'property_type': {'required': True},  # Mandate property_type
        }
        
    def update(self, instance, validated_data):
        # Update each attribute in instance with data from validated_data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance    

