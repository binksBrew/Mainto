#tenants/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from .models import User, Tenant
from .serializers import UserSerializer, TenantSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from properties.serializers import RoomSerializer, RoomAmenitiesSerializer
from properties.models import Property, Room, RoomAmenities
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from datetime import date, timedelta




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    # Retrieve the refresh token from the request body instead of cookies
    refresh_token = request.data.get('refresh_token')
    if not refresh_token:
        return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = OutstandingToken.objects.get(token=refresh_token)
        
        # Ensure token belongs to the current user
        if token.user != request.user:
            return Response({'error': 'This token does not belong to the authenticated user.'}, status=status.HTTP_403_FORBIDDEN)
        
        BlacklistedToken.objects.create(token=token)
        
        # Clear the refresh token cookie on the client side (if any)
        response = Response({'message': 'Successfully logged out.'}, status=status.HTTP_205_RESET_CONTENT)
        response.delete_cookie('refresh_token')
        return response
        
    except OutstandingToken.DoesNotExist:
        return Response({'error': 'Token does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
    
    

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def available_rooms(request, property_id):
#     # Get rooms in the property
#     rooms = Room.objects.filter(property_id=property_id)
#     available_rooms = []
    
#     for room in rooms:
#         # Count the number of active tenants in the room
#         active_tenants_count = Tenant.objects.filter(room=room, rental_status='active').count()
        
#         # Add room to the available list if there are unoccupied beds
#         if active_tenants_count < room.total_beds:
#             available_rooms.append({
#                 'id': room.id,
#                 'room_number': room.room_number,
#                 'available_beds': room.total_beds - active_tenants_count,
#             })
    
#     return Response(available_rooms)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_rooms(request, property_id):
    property_instance = get_object_or_404(Property, id=property_id, user=request.user)
    rooms = Room.objects.filter(property=property_instance)
    available_rooms = []
    for room in rooms:
        active_tenants_count = Tenant.objects.filter(room=room, rental_status='active').count()
        if active_tenants_count < room.total_beds:
            available_rooms.append({
                'id': room.id,
                'room_number': room.room_number,
                'available_beds': room.total_beds - active_tenants_count,
            })
    return Response(available_rooms)





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overdue_tenants(request, property_id):
    property_instance = get_object_or_404(Property, id=property_id)
    overdue_tenants = Tenant.objects.filter(room__property=property_instance).filter(
        last_payment_date__lt=date.today() - timedelta(days=30), rental_status='active'
    )
    serializer = TenantSerializer(overdue_tenants, many=True)
    return Response(serializer.data)








# Custom Token View with user_id included in response
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # Call the parent class's `post` method to get the standard response
        response = super().post(request, *args, **kwargs)
        
        # Add user details to the response if the status code is 200
        if response.status_code == 200:
            user = get_user_model().objects.get(email=request.data.get('email'))
            # Add user information to the response data
            response.data['user'] = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                # You can add more user fields here if needed
            }
        return response
    # def post(self, request, *args, **kwargs):
    #     response = super().post(request, *args, **kwargs)
    #     if response.status_code == 200:
    #         response.data['user_id'] = request.user.id
    #     return response

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def user_register(request):
#     serializer = UserSerializer(data=request.data)
#     if serializer.is_valid():
#         user = serializer.save()
#         refresh = RefreshToken.for_user(user)
#         access_token = str(refresh.access_token)

#         response = Response({
#             'access': access_token,
#             'user': UserSerializer(user).data
#         }, status=status.HTTP_201_CREATED)
#         response.set_cookie('refresh_token', str(refresh), httponly=True, secure=False, samesite='Lax')
#         return response
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def user_register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        response = Response({
            'access': access_token,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
        response.set_cookie('refresh_token', str(refresh), httponly=True, secure=False, samesite='Lax')
        return response
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)






@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def user_list(request):
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def user_detail(request, pk):
    user = get_object_or_404(User, pk=pk)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# @api_view(['GET', 'POST'])
# @permission_classes([IsAuthenticated])
# def tenant_list(request, property_id):
#     property_instance = get_object_or_404(Property, id=property_id)

#     if request.method == 'GET':
#         tenants = Tenant.objects.filter(room__property=property_instance)
#         serializer = TenantSerializer(tenants, many=True)
#         return Response(serializer.data)

#     elif request.method == 'POST':
#         serializer = TenantSerializer(data=request.data, context={'property': property_instance, 'user': request.user})
#         if serializer.is_valid():
#             # Room instance fetching and creation logic is handled in the serializer
#             tenant = serializer.save()
#             return Response(TenantSerializer(tenant).data, status=status.HTTP_201_CREATED)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def tenant_list(request, property_id):
    property_instance = get_object_or_404(Property, id=property_id, user=request.user)

    if request.method == 'GET':
        tenants = Tenant.objects.filter(room__property=property_instance)
        serializer = TenantSerializer(tenants, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TenantSerializer(data=request.data, context={'property': property_instance, 'user': request.user})
        if serializer.is_valid():
            tenant = serializer.save()
            return Response(TenantSerializer(tenant).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





# @api_view(['GET', 'PUT', 'DELETE'])
# @permission_classes([IsAuthenticated])
# def tenant_detail(request, property_id=None, tenant_id=None):
#     if request.user.role == 'admin':
#         tenant = get_object_or_404(Tenant, pk=tenant_id)
#     else:
#         tenant = get_object_or_404(Tenant, pk=tenant_id, user=request.user)

#     if request.method == 'GET':
#         serializer = TenantSerializer(tenant)
#         return Response(serializer.data)

#     elif request.method == 'PUT':
#         room_number = request.data.get('room_number')  # Fetching room_number instead of room_selected
#         if room_number:
#             room = get_object_or_404(Room, room_number=room_number, property_id=property_id)
#             # Set room field directly, since you want to store room_number
#             request.data['room'] = room.id

#         serializer = TenantSerializer(tenant, data=request.data, context={'property': tenant.room.property}, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     elif request.method == 'DELETE':
#         tenant.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def tenant_detail(request, property_id, tenant_id):
    property_instance = get_object_or_404(Property, id=property_id, user=request.user)
    tenant = get_object_or_404(Tenant, pk=tenant_id, room__property=property_instance)

    if request.method == 'GET':
        serializer = TenantSerializer(tenant)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = TenantSerializer(tenant, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        tenant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_form_options(request):
    return Response({
        'roles': ['admin', 'manager'],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tenant_form_options(request):
    return Response({
        'rental_status': ['active', 'inactive'],
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tenants_token_view(request):
    refresh = RefreshToken.for_user(request.user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    }, status=status.HTTP_200_OK)
    
    
    
# List and create rooms for a specific property
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def room_list(request, property_id):
    property_instance = get_object_or_404(Property, id=property_id, user=request.user)

    if request.method == 'GET':
        rooms = Room.objects.filter(property=property_instance)
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(property=property_instance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Retrieve, update, or delete a specific room
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def room_detail(request, property_id, room_id):
    property_instance = get_object_or_404(Property, id=property_id, user=request.user)
    room = get_object_or_404(Room, id=room_id, property=property_instance)

    if request.method == 'GET':
        serializer = RoomSerializer(room)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = RoomSerializer(room, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)    
    
    






    
    
    
    
    
    
    