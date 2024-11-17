// src/components/Header.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import logoImg from '../assets/images/Logo.svg';

const Header = ({ selectedPropertyId: initialSelectedPropertyId, onPropertyChange }) => {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialSelectedPropertyId);
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.warn("No access token found. Redirecting to sign-in may be required.");
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/properties/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProperties(data);
          if (!selectedPropertyId && data.length > 0) {
            const defaultPropertyId = data[0].id;
            setSelectedPropertyId(defaultPropertyId);
            onPropertyChange && onPropertyChange(defaultPropertyId);
          }
        } else {
          console.error('Failed to fetch properties. Please ensure the token is valid.');
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, [selectedPropertyId, onPropertyChange]);

  const handlePropertySelect = (e) => {
    const propertyId = e.target.value;
    setSelectedPropertyId(propertyId);
    onPropertyChange && onPropertyChange(propertyId);
    localStorage.setItem('selectedProperty', propertyId);
  };

  useEffect(() => {
    if (selectedPropertyId && !localStorage.getItem('visitedOnce')) {
      navigate(`/properties/${selectedPropertyId}/expenses`);
      localStorage.setItem('visitedOnce', 'true');
    }
  }, [selectedPropertyId, navigate]);

  return (
    <div className="header">
      <div className="logo-title">
        <img src={logoImg} alt="Logo" className="logo" />
        <h2 className="title">Mainto</h2>
      </div>

      {/* <div className="property-dropdown">
        <select
          value={selectedPropertyId || ''}
          onChange={handlePropertySelect}
          className="property-select"
        >
          <option value="">Select a property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.property_name}
            </option>
          ))}
        </select>
      </div> */}

      <div className="nav-links">
        <Link to="/home">Home</Link>
        {selectedPropertyId && (
          <>
            <Link to={`/pendings/${selectedPropertyId}`}>Pendings</Link>
            <Link to={`/properties/${selectedPropertyId}/expenses`}>Expenses</Link>
          </>
        )}
        {userId ? (
          <Link to={`/profile/${userId}`}>Profile</Link>
        ) : (
          <Link to="/">Sign In</Link>
        )}
      </div>
    </div>
  );
};

export default Header;
