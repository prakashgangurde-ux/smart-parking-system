// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userData = await login(email, password);
      
      // Simple redirect logic
      if (userData.role === 'admin') navigate('/admin');
      else if (userData.role === 'staff') navigate('/gate');
      else navigate('/user');

    } catch (err) {
      setError('Login failed. Check email/password.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Sign In (Admin, Staff, or User)</h2>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
export default Login;