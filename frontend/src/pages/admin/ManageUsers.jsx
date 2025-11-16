// frontend/src/pages/admin/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import { getAllUsers, createUserByAdmin } from '../../services/api';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff'); // Default to creating 'staff'
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    try {
      const newUser = await createUserByAdmin(email, password, role);
      setFormSuccess(`Successfully created ${newUser.role}: ${newUser.email}`);
      // Clear form
      setEmail('');
      setPassword('');
      setRole('staff');
      fetchUsers(); // Refresh the list
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create user.');
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Manage Users</h1>
      </div>

      {/* --- Create User Form --- */}
      <div className="form-box" style={{ maxWidth: 'none', marginBottom: '2rem' }}>
        <form onSubmit={handleCreateUser}>
          <h3>Create New User (e.g., Staff)</h3>
          {formError && <div className="alert-error">{formError}</div>}
          {formSuccess && <div className="alert-success">{formSuccess}</div>}
          
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password (min. 8 characters)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="staff">Staff (Gate)</option>
              <option value="user">User (Customer)</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="form-button">Create User</button>
        </form>
      </div>

      {/* --- Existing Users Table --- */}
      {error && <div className="alert-error">{error}</div>}
      <h3>Existing Users</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.is_active ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageUsers;