import React, { useState, useEffect } from 'react';
import './AddTenants.css';
import Header from './Header';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const AddTenant = () => {
  const { propertyId, tenantId } = useParams();
  const navigate = useNavigate();

  const [tenantDetails, setTenantDetails] = useState({
    tenant_first: '',
    tenant_surname: '',
    tenant_ph: '',
    tenant_email: '',
    aadhar_number: '',  // Added as a required field
    is_aadhar_verified: false,  // Checkbox for Aadhar verification
    room_selected: '', // Corresponds to room_number in backend
    bed_allocated: '',
    check_in_date: '',
    check_out_date: '',
    rent_amount: '',
    rent_paid: '',
    deposit: '',
    rental_status: '',
    last_payment_date: '',  // Added for last payment date
  });

  const [availableRooms, setAvailableRooms] = useState([]);
  const [pendingRent, setPendingRent] = useState(null);
  const [isOverdue, setIsOverdue] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch available rooms
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      try {
        const response = await axiosInstance.get(`/properties/${propertyId}/available_rooms/`);
        setAvailableRooms(response.data);
      } catch (error) {
        setErrorMessage("Error fetching rooms: " + error.message);
      }
    };
    fetchAvailableRooms();
  }, [propertyId]);

  // Fetch tenant details if editing
  useEffect(() => {
    if (tenantId) {
      const fetchTenantDetails = async () => {
        try {
          const response = await axiosInstance.get(`/properties/${propertyId}/tenants/${tenantId}/`);
          const data = response.data;
          setTenantDetails({
            tenant_first: data.tenant_first,
            tenant_surname: data.tenant_surname,
            tenant_ph: data.tenant_ph,
            tenant_email: data.tenant_email,
            aadhar_number: data.aadhar_number || '',
            is_aadhar_verified: data.is_aadhar_verified || false,
            room_selected: data.room_number || '',
            bed_allocated: data.bed_allocated || '',
            check_in_date: data.check_in_date,
            check_out_date: data.check_out_date || '',
            rent_amount: data.rent_amount || '',
            rent_paid: data.rent_paid || '',
            deposit: data.deposit || '',
            rental_status: data.rental_status,
            last_payment_date: data.last_payment_date || '',
          });
          setPendingRent(data.pending_rent);
          setIsOverdue(data.is_overdue);
        } catch (error) {
          setErrorMessage("Error fetching tenant details: " + error.message);
        }
      };
      fetchTenantDetails();
    }
  }, [tenantId, propertyId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const formattedValue = (name === 'check_in_date' || name === 'check_out_date' || name === 'last_payment_date')
      // ? new Date(value).toISOString().split('T')[0]
      ? (value ? new Date(value).toISOString().split('T')[0] : '')  // If value is empty, set it to an empty string

      : type === 'checkbox' ? checked : value;

    setTenantDetails((prevDetails) => ({
      ...prevDetails,
      [name]: formattedValue,
    }));

    if (name === 'rent_amount' || name === 'rent_paid') {
      const rentAmount = name === 'rent_amount' ? parseFloat(formattedValue) : parseFloat(tenantDetails.rent_amount);
      const rentPaid = name === 'rent_paid' ? parseFloat(formattedValue) : parseFloat(tenantDetails.rent_paid);
      if (!isNaN(rentAmount) && !isNaN(rentPaid)) {
        setPendingRent(rentAmount - rentPaid);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      ...tenantDetails,
      deposit: parseFloat(tenantDetails.deposit),
      rent_amount: parseFloat(tenantDetails.rent_amount),
      rent_paid: parseFloat(tenantDetails.rent_paid),
      check_in_date: tenantDetails.check_in_date || null,
      check_out_date: tenantDetails.check_out_date || null,
      last_payment_date: tenantDetails.last_payment_date || null,
    };

    try {
      const response = tenantId
        ? await axiosInstance.put(`/properties/${propertyId}/tenants/${tenantId}/`, formData)
        : await axiosInstance.post(`/properties/${propertyId}/tenants/`, formData);

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage(tenantId ? "Tenant updated successfully!" : "Tenant added successfully!");
        navigate('/home');
      }
    } catch (error) {
      setErrorMessage(`Failed to save tenant details: ${error.response?.data.detail || 'Unknown error occurred.'}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this tenant? This action cannot be undone.")) {
      try {
        await axiosInstance.delete(`/properties/${propertyId}/tenants/${tenantId}/`);
        setSuccessMessage("Tenant deleted successfully!");
        navigate('/home');
      } catch (error) {
        setErrorMessage("Error while deleting tenant: " + error.message);
      }
    }
  };

  return (
    <div className="add-tenant-container">
      <Header />
      <form onSubmit={handleSubmit} className="add-tenant-form">
        <h2>{tenantId ? "Edit Tenant" : "Add Tenant"}</h2>
        {errorMessage && <div className="error">{errorMessage}</div>}
        {successMessage && <div className="success">{successMessage}</div>}

        <div className="form-group">
          <label>First Name:</label>
          <input type="text" name="tenant_first" value={tenantDetails.tenant_first} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Surname:</label>
          <input type="text" name="tenant_surname" value={tenantDetails.tenant_surname} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Phone:</label>
          <input type="text" name="tenant_ph" value={tenantDetails.tenant_ph} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="tenant_email" value={tenantDetails.tenant_email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Aadhar Number:</label>
          <input type="text" name="aadhar_number" value={tenantDetails.aadhar_number} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Aadhar Verified:</label>
          <input type="checkbox" name="is_aadhar_verified" checked={tenantDetails.is_aadhar_verified} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Room Number:</label>
          <select name="room_selected" value={tenantDetails.room_selected} onChange={handleChange} required>
            <option value="">Select Room</option>
            {availableRooms.map((room) => (
              <option key={room.id} value={room.room_number}>
                Room {room.room_number} - {room.available_beds} beds available
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Bed Allocated:</label>
          <input type="number" name="bed_allocated" value={tenantDetails.bed_allocated} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Check-In Date:</label>
          <input type="date" name="check_in_date" value={tenantDetails.check_in_date} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Check-Out Date:</label>
          <input type="date" name="check_out_date" value={tenantDetails.check_out_date} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Last Payment Date:</label>
          <input type="date" name="last_payment_date" value={tenantDetails.last_payment_date} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Rent Amount:</label>
          <input type="number" name="rent_amount" value={tenantDetails.rent_amount} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Rent Paid:</label>
          <input type="number" name="rent_paid" value={tenantDetails.rent_paid} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Deposit:</label>
          <input type="number" name="deposit" value={tenantDetails.deposit} onChange={handleChange} required />
        </div>

        {pendingRent !== null && (
          <div className="pending-rent">Pending Rent: {pendingRent}</div>
        )}
        {isOverdue && (
          <div className="overdue-status">Status: Overdue</div>
        )}

        <div className="form-group">
          <label>Rental Status:</label>
          <select name="rental_status" value={tenantDetails.rental_status} onChange={handleChange} required>
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="form-group">
          <button type="submit" className="submit-button">
            {tenantId ? 'Update Tenant' : 'Add Tenant'}
          </button>
          {tenantId && (
            <button type="button" onClick={handleDelete} className="delete-button">
              Delete Tenant
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddTenant;
