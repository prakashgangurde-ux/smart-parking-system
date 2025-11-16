// frontend/src/components/common/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// We'll pass logo, color, and nav items as props
function Sidebar({ logoText, navItems, style }) {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="sidebar" style={style}>
      <h2 className="sidebar-logo">
        <span>{logoText.span1}</span>
        <span>{logoText.span2}</span>
      </h2>
      
      <ul className="sidebar-nav">
        {navItems.map(item => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;