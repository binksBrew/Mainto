// // src/components/Profile.js
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axiosInstance from '../axiosInstance'; // Ensure this points to your axios instance
// import Header from './Header'; // Import Header component
// import './Profile.css';

// const Profile = () => {
//   const [profile, setProfile] = useState({
//     username: '',
//     email: '',
//     role: '',
//     first_name: '',
//     last_name: ''
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const response = await axiosInstance.get('/profile/');
//         setProfile(response.data);
//       } catch (error) {
//         console.error('Error fetching profile:', error);
//         if (error.response && error.response.status === 401) {
//           navigate('/'); // Redirect to login if unauthorized
//         } else {
//           setError('Failed to fetch profile data.');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [navigate]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setProfile((prevProfile) => ({
//       ...prevProfile,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSuccessMessage('');
//     setError('');
//     try {
//       const response = await axiosInstance.put('/profile/', profile);
//       setProfile(response.data);
//       setSuccessMessage('Profile updated successfully!');
//     } catch (error) {
//       console.error('Update error:', error);
//       setError('Failed to update profile. Please try again.');
//     }
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="profile-container">
//       <Header /> {/* Add Header at the top */}
//       <h1>User Profile</h1>
//       {error && <p className="error">{error}</p>}
//       {successMessage && <p className="success">{successMessage}</p>}
//       <form onSubmit={handleSubmit} className="profile-form">
//         <div className="form-group">
//           <label>Username</label>
//           <input
//             type="text"
//             name="username"
//             value={profile.username}
//             disabled
//           />
//         </div>
//         <div className="form-group">
//           <label>Email</label>
//           <input
//             type="email"
//             name="email"
//             value={profile.email}
//             disabled
//           />
//         </div>
//         <div className="form-group">
//           <label>Role</label>
//           <input
//             type="text"
//             name="role"
//             value={profile.role}
//             disabled
//           />
//         </div>
//         <div className="form-group">
//           <label>First Name</label>
//           <input
//             type="text"
//             name="first_name"
//             value={profile.first_name}
//             onChange={handleChange}
//           />
//         </div>
//         <div className="form-group">
//           <label>Last Name</label>
//           <input
//             type="text"
//             name="last_name"
//             value={profile.last_name}
//             onChange={handleChange}
//           />
//         </div>
//         <button type="submit" className="update-button">Update Profile</button>
//       </form>
//     </div>
//   );
// };

// export default Profile;























// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import Header from './Header';
import LogoutButton from './LogoutButton'; // Import the LogoutButton component
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    role: '',
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/profile/');
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response && error.response.status === 401) {
          navigate('/');
        } else {
          setError('Failed to fetch profile data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');
    try {
      const response = await axiosInstance.put('/profile/', profile);
      setProfile(response.data);
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <Header />
      <h1>User Profile</h1>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Username</label>
          <input type="text" name="username" value={profile.username} disabled />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={profile.email} disabled />
        </div>
        <div className="form-group">
          <label>Role</label>
          <input type="text" name="role" value={profile.role} disabled />
        </div>
        <div className="form-group">
          <label>First Name</label>
          <input type="text" name="first_name" value={profile.first_name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input type="text" name="last_name" value={profile.last_name} onChange={handleChange} />
        </div>
        <button type="submit" className="update-button">Update Profile</button>
      </form>
      <LogoutButton /> {/* Add the LogoutButton here */}
    </div>
  );
};

export default Profile;
