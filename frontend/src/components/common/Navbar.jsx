// frontend/src/components/common/Navbar.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

// We'll pass the page title as a prop
function Navbar({ pageTitle }) {
  const { user } = useAuth();
  
  // Get first letter of email for avatar
  const avatarLetter = user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <nav className="navbar">
      <h2 className="navbar-title">{pageTitle}</h2>
      
      <div className="navbar-actions">
        {/* We'll add theme toggle later */}
        <div className="navbar-icon-button">🔔</div>
        
        <div className="navbar-user-menu">
          <div className="navbar-avatar">
            {avatarLetter}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;