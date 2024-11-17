// src/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/', // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set token in headers
export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// Set initial token if available
const token = localStorage.getItem('access_token');
if (token) setAuthToken(token);

// Interceptor to handle 401 errors and remove invalid tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Remove invalid tokens and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
      window.location.href = '/'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
