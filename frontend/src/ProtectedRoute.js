// src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const isTokenValid = (token) => {
  // Optionally, add logic here to decode and check token expiration
  return Boolean(token);  // Basic check for token existence
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token'); // Retrieve token from localStorage

  if (!isTokenValid(token)) {
    // Redirect to sign-in page if no valid token
    return <Navigate to="/" replace />;
  }

  // Render protected content if token is valid
  return children;
};

export default ProtectedRoute;
