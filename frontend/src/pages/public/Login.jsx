// // frontend/src/pages/public/Login.jsx
// import React, { useState } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';

// function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       const userData = await login(email, password);
      
//       // --- THIS IS THE FIX ---
//       // We must redirect to the FULL path, not the base.
//       if (userData.role === 'admin') {
//         navigate('/admin/dashboard'); // Was '/admin'
//       } else if (userData.role === 'staff') {
//         navigate('/gate'); // Was '/gate' (will fix in App.jsx)
//       } else {
//         navigate('/user'); // Was '/user' (will fix in App.jsx)
//       }
      
//     } catch (err) {
//       setError('Login failed. Check email/password.');
//     }
//   };

//   return (
//     <div className="form-container">
//       <form className="form-box" onSubmit={handleSubmit}>
//         <h2>Sign In</h2>
//         {error && <div className="alert-error">{error}</div>}
//         <div className="form-group">
//           <label htmlFor="email">Email Address</label>
//           <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//         </div>
//         <div className="form-group">
//           <label htmlFor="password">Password</label>
//           <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//         </div>
//         <button type="submit" className="form-button">Sign In</button>
//         <p className="form-link">
//           Don't have an account? <Link to="/register">Sign Up</Link>
//         </p>
//       </form>
//     </div>
//   );
// }
// export default Login;

// frontend/src/pages/public/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // FIX: Changed path from ../../
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react'; // Import icons

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
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'staff') {
        navigate('/gate/terminal'); // Redirect to a specific gate page
      } else {
        navigate('/user/dashboard'); // Redirect to a specific user page
      }
      
    } catch (err) {
      setError('Login failed. Check email/password.');
    }
  };

  return (
    // This .form-box IS the white content box
    <form className="form-box" onSubmit={handleSubmit}>
      <h2>Sign In</h2>
      {error && <div className="alert-error">{error}</div>}
      
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
          />
          <Mail size={18} className="icon" />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="input-with-icon">
          <input 
            type="password" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
          />
          <Lock size={18} className="icon" />
        </div>
      </div>
      
      <button type="submit" className="form-button">Sign In</button>
      
      <p className="form-link">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </form>
  );
}
export default Login;