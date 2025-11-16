// frontend/src/components/gate/GateLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function GateLayout() {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Check-In / Check-Out', path: '/gate/terminal' },
    { name: 'View Logs', path: '/gate/logs' },
    { name: 'Scan QR Code', path: '/gate/scanner' }, // <-- ADD THIS
    // { name: 'Live Slot View', path: '/gate/live-view' },
  ];

  return (
    <div className="layout-container">
      {/* --- Sidebar (Green for Staff) --- */}
      <nav className="sidebar" style={{ backgroundColor: '#2E7D32' }}>
        <h2 className="sidebar-logo">
          <span>Gate</span><span>Terminal</span>
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
      
      {/* --- Main Content Area --- */}
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-profile">🚪 Gate Terminal - Staff</div>
          <div className="top-bar-avatar" style={{ backgroundColor: '#2E7D32' }}>GS</div>
        </header>
        
        <div className="page-content">
          <Outlet /> {/* This is where your gate pages will go */}
        </div>
      </main>
    </div>
  );
}

export default GateLayout;