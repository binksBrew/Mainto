import React, { useState, useEffect } from 'react';
import './AddProperty.css';
import Header from './Header';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const AddProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [propertyType, setPropertyType] = useState('commercial');
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerContact, setManagerContact] = useState('');
  const [propertyImage, setPropertyImage] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (id) {
      const fetchPropertyDetails = async () => {
        try {
          const response = await axiosInstance.get(`/properties/${id}/`);
          const property = response.data;
          setPropertyName(property.property_name);
          setPropertyAddress(property.property_address);
          setManagerName(property.manager_name);
          setManagerContact(property.manager_contact);
          setPropertyType(property.property_type);

          const roomsResponse = await axiosInstance.get(`/properties/${id}/rooms/`);
          const roomsData = roomsResponse.data;
          setRooms(roomsData.map(room => ({
            id: room.id,
            roomNumber: room.room_number,
            totalBeds: room.total_beds,
            amenities_id: room.amenities_id,
            bathrooms: room.amenities?.bathrooms || false,
            kitchen: room.amenities?.kitchen || false,
            livingArea: room.amenities?.living_area || false,
            diningArea: room.amenities?.dining_area || false,
            workspace: room.amenities?.workspace || false,
            parking: room.amenities?.parking || false,
            securityFeatures: room.amenities?.security_features || false,
            communityFacilities: room.amenities?.community_facilities || false,
          })));
        } catch (error) {
          console.error("Error fetching property details:", error);
        }
      };

      fetchPropertyDetails();
    }
  }, [id]);

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = rooms.map((room, i) =>
      i === index ? { ...room, [field]: value } : room
    );
    setRooms(updatedRooms);
  };

  const addRoom = () => {
    setRooms([...rooms, {
      id: null,
      roomNumber: '',
      totalBeds: '',
      amenities_id: null,
      bathrooms: false,
      kitchen: false,
      livingArea: false,
      diningArea: false,
      workspace: false,
      parking: false,
      securityFeatures: false,
      communityFacilities: false,
    }]);
  };

  const deleteRoom = async (index) => {
    const room = rooms[index];

    // If the room has an ID, it exists in the backend, so delete it there too
    if (room.id) {
      try {
        await axiosInstance.delete(`/properties/${id}/rooms/${room.id}/`);
      } catch (error) {
        console.error("Error deleting room:", error);
        setErrorMessage("Error deleting room from the server.");
        return;
      }
    }

    // Remove the room from the frontend
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  const validateRooms = () => {
    const roomNumbers = rooms.map(room => room.roomNumber);
    const hasDuplicates = new Set(roomNumbers).size !== roomNumbers.length;

    if (hasDuplicates) {
      setErrorMessage("Each room must have a unique room number.");
      return false;
    }

    for (const room of rooms) {
      if (!room.roomNumber || !room.totalBeds) {
        setErrorMessage("Please fill out all required fields for each room.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateRooms()) return;

    const formData = new FormData();
    formData.append('property_name', propertyName);
    formData.append('property_address', propertyAddress);
    formData.append('manager_name', managerName);
    formData.append('manager_contact', managerContact);
    formData.append('property_type', propertyType);
    if (propertyImage) {
      formData.append('property_image', propertyImage);
    }

    try {
      const response = id
        ? await axiosInstance.put(`/properties/${id}/`, formData)
        : await axiosInstance.post("/properties/", formData);

      const property = response.data;

      await Promise.all(
        rooms.map(async (room) => {
          const roomData = {
            room_number: room.roomNumber,
            total_beds: room.totalBeds,
          };

          if (room.id) {
            await axiosInstance.put(`/properties/${property.id}/rooms/${room.id}/`, roomData);
          } else {
            const roomResponse = await axiosInstance.post(`/properties/${property.id}/rooms/`, roomData);
            room.id = roomResponse.data.id;
          }

          const amenitiesData = {
            bathrooms: room.bathrooms,
            kitchen: room.kitchen,
            living_area: room.livingArea,
            dining_area: room.diningArea,
            workspace: room.workspace,
            parking: room.parking,
            security_features: room.securityFeatures,
            community_facilities: room.communityFacilities,
          };

          const amenitiesEndpoint = room.amenities_id
            ? `/properties/${property.id}/rooms/${room.id}/room-amenities/${room.amenities_id}/`
            : `/properties/${property.id}/rooms/${room.id}/room-amenities/`;

          if (room.amenities_id) {
            await axiosInstance.put(amenitiesEndpoint, amenitiesData);
          } else {
            const amenitiesResponse = await axiosInstance.post(amenitiesEndpoint, amenitiesData);
            room.amenities_id = amenitiesResponse.data.id;
          }
        })
      );

      navigate('/properties');
    } catch (error) {
      console.error("Error saving property:", error);
      setErrorMessage("Error saving property or room. Please check for duplicate room numbers.");
    }
  };

  return (
    <div className="add-property-container">
      <Header />
      <form onSubmit={handleSubmit}>
        <h2>{id ? 'Edit Property' : 'Add Property'}</h2>
        <div className="property-type-select">
          <label>Property Type:</label>
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            <option value="commercial">Commercial</option>
            <option value="residential">Residential</option>
          </select>
        </div>
        <div className="property-details">
          <label>Property Name:</label>
          <input
            type="text"
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            required
          />
        </div>
        <div className="property-details">
          <label>Property Address:</label>
          <input
            type="text"
            value={propertyAddress}
            onChange={(e) => setPropertyAddress(e.target.value)}
            required
          />
        </div>
        <div className="property-details">
          <label>Manager Name:</label>
          <input
            type="text"
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            required
          />
        </div>
        <div className="property-details">
          <label>Manager Contact:</label>
          <input
            type="text"
            value={managerContact}
            onChange={(e) => setManagerContact(e.target.value)}
            required
          />
        </div>
        <div className="property-image-upload">
          <label className="image-upload-label">
            Property Image:
            <input
              className="image-input"
              type="file"
              accept="image/*"
              onChange={(e) => setPropertyImage(e.target.files[0])}
            />
          </label>
        </div>
        <div className="room-details">
          <h3>Rooms</h3>
          {rooms.map((room, index) => (
            <div key={index} className="room-section">
              <h4>Room {index + 1}</h4>
              <div className="room-asset">
                <label>Room Number:</label>
                <input
                  type="text"
                  value={room.roomNumber}
                  onChange={(e) => handleRoomChange(index, 'roomNumber', e.target.value)}
                  required
                />
              </div>
              <div className="room-asset">
                <label>Total Beds:</label>
                <input
                  type="number"
                  value={room.totalBeds}
                  onChange={(e) => handleRoomChange(index, 'totalBeds', e.target.value)}
                  required
                />
              </div>
              <div className="room-assets">
                {["bathrooms", "kitchen", "livingArea", "diningArea", "workspace", "parking", "securityFeatures", "communityFacilities"].map((amenity) => (
                  <label key={amenity} className="room-checkbox">
                    <input
                      type="checkbox"
                      checked={room[amenity]}
                      onChange={(e) => handleRoomChange(index, amenity, e.target.checked)}
                    />
                    <span>{amenity.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
              <button type="button" className="delete-button" onClick={() => deleteRoom(index)}>Delete Room</button>
            </div>
          ))}
          <button type="button" className="add-room-button" onClick={addRoom}>Add Room</button>
        </div>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button type="submit" className="submit-button">{id ? 'Update Property' : 'Add Property'}</button>
      </form>
    </div>
  );
};

export default AddProperty;