import axios from 'axios';

// Set up the axios instance with your backend URL
const api = axios.create({
  baseURL: 'http://localhost:8000',  // Django backend URL
  headers: { 'Content-Type': 'application/json' }
});

// Function to set Authorization header
export const setAuthToken = token => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Interceptor for refreshing tokens
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await api.post('/token/refresh/', { refresh: refreshToken });
        localStorage.setItem('access_token', data.access);
        setAuthToken(data.access);
        originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.log('Refresh token expired, please log in again.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
