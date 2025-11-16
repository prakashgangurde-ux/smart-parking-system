// frontend/src/pages/user/ProfileSettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateMyProfile, changePassword, getMyVehicles, addVehicle, deleteVehicle } from '../../services/api';

// --- Tab Button Component ---
function TabButton({ title, isActive, onClick }) {
  return (
    <button 
      className={`tab-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {title}
    </button>
  );
}

function ProfileSettings() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password', or 'vehicles'
  
  // Form 1: Profile Info
  const [email, setEmail] = useState(user.email);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  // Form 2: Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Form 3: Vehicle Management
  const [vehicles, setVehicles] = useState([]);
  const [vehicleError, setVehicleError] = useState('');
  const [plate, setPlate] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');

  // Fetch vehicles when page loads
  const fetchVehicles = async () => {
    try {
      const data = await getMyVehicles();
      setVehicles(data);
    } catch (err) {
      setVehicleError('Could not load your vehicles.');
    }
  };
  
  useEffect(() => {
    if (!loading) {
      fetchVehicles();
    }
  }, [loading]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    try {
      await updateMyProfile(email);
      setProfileSuccess('Email updated successfully! (Re-login to see change)');
    } catch (err) {
      setProfileError('Failed to update email.');
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Failed to change password.');
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setVehicleError('');
    try {
      await addVehicle(plate, make, model);
      setPlate('');
      setMake('');
      setModel('');
      fetchVehicles();
    } catch (err) {
      setVehicleError(err.response?.data?.detail || 'Failed to add vehicle.');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(vehicleId);
        fetchVehicles(); // Refresh list
      } catch (err) {
        setVehicleError(err.response?.data?.detail || 'Failed to delete vehicle.');
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Profile Settings</h1>
      </div>

      {/* --- Tab Navigation --- */}
      <div className="tab-nav">
        <TabButton 
          title="Personal Info" 
          isActive={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
        />
        <TabButton 
          title="Change Password" 
          isActive={activeTab === 'password'} 
          onClick={() => setActiveTab('password')} 
        />
        <TabButton 
          title="Manage My Vehicles" 
          isActive={activeTab === 'vehicles'} 
          onClick={() => setActiveTab('vehicles')} 
        />
      </div>

      {/* --- Tab Content --- */}
      <div className="tab-content">
        
        {/* --- Tab 1: Profile Info --- */}
        {activeTab === 'profile' && (
          <div className="form-box" style={{ maxWidth: '700px' }}>
            <form onSubmit={handleProfileSubmit}>
              <h2>Personal Info</h2>
              {profileError && <div className="alert-error">{profileError}</div>}
              {profileSuccess && <div className="alert-success">{profileSuccess}</div>}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="form-button">Save Email</button>
            </form>
          </div>
        )}
        
        {/* --- Tab 2: Change Password --- */}
        {activeTab === 'password' && (
          <div className="form-box" style={{ maxWidth: '700px' }}>
            <form onSubmit={handlePasswordSubmit}>
              <h2>Change Password</h2>
              {passwordError && <div className="alert-error">{passwordError}</div>}
              {passwordSuccess && <div className="alert-success">{passwordSuccess}</div>}
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password (min. 8 characters)</label>
                <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <button type="submit" className="form-button">Change Password</button>
            </form>
          </div>
        )}

        {/* --- Tab 3: Manage Vehicles --- */}
        {activeTab === 'vehicles' && (
          <div className="form-box" style={{ maxWidth: '700px' }}>
            <h2>Manage My Vehicles</h2>
            {vehicleError && <div className="alert-error">{vehicleError}</div>}
            
            <form onSubmit={handleAddVehicle}>
              <div className="vehicle-form">
                <div className="form-group">
                  <label htmlFor="plate">License Plate</label>
                  <input type="text" id="plate" value={plate} onChange={(e) => setPlate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="make">Make</label> 
                  {/* e.g. toyata */}
                  <input type="text" id="make" value={make} onChange={(e) => setMake(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="model">Model</label>
                  {/* e.g camry */}
                  <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="form-button" style={{marginTop: '1rem'}}>Add Vehicle</button>
            </form>
            
            <h3 className="table-title" style={{marginTop: '2rem'}}>My Vehicles</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>License Plate</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center'}}>No vehicles added.</td>
                  </tr>
                ) : (
                  vehicles.map((v) => (
                    <tr key={v.id}>
                      <td>{v.license_plate}</td>
                      <td>{v.make || 'N/A'}</td>
                      <td>{v.model || 'N/A'}</td>
                      <td>
                        <button 
                          className="receipt-button"
                          style={{color: '#d32f2f'}}
                          onClick={() => handleDeleteVehicle(v.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default ProfileSettings;