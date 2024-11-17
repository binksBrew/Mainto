// src/components/ExpenseForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import Header from './Header';
import './ExpenseForm.css';

const ExpenseForm = ({ propertyId, onExpenseAdded = () => {}, onExpenseUpdated = () => {}, showHeader = true }) => {
  const { propertyId: paramPropertyId, expenseId } = useParams();
  const actualPropertyId = propertyId || paramPropertyId;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    supervisor: '',
    location: '',
    amount: '',
    date_incurred: '',
    description: '',
  });
  const [document, setDocument] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (expenseId) {
      const fetchExpense = async () => {
        try {
          const response = await axiosInstance.get(`/properties/${actualPropertyId}/expenses/${expenseId}/`);
          setFormData({
            name: response.data.name,
            supervisor: response.data.supervisor,
            location: response.data.location,
            amount: response.data.amount,
            date_incurred: response.data.date_incurred,
            description: response.data.description,
          });
        } catch (error) {
          console.error("Error fetching expense:", error);
          setErrorMessage('Failed to load expense data.');
        }
      };
      fetchExpense();
    }
  }, [expenseId, actualPropertyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setDocument(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const expenseData = new FormData();
    Object.keys(formData).forEach((key) => {
      expenseData.append(key, formData[key]);
    });
    if (document) {
      expenseData.append('document', document);
    }

    try {
      const response = expenseId
        ? await axiosInstance.put(`/properties/${actualPropertyId}/expenses/${expenseId}/`, expenseData)
        : await axiosInstance.post(`/properties/${actualPropertyId}/expenses/`, expenseData);

      if (expenseId) {
        onExpenseUpdated(response.data);
        setSuccessMessage('Expense updated successfully!');
      } else {
        onExpenseAdded(response.data);
        setSuccessMessage('Expense added successfully!');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      navigate(`/properties/${actualPropertyId}/expenses`);
    } catch (error) {
      console.error('Failed to submit expense:', error);
      setErrorMessage('Failed to submit expense. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
      try {
        await axiosInstance.delete(`/properties/${actualPropertyId}/expenses/${expenseId}/`);
        setSuccessMessage("Expense deleted successfully!");
        navigate(`/properties/${actualPropertyId}/expenses`);
      } catch (error) {
        console.error("Error deleting expense:", error);
        setErrorMessage('Failed to delete expense. Please try again.');
      }
    }
  };

  return (
    <div className="expense-form-container">
      {showHeader && <Header />}
      <form onSubmit={handleSubmit} className="expense-form">
        <h2>{expenseId ? 'Edit Expense' : 'Add Expense'}</h2>
        {successMessage && <p className="success">{successMessage}</p>}
        {errorMessage && <p className="error">{errorMessage}</p>}

        <div className="form-group">
          <label>Expense Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Supervisor:</label>
          <input
            type="text"
            name="supervisor"
            value={formData.supervisor}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Amount:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Date Incurred:</label>
          <input
            type="date"
            name="date_incurred"
            value={formData.date_incurred}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="upload-label">
            Upload Document
            <input
              type="file"
              name="document"
              onChange={handleFileChange}
              className="document-input"
            />
          </label>
        </div>

        <div className="button-container">
          <button type="submit" className="submit-button">
            {expenseId ? 'Update Expense' : 'Add Expense'}
          </button>
          {expenseId && (
            <button type="button" onClick={handleDelete} className="delete-button">
              Delete Expense
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
