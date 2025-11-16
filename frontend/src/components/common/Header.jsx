// frontend/src/components/common/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// Simple header style (add to styles.css later)
const headerStyle = {
  padding: '1rem 2rem',
  background: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #eee',
};
const logoStyle = {
  fontSize: '1.5rem',
  fontWeight: '700',
  color: '#0d47a1',
  textDecoration: 'none',
};
const navStyle = {
  display: 'flex',
  gap: '1rem',
};

function Header() {
  return (
    <header style={headerStyle}>
      <Link to="/" style={logoStyle}>
        <span>Smart</span><span style={{color: '#90caf9'}}>Park</span>
      </Link>
      <nav style={navStyle}>
        <Link to="/login">Login</Link>
        <Link to="/register">Sign Up</Link>
      </nav>
    </header>
  );
}
export default Header;