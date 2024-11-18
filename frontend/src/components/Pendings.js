import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header'; // Import Header component
import './Pendings.css';

const Pendings = () => {
  const { propertyId } = useParams();
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(propertyId || null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Fetch properties for dropdown
  useEffect(() => {
    const fetchProperties = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/properties/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProperties(data);
          if (!selectedProperty && data.length > 0) {
            setSelectedProperty(data[0].id); // Set default selected property if not already set
          }
        } else {
          setErrorMessage("Failed to fetch properties.");
        }
      } catch (error) {
        setErrorMessage("Error fetching properties: " + error.message);
      }
    };

    fetchProperties();
  }, [selectedProperty]);

  // Fetch tenants with pending rent for the selected property
  useEffect(() => {
    const fetchTenantsWithPendingRent = async () => {
      const token = localStorage.getItem("access_token");
      if (!token || !selectedProperty) {
        setErrorMessage("User not authenticated or no property selected.");
        return;
      }

      try {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + `/properties/${selectedProperty}/tenants/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const tenantsWithPendingRent = data.filter(tenant => tenant.pending_rent > 0);
          setTenants(tenantsWithPendingRent);
        } else {
          setErrorMessage("Failed to fetch tenants with pending rent.");
        }
      } catch (error) {
        setErrorMessage("Error fetching tenants with pending rent: " + error.message);
      }
    };

    fetchTenantsWithPendingRent();
  }, [selectedProperty]);

  const handleTenantClick = (tenantId) => {
    navigate(`/addtenants/${selectedProperty}/${tenantId}`);
  };

  return (
    <div>
      <Header />
      <div className="pendings-container">
        
        {/* Property selection dropdown */}
        <div className="property-dropdown">
          <div className="property-header">
            {/* Update the image path or use a placeholder if image is optional */}
            <img src="/path/to/propertySmallIcon.png" alt="Property" className="property-image" />
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="property-select"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.property_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2>Tenants with Pending Rent</h2>
        {errorMessage && <div className="error">{errorMessage}</div>}
        <table className="pendings-table">
          <thead>
            <tr>
              <th>Tenant Name</th>
              <th>Pending Rent</th>
              <th>Overdue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td>{tenant.tenant_first} {tenant.tenant_surname}</td>
                <td>${parseFloat(tenant.pending_rent).toFixed(2)}</td>
                <td>{tenant.is_overdue ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => handleTenantClick(tenant.id)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pendings;
