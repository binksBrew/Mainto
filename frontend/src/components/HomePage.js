// src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import axiosInstance from '../axiosInstance';
import ExpenseForm from './ExpenseForm';
import './HomePage.css';

import propertiesIcon from '../assets/icons/properties.svg';
import tenantsIcon from '../assets/icons/tenants.svg';
import collectionsIcon from '../assets/icons/collections.svg';
import expensesIcon from '../assets/icons/expenses.svg';
import analyticsIcon from '../assets/icons/analytics.svg';
import subscriptionIcon from '../assets/icons/subscription.svg';
import propertySmallIcon from '../assets/images/property-img-dropdown.png';

const HomePage = () => {
  const [activeSection, setActiveSection] = useState('tenant');
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    localStorage.getItem('selectedProperty') || ''
  );
  const [selectedPropertyImage, setSelectedPropertyImage] = useState(propertySmallIcon);
  const navigate = useNavigate();
  const firstName = localStorage.getItem('first_name') || 'Admin!';

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axiosInstance.get('/properties/');
        const data = response.data;
        setProperties(data);
        if (!selectedPropertyId && data.length > 0) {
          setSelectedPropertyId(data[0].id);
          setSelectedPropertyImage(data[0].image || propertySmallIcon);
          localStorage.setItem('selectedProperty', data[0].id);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };
    fetchProperties();
  }, [selectedPropertyId]);

  useEffect(() => {
    const fetchTenants = async () => {
      if (!selectedPropertyId) return;

      try {
        const response = await axiosInstance.get(`/properties/${selectedPropertyId}/tenants/`);
        setTenants(response.data);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      }
    };
    fetchTenants();
  }, [selectedPropertyId]);

  const fetchExpenses = async () => {
    if (!selectedPropertyId) return;

    try {
      const response = await axiosInstance.get(`/properties/${selectedPropertyId}/expenses/`);
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    if (activeSection === 'expense') {
      fetchExpenses();
    }
  }, [selectedPropertyId, activeSection]);

  const handleToggle = (section) => {
    setActiveSection(section);
    setShowExpenseForm(false);
  };

  const handlePropertyChange = (propertyId) => {
    setSelectedPropertyId(propertyId);
    const selectedProp = properties.find((property) => property.id === propertyId);
    setSelectedPropertyImage(selectedProp?.image || propertySmallIcon);
    localStorage.setItem('selectedProperty', propertyId);
  };

  return (
    <div>
      <Header
        selectedPropertyId={selectedPropertyId}
        onPropertyChange={handlePropertyChange}
      />
      <div className="homepage-container">
        <div className="welcome-section">
          <h2>Hi <strong>{firstName}</strong></h2>
        </div>

        <div className="property-dropdown">
          <div className="property-header">
            <img src={selectedPropertyImage} alt="Property" className="property-image" />
            <select
              value={selectedPropertyId}
              onChange={(e) => handlePropertyChange(e.target.value)}
              className="property-select"
            >
              <option value="">Select the property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.property_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="features-section">
          <div className="card-grid">
            <Link to="/properties" className="feature-card">
              <img src={propertiesIcon} alt="Properties Icon" />
              <p>Properties</p>
            </Link>
            <Link to={`/addtenants/${selectedPropertyId}`} className="feature-card">
              <img src={tenantsIcon} alt="Tenants Icon" />
              <p>Tenants</p>
            </Link>
            <Link to={`/pendings/${selectedPropertyId}`} className="feature-card">
              <img src={collectionsIcon} alt="Rent Pending Icon" />
              <p>Pending Rent</p>
            </Link>
            <Link to={`/properties/${selectedPropertyId}/expenses`} className="feature-card">
              <img src={expensesIcon} alt="Expenses Icon" />
              <p>Expenses</p>
            </Link>
            <Link to="/analytics" className="feature-card">
              <img src={analyticsIcon} alt="Analytics Icon" />
              <p>Analytics</p>
            </Link>
            <Link to="/subscription" className="feature-card">
              <img src={subscriptionIcon} alt="Subscription Icon" />
              <p>Subscription</p>
            </Link>
          </div>
        </div>

        <div className="tenants-expense-section">
          <div className="toggle-buttons">
            <button
              className={activeSection === 'tenant' ? 'active' : ''}
              onClick={() => handleToggle('tenant')}
            >
              Tenant
            </button>
            <button
              className={activeSection === 'expense' ? 'active' : ''}
              onClick={() => handleToggle('expense')}
            >
              Expense
            </button>
          </div>

          <div className="toggle-content">
            {activeSection === 'tenant' ? (
              <div id="tenant-list">
                <h3>Tenants List</h3>
                <ul>
                  {tenants.map((tenant) => (
                    <li key={tenant.id}>
                      <Link to={`/addtenants/${selectedPropertyId}/${tenant.id}`}>
                        {tenant.tenant_first} {tenant.tenant_surname}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div id="expense-content">
                {showExpenseForm ? (
                  <ExpenseForm
                    propertyId={selectedPropertyId}
                    onExpenseAdded={() => {
                      setShowExpenseForm(false);
                      fetchExpenses();
                    }}
                    showHeader={false}
                  />
                ) : (
                  <div>
                    <button
                      onClick={() => setShowExpenseForm(true)}
                      style={{
                        marginBottom: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      Add New Expense
                    </button>
                    <h3>Expenses List</h3>
                    <ul className="expense-list">
                      {expenses.length > 0 ? (
                        expenses.map((expense) => (
                          <li key={expense.id} className="expense-item">
                            <Link to={`/properties/${selectedPropertyId}/expenses/${expense.id}`} className="expense-link">
                              <div className="expense-info">
                                <p className="expense-name">{expense.name}</p>
                                <p className="expense-details"><span className="expense-label">Date:</span> {expense.date_incurred}</p>
                                <p className="expense-details"><span className="expense-label">Amount:</span> ${expense.amount}</p>
                                <p className="expense-details"><span className="expense-label">Location:</span> {expense.location}</p>
                              </div>
                            </Link>
                          </li>
                        ))
                      ) : (
                        <p>No expenses found for this property.</p>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
