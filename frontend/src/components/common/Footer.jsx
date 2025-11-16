// frontend/src/components/common/Footer.jsx
import React from 'react';

const footerStyle = {
  textAlign: 'center',
  padding: '2rem',
  background: '#333',
  color: '#aaa',
  marginTop: 'auto',
};

function Footer() {
  return (
    <footer style={footerStyle}>
      <p>&copy; {new Date().getFullYear()} Smart Parking System. All rights reserved.</p>
    </footer>
  );
}
export default Footer;