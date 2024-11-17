// // src/components/EditProperty.js
// import React, { useState, useEffect } from 'react';
// import Header from './Header';
// import commercialIcon from '../assets/images/commercial-img.png';
// import axiosInstance from '../axiosInstance';
// import './EditProperty.css';


// const EditProperty = () => {
//   const [propertyType, setPropertyType] = useState('commercial');
//   const [propertyDetails, setPropertyDetails] = useState({
//     propertyName: '',
//     propertyAddress: '',
//     managerName: '',
//     managerContact: '',
//   });
//   const [propertyAssets, setPropertyAssets] = useState({
//     bathrooms: false,
//     kitchen: false,
//     livingArea: false,
//     diningArea: false,
//     workspace: false,
//     parking: false,
//     securityFeatures: false,
//     communityFacilities: false,
//   });
//   const [errorMessage, setErrorMessage] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');

//   useEffect(() => {
//     const fetchPropertyData = async () => {
//       try {
//         const response = await axiosInstance.get('/properties/1/');
//         const property = response.data;
//         setPropertyDetails({
//           propertyName: property.property_name,
//           propertyAddress: property.property_address,
//           managerName: property.manager_name,
//           managerContact: property.manager_contact,
//         });
//         setPropertyType(property.property_type);
//       } catch (error) {
//         setErrorMessage("Failed to load property details.");
//       }
//     };

//     fetchPropertyData();
//   }, []);

//   const handlePropertyAssetChange = (asset) => {
//     setPropertyAssets((prevAssets) => ({
//       ...prevAssets,
//       [asset]: !prevAssets[asset],
//     }));
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setPropertyDetails((prevDetails) => ({
//       ...prevDetails,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axiosInstance.put(`/properties/1/`, {
//         property_name: propertyDetails.propertyName,
//         property_address: propertyDetails.propertyAddress,
//         manager_name: propertyDetails.managerName,
//         manager_contact: propertyDetails.managerContact,
//         property_type: propertyType,
//       });
//       setSuccessMessage("Property updated successfully!");
//     } catch (error) {
//       setErrorMessage("Failed to update property.");
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <Header />
//       <h2 style={styles.header}>Edit Property</h2>

//       <div style={styles.imageDisplay}>
//         <img src={commercialIcon} alt="Property" style={styles.propertyImg} />
//       </div>

//       <div style={styles.typeSelect}>
//         <select
//           value={propertyType}
//           onChange={(e) => setPropertyType(e.target.value)}
//           style={styles.select}
//         >
//           <option value="commercial">Commercial</option>
//           <option value="residential">Residential</option>
//         </select>
//       </div>

//       <form onSubmit={handleSubmit}>
//         <div style={styles.detailsSection}>
//           <input
//             type="text"
//             placeholder="Property Name"
//             name="propertyName"
//             value={propertyDetails.propertyName}
//             onChange={handleInputChange}
//             required
//             style={styles.input}
//           />
//           <input
//             type="text"
//             placeholder="Property Address"
//             name="propertyAddress"
//             value={propertyDetails.propertyAddress}
//             onChange={handleInputChange}
//             required
//             style={styles.input}
//           />
//           <input
//             type="text"
//             placeholder="Manager Name"
//             name="managerName"
//             value={propertyDetails.managerName}
//             onChange={handleInputChange}
//             required
//             style={styles.input}
//           />
//           <input
//             type="text"
//             placeholder="Manager Contact"
//             name="managerContact"
//             value={propertyDetails.managerContact}
//             onChange={handleInputChange}
//             required
//             style={styles.input}
//           />
//         </div>

//         <div style={styles.assetsSection}>
//           <h3 style={styles.assetsHeader}>Property Assets</h3>
//           {Object.keys(propertyAssets).map((asset) => (
//             <label key={asset} style={styles.checkboxLabel}>
//               <input
//                 type="checkbox"
//                 checked={propertyAssets[asset]}
//                 onChange={() => handlePropertyAssetChange(asset)}
//               />
//               {asset.charAt(0).toUpperCase() + asset.slice(1)}
//             </label>
//           ))}
//         </div>

//         <button type="submit" style={styles.submitButton}>Update Property</button>
//         {errorMessage && <p style={styles.error}>{errorMessage}</p>}
//         {successMessage && <p style={styles.success}>{successMessage}</p>}
//       </form>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     padding: '30px',
//     margin: '40px auto',
//     maxWidth: '800px',
//     backgroundColor: '#ffffff',
//     boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
//     borderRadius: '12px',
//   },
//   header: {
//     fontSize: '28px',
//     color: '#333',
//     marginBottom: '20px',
//     textAlign: 'left',
//   },
//   imageDisplay: {
//     display: 'flex',
//     justifyContent: 'center',
//     marginBottom: '20px',
//   },
//   propertyImg: {
//     width: '120px',
//     height: 'auto',
//     borderRadius: '8px',
//   },
//   typeSelect: {
//     width: '100%',
//     maxWidth: '520px',
//     marginBottom: '20px',
//   },
//   select: {
//     width: '100%',
//     padding: '14px',
//     fontSize: '16px',
//     border: '1px solid #ddd',
//     borderRadius: '8px',
//     backgroundColor: '#fafafa',
//     boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.05)',
//   },
//   detailsSection: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '15px',
//     marginBottom: '20px',
//   },
//   input: {
//     width: '100%',
//     padding: '14px',
//     fontSize: '16px',
//     border: '1px solid #ddd',
//     borderRadius: '8px',
//     backgroundColor: '#fafafa',
//     boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.05)',
//   },
//   assetsSection: {
//     display: 'flex',
//     flexWrap: 'wrap',
//     gap: '15px',
//     marginBottom: '25px',
//   },
//   assetsHeader: {
//     fontSize: '22px',
//     color: '#333',
//     marginBottom: '10px',
//     textAlign: 'left',
//   },
//   checkboxLabel: {
//     fontSize: '16px',
//     color: '#555',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//   },
//   submitButton: {
//     backgroundColor: '#28a745',
//     color: 'white',
//     padding: '14px 30px',
//     fontSize: '18px',
//     fontWeight: 'bold',
//     border: 'none',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     transition: 'all 0.3s ease',
//     boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
//   },
//   error: {
//     color: 'red',
//     fontSize: '16px',
//   },
//   success: {
//     color: 'green',
//     fontSize: '16px',
//   },
// };

// export default EditProperty;













// src/components/EditProperty.js
import React, { useState, useEffect } from 'react';
import Header from './Header';
import commercialIcon from '../assets/images/commercial-img.png';
import axiosInstance from '../axiosInstance';

const EditProperty = () => {
  const [propertyType, setPropertyType] = useState('commercial');
  const [propertyDetails, setPropertyDetails] = useState({
    propertyName: '',
    propertyAddress: '',
    managerName: '',
    managerContact: '',
  });
  const [propertyAssets, setPropertyAssets] = useState({
    bathrooms: false,
    kitchen: false,
    livingArea: false,
    diningArea: false,
    workspace: false,
    parking: false,
    securityFeatures: false,
    communityFacilities: false,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        const response = await axiosInstance.get('/properties/1/');
        const property = response.data;
        setPropertyDetails({
          propertyName: property.property_name,
          propertyAddress: property.property_address,
          managerName: property.manager_name,
          managerContact: property.manager_contact,
        });
        setPropertyType(property.property_type);
      } catch (error) {
        setErrorMessage("Failed to load property details.");
      }
    };

    fetchPropertyData();
  }, []);

  const handlePropertyAssetChange = (asset) => {
    setPropertyAssets((prevAssets) => ({
      ...prevAssets,
      [asset]: !prevAssets[asset],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPropertyDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/properties/1/`, {
        property_name: propertyDetails.propertyName,
        property_address: propertyDetails.propertyAddress,
        manager_name: propertyDetails.managerName,
        manager_contact: propertyDetails.managerContact,
        property_type: propertyType,
      });
      setSuccessMessage("Property updated successfully!");
    } catch (error) {
      setErrorMessage("Failed to update property.");
    }
  };

  return (
    <div style={{
      padding: '30px',
      margin: '40px auto',
      maxWidth: '800px',
      backgroundColor: '#ffffff',
      boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
      borderRadius: '12px',
    }}>
      <Header />
      <h2 style={{
        fontSize: '28px',
        color: '#333',
        marginBottom: '20px',
        textAlign: 'left',
      }}>Edit Property</h2>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <img src={commercialIcon} alt="Property" style={{
          width: '120px',
          height: 'auto',
          borderRadius: '8px',
        }} />
      </div>

      <div style={{
        width: '100%',
        maxWidth: '520px',
        marginBottom: '20px',
      }}>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.05)',
          }}
        >
          <option value="commercial">Commercial</option>
          <option value="residential">Residential</option>
        </select>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginBottom: '20px',
        }}>
          <input
            type="text"
            placeholder="Property Name"
            name="propertyName"
            value={propertyDetails.propertyName}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
              boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.05)',
            }}
          />
          <input
            type="text"
            placeholder="Property Address"
            name="propertyAddress"
            value={propertyDetails.propertyAddress}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
              boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.05)',
            }}
          />
          <input
            type="text"
            placeholder="Manager Name"
            name="managerName"
            value={propertyDetails.managerName}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
              boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.05)',
            }}
          />
          <input
            type="text"
            placeholder="Manager Contact"
            name="managerContact"
            value={propertyDetails.managerContact}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
              boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.05)',
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '25px',
        }}>
          <h3 style={{
            fontSize: '22px',
            color: '#333',
            marginBottom: '10px',
            textAlign: 'left',
          }}>Property Assets</h3>
          {Object.keys(propertyAssets).map((asset) => (
            <label key={asset} style={{
              fontSize: '16px',
              color: '#555',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <input
                type="checkbox"
                checked={propertyAssets[asset]}
                onChange={() => handlePropertyAssetChange(asset)}
              />
              {asset.charAt(0).toUpperCase() + asset.slice(1)}
            </label>
          ))}
        </div>

        <button type="submit" style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '14px 30px',
          fontSize: '18px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        }}>Update Property</button>
        {errorMessage && <p style={{
          color: 'red',
          fontSize: '16px',
        }}>{errorMessage}</p>}
        {successMessage && <p style={{
          color: 'green',
          fontSize: '16px',
        }}>{successMessage}</p>}
      </form>
    </div>
  );
};

export default EditProperty;
