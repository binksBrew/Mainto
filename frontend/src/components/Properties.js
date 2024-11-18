import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from './Header'; // Custom top navigation
import './Properties.css'; // Custom styles

const Properties = () => {
  const [properties, setProperties] = useState([]);

  // Fetch properties from the backend
  useEffect(() => {
    const fetchProperties = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return; // No token found

      try {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/properties/", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProperties(data); // Assuming the API returns a list of properties
        } else {
          console.error("Failed to fetch properties");
        }
      } catch (error) {
        console.error("Error occurred while fetching properties:", error);
      }
    };

    fetchProperties();
  }, []);

  // Function to handle property deletion
  const handleDelete = async (id) => {
    const token = localStorage.getItem("access_token");
    if (!token) return; // No token found
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone."))


    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + `/properties/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProperties(properties.filter(property => property.id !== id));
        console.log("Property deleted successfully.");
      } else {
        console.error("Failed to delete property");
      }
    } catch (error) {
      console.error("Error occurred while deleting property:", error);
    }
  };

  return (
    <div className="properties-listing-container">
      <Header />
      <h2 className="listing-title">Properties List</h2>
      <Link to="/addproperty" className="add-property-button">Add Property</Link>
      
      <div className="properties-grid">
        {properties.map(property => (
          <Link
            to={`/addproperty/${property.id}`}
            key={property.id}
            className="property-card-link"
          >
            <div className="property-card">
              <img src={property.property_image} alt={property.property_name} className="property-image" />
              <h3 className="property-name">{property.property_name}</h3>
              <p className="property-address">{property.property_address}</p>
              <p className="property-manager">Managed by: {property.manager_name}</p>
              <button
                onClick={(e) => {
                  e.preventDefault(); // Prevents the link from being followed
                  handleDelete(property.id);
                }}
                className="delete-property-button"
              >
                Delete
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Properties;
