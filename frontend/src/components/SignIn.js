// src/components/SignIn.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance'; // Make sure this points to your axios instance file
import './Auth.css';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Utility function to set multiple items in localStorage
  const setLocalStorage = (data) => {
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear any previous error messages

    try {
      // Send login request
      const response = await axiosInstance.post('/accounts/login/', { email, password });
      console.log('Login response:', response);

      const { access, refresh, user } = response.data; // Destructure response

      // Store tokens and user information
      setLocalStorage({
        access_token: access,
        refresh_token: refresh,
        user_id: user?.id || '', // Ensure a fallback for user_id if not present
      });

      // Remember the email if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem('email', email);
      }

      // Set Authorization header for future requests
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      // Redirect to the home page
      navigate('/home');
    } catch (error) {
      // Detailed error handling
      if (error.response && error.response.status === 401) {
        setErrorMessage('Incorrect email or password.');
      } else {
        setErrorMessage('An error occurred. Please try again later.');
      }
      console.error('Login error:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome to Mainto</h2>
        <p>Enter your email & password to sign in</p>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Password"
          />
          <div className="remember-forgot">
            <label>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              /> Remember me
            </label>
            {/* <Link to="#">Forgot Password?</Link> */}
          </div>
          <button type="submit">Sign In</button>
        </form>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
