// src/components/ExpenseList.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import './ExpenseList.css';

const ExpenseList = ({ propertyId }) => {
  const { propertyId: paramPropertyId } = useParams();
  const actualPropertyId = propertyId || paramPropertyId;
  const [expenses, setExpenses] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!actualPropertyId) return;

      try {
        const response = await axiosInstance.get(`/properties/${actualPropertyId}/expenses/`);
        setExpenses(response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setErrorMessage('Failed to load expenses. Please try again later.');
      }
    };

    fetchExpenses();
  }, [actualPropertyId]);

  // Handle deletion of an expense
  const handleDelete = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await axiosInstance.delete(`/properties/${actualPropertyId}/expenses/${expenseId}/`);
        setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== expenseId));
      } catch (error) {
        console.error("Error deleting expense:", error);
        setErrorMessage('Failed to delete the expense. Please try again.');
      }
    }
  };

  return (
    <div className="expense-list-container">
      <h2 className="expense-list-title">Expenses</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {expenses.length > 0 ? (
        <ul className="expense-list">
          {expenses.map((expense) => (
            <li key={expense.id} className="expense-item">
              <Link to={`/properties/${actualPropertyId}/expenses/${expense.id}`} className="expense-link">
                <div className="expense-info">
                  <h3 className="expense-name">{expense.name}</h3>
                  <p className="expense-details"><span className="expense-label">Date:</span> {expense.date_incurred}</p>
                  <p className="expense-details"><span className="expense-label">Amount:</span> ${expense.amount}</p>
                  <p className="expense-details"><span className="expense-label">Location:</span> {expense.location}</p>
                </div>
              </Link>
              <button 
                className="delete-button" 
                onClick={() => handleDelete(expense.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-expenses-message">No expenses found for this property.</p>
      )}
    </div>
  );
};

export default ExpenseList;
