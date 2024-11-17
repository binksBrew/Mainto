import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import './AdminPage.css';

const AdminPage = () => {
  const [counts, setCounts] = useState({ properties: 0, tenants: 0, expenses: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Fetch counts for properties, tenants, and expenses
        const countsResponse = await axiosInstance.get('/admin_api/counts/');
        setCounts(countsResponse.data);

        // Fetch all users
        const usersResponse = await axiosInstance.get('/admin_api/users/');
        setUsers(usersResponse.data);

        setLoading(false);
      } catch (error) {
        setErrorMessage('Failed to load admin data. Please try again.');
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/admin_api/users/${userId}/`);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        setErrorMessage('Failed to delete user.');
      }
    }
  };

  if (loading) {
    return <p>Loading data...</p>;
  }

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="admin-stats">
        <div className="stat-card">
          <h2>{counts.properties}</h2>
          <p>Total Properties</p>
        </div>
        <div className="stat-card">
          <h2>{counts.tenants}</h2>
          <p>Total Tenants</p>
        </div>
        <div className="stat-card">
          <h2>{counts.expenses}</h2>
          <p>Total Expenses</p>
        </div>
      </div>

      <h2>Users Management</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button
                  className="delete-button"
                  onClick={() => handleUserDelete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
