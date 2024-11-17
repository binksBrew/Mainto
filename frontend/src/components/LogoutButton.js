// src/components/LogoutButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');

      // Send the refresh token to the server to log out
      const response = await axiosInstance.post('/logout/', { refresh_token: refreshToken });
      console.log('Logout response:', response.data);

      // Clear the tokens from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');

      // Redirect to the sign-in page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      if (error.response) {
        console.log('Error response data:', error.response.data);
      }
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Log Out
    </button>
  );
};

export default LogoutButton;
