// src/components/ExpensePage.js
import React, { useState, useEffect } from 'react';
import Header from './Header';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import axiosInstance from '../axiosInstance';

const Expenses = () => {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(localStorage.getItem('selectedProperty') || '');
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.warn("No access token found. Redirecting to sign-in may be required.");
        return;
      }

      try {
        const response = await axiosInstance.get('/properties/');
        const data = response.data;
        setProperties(data);
        // Set the default selected property if none is set
        if (!selectedPropertyId && data.length > 0) {
          setSelectedPropertyId(data[0].id);
          localStorage.setItem('selectedProperty', data[0].id);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!selectedPropertyId) return;

      try {
        const response = await axiosInstance.get(`/properties/${selectedPropertyId}/expenses/`);
        setExpenses(response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, [selectedPropertyId]);

  const handlePropertyChange = (e) => {
    const propertyId = e.target.value;
    setSelectedPropertyId(propertyId);
    localStorage.setItem('selectedProperty', propertyId); // Store in local storage
  };

  return (
    <div>
      <Header /> {/* Render Header component at the top */}
      <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center'  }}>
        <h2 style={{ textAlign: 'center' }}>Expense Management</h2>
        <select
          value={selectedPropertyId}
          onChange={handlePropertyChange}
          style={{
            padding: '14px 18px', // Adjust padding for a more spacious look
            fontSize: '16px',
            margin: '10px 0',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            outline: 'none', // To remove default outline
          }}
        >
          <option value="">Select a property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.property_name}
            </option>
          ))}
        </select>
      </div>

      {selectedPropertyId ? (
        <>
          <ExpenseForm propertyId={selectedPropertyId} onExpenseAdded={(newExpense) => setExpenses([newExpense, ...expenses])} />
          <ExpenseList expenses={expenses} />
        </>
      ) : (
        <p>Please select a property to manage expenses.</p>
      )}
    </div>
  );
};

export default Expenses;
