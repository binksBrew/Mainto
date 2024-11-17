import logging
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.http import Http404
from .models import Property, Room, RoomAmenities
from .serializers import PropertySerializer, RoomSerializer, RoomAmenitiesSerializer
from tenants.models import Tenant
from rest_framework import generics
from .serializers import TenantSerializer


# Logger configuration
logger = logging.getLogger(__name__)
# Tenant List View
class TenantListView(generics.ListAPIView):
    serializer_class = TenantSerializer

    def get_queryset(self):
        property_id = self.kwargs['property_id']
        # Filter tenants by the property through the room relation
        return Tenant.objects.filter(room__property__id=property_id)
        # return Tenant.objects.filter(property__id=property_id)

# Base Model View for common functionality
class BaseModelView(APIView):
    model = None
    serializer_class = None
    permission_classes = [IsAuthenticated]
    
    def get_object(self, property_id):
        try:
            obj = self.model.objects.get(id=property_id)
            if isinstance(obj, Room) and obj.property.user != self.request.user:
                raise Http404("Object not found.")
            elif isinstance(obj, Property) and obj.user != self.request.user:
                raise Http404("Object not found.")
            return obj
        except self.model.DoesNotExist:
            logger.warning(f"{self.model.__name__} with id {property_id} not found.")
            raise Http404("Object not found.")
        except Exception as e:
            logger.error(f"Error fetching object: {str(e)}")
            raise Http404("An unexpected error occurred.")
        
    def put(self, request, property_id):
        try:
            instance = self.get_object(property_id)
            serializer = self.serializer_class(instance, data=request.data, context={'request': request})
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except self.model.DoesNotExist:
            logger.warning(f"{self.model.__name__} with id {property_id} not found.")
            return Response({'error': 'Object not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error updating {self.model.__name__}: {str(e)}")
            return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, property_id):
        try:
            instance = self.get_object(property_id)
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        except self.model.DoesNotExist:
            logger.warning(f"{self.model.__name__} with id {property_id} not found.")
            return Response({'error': 'Object not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error deleting {self.model.__name__}: {str(e)}")
            return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # Updated `get` method to use `property_id` consistently
    def get(self, request, property_id=None):
        if property_id:
            instance = self.get_object(property_id)
            serializer = self.serializer_class(instance, context={'request': request})
        else:
            instances = self.model.objects.filter(user=request.user)
            serializer = self.serializer_class(instances, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Property View
class PropertyView(BaseModelView):
    model = Property
    serializer_class = PropertySerializer

# Room View
class RoomView(BaseModelView):
    model = Room
    serializer_class = RoomSerializer

    def get(self, request, pk=None, property_id=None):
        if property_id and not pk:  # List rooms for a property
            try:
                property_instance = Property.objects.get(id=property_id, user=request.user)
                rooms = self.model.objects.filter(property=property_instance)
                serializer = self.serializer_class(rooms, many=True)
                return Response(serializer.data)
            except Property.DoesNotExist:
                logger.warning(f"Property with id {property_id} not found for user {request.user.id}.")
                return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.error(f"Error listing rooms: {str(e)}")
                return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        elif pk:  # Get specific room by pk
            return super().get(request, pk)
        return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
    
    
    def post(self, request, property_id=None):
        """
        Adds a room to a specified property.
        """
        if property_id:
            try:
                property_instance = Property.objects.get(id=property_id, user=request.user)
            except Property.DoesNotExist:
                return Response({"error": "Property not found or you do not have access."}, status=status.HTTP_404_NOT_FOUND)

            room_serializer = self.serializer_class(data=request.data)
            if room_serializer.is_valid():
                room_serializer.save(property=property_instance)
                return Response(room_serializer.data, status=status.HTTP_201_CREATED)
            return Response(room_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return super().post(request)


    def put(self, request, property_id=None, room_id=None):
        logger.debug(f"Updating room with id {room_id} for property {property_id}")
        try:
            # Fetch the property instance to ensure the user has access
            property_instance = Property.objects.get(id=property_id, user=request.user)

            # Fetch the room instance
            room_instance = self.model.objects.get(pk=room_id, property=property_instance)

            # Update the room with the provided data
            serializer = self.serializer_class(room_instance, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Property.DoesNotExist:
            logger.warning(f"Property with id {property_id} not found for user {request.user.id}.")
            return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)

        except self.model.DoesNotExist:
            logger.warning(f"Room with id {room_id} not found in property {property_id}.")
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error updating room: {str(e)}")
            return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
    def delete(self, request, property_id=None, room_id=None):
        try:
            property_instance = Property.objects.get(id=property_id, user=request.user)
            room_instance = self.model.objects.get(pk=room_id, property=property_instance)
            room_instance.delete()
            return Response({'message': 'Room deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

        except Property.DoesNotExist:
            logger.warning(f"Property with id {property_id} not found for user {request.user.id}.")
            return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)

        except self.model.DoesNotExist:
            logger.warning(f"Room with id {room_id} not found in property {property_id}.")
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error deleting room: {str(e)}")
            return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    
        

class RoomAmenitiesView(APIView):
    serializer_class = RoomAmenitiesSerializer

    def get(self, request, pk=None, property_id=None, room_id=None):
        if room_id and property_id:
            try:
                # Get room instance to ensure it exists and belongs to the user
                room_instance = Room.objects.get(pk=room_id, property__id=property_id, property__user=request.user)
                amenities = RoomAmenities.objects.filter(room=room_instance)
                serializer = self.serializer_class(amenities, many=True)
                return Response(serializer.data)
            except Room.DoesNotExist:
                logger.warning(f"Room with id {room_id} or property with id {property_id} not found for user {request.user.id}.")
                return Response({'error': 'Room or property not found'}, status=status.HTTP_404_NOT_FOUND)
        elif pk:
            return self.retrieve_amenities(request, pk)
        return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve_amenities(self, request, pk):
        try:
            amenities = RoomAmenities.objects.get(pk=pk)
            serializer = self.serializer_class(amenities)
            return Response(serializer.data)
        except RoomAmenities.DoesNotExist:
            return Response({'error': 'Room amenities not found'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, property_id=None, room_id=None):
        try:
            property_instance = Property.objects.get(id=property_id, user=request.user)
            room_instance = Room.objects.get(pk=room_id, property=property_instance)
            
            # Create amenities without requiring `room` in request data
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                serializer.save(room=room_instance)  # Set room from URL
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except (Property.DoesNotExist, Room.DoesNotExist):
            return Response({'error': 'Property or room not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, property_id=None, room_id=None, pk=None):
        try:
            property_instance = Property.objects.get(id=property_id, user=request.user)
            room_instance = Room.objects.get(pk=room_id, property=property_instance)
            room_amenities_instance = RoomAmenities.objects.get(pk=pk, room=room_instance)
            
            # Update amenities data with partial updates allowed
            serializer = self.serializer_class(room_amenities_instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except (Property.DoesNotExist, Room.DoesNotExist, RoomAmenities.DoesNotExist):
            return Response({'error': 'Property, room, or amenities not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, property_id=None, room_id=None, pk=None):
        try:
            property_instance = Property.objects.get(id=property_id, user=request.user)
            room_instance = Room.objects.get(pk=room_id, property=property_instance)
            room_amenities_instance = RoomAmenities.objects.get(pk=pk, room=room_instance)

            room_amenities_instance.delete()
            return Response({'message': 'Room amenities deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

        except (Property.DoesNotExist, Room.DoesNotExist, RoomAmenities.DoesNotExist):
            return Response({'error': 'Property, room, or amenities not found'}, status=status.HTTP_404_NOT_FOUND)

        except Property.DoesNotExist:
            logger.warning(f"Property with id {property_id} not found for user {request.user.id}.")
            return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)

        except Room.DoesNotExist:
            logger.warning(f"Room with id {room_id} not found in property {property_id}.")
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

        except RoomAmenities.DoesNotExist:
            logger.warning(f"Room amenities with id {pk} not found for room {room_id}.")
            return Response({'error': 'Room amenities not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error deleting room amenities: {str(e)}")
            return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)      


# Property Detail View
class PropertyDetailView(APIView):
    def put(self, request, property_id):
        try:
            property_instance = Property.objects.get(id=property_id, user=request.user)  # Ensure the user owns the property
        except Property.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = PropertySerializer(property_instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# URL to View Mapping
property_list = PropertyView.as_view()
property_detail = PropertyView.as_view()
room_list = RoomView.as_view()
room_detail = RoomView.as_view()
room_amenities_list = RoomAmenitiesView.as_view()
room_amenities_detail = RoomAmenitiesView.as_view()
