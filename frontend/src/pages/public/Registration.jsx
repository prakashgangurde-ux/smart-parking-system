// // frontend/src/pages/public/Registration.jsx
// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { signup } from '../../services/api';
// function Registration() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const navigate = useNavigate();
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(''); setSuccess('');
//     if (password.length < 8) {
//       setError('Password must be at least 8 characters long.');
//       return;
//     }
//     try {
//       await signup(email, password);
//       setSuccess('Registration successful! Redirecting to login...');
//       setTimeout(() => navigate('/login'), 2000);
//     } catch (err) {
//       setError(err.response?.data?.detail || 'Registration failed.');
//     }
//   };
//   return (
//     <div className="form-container">
//       <form className="form-box" onSubmit={handleSubmit}>
//         <h2>Create Account</h2>
//         {error && <div className="alert-error">{error}</div>}
//         {success && <div className="alert-success">{success}</div>}
//         <div className="form-group">
//           <label htmlFor="email">Email Address</label>
//           <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//         </div>
//         <div className="form-group">
//           <label htmlFor="password">Password (min. 8 characters)</label>
//           <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//         </div>
//         <button type="submit" className="form-button" disabled={!!success}>Sign Up</button>
//         <p className="form-link">
//           Already have an account? <Link to="/login">Sign In</Link>
//         </p>
//       </form>
//     </div>
//   );
// }
// export default Registration;

// frontend/src/pages/public/Registration.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../services/api'; 
import { Mail, Lock } from 'lucide-react'; // Import icons

function Registration() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    try {
      await signup(email, password);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    }
  };

  return (
    // This .form-box IS the white content box
    <form className="form-box" onSubmit={handleSubmit}>
      <h2>Create Account</h2>
      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}
      
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <div className="input-with-icon">
          <input 
            type="email" 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="you@example.com"
            disabled={!!success}
          />
          <Mail size={18} className="icon" />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password (min. 8 characters)</label>
        <div className="input-with-icon">
          <input 
            type="password" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            disabled={!!success}
          />
          <Lock size={18} className="icon" />
        </div>
      </div>
      
      <button type="submit" className="form-button" disabled={!!success}>
        {success ? 'Registered!' : 'Sign Up'}
      </button>
      
      <p className="form-link">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </form>
  );
}
export default Registration;