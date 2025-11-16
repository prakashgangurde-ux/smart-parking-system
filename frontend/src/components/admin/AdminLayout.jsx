// frontend/src/components/admin/AdminLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// 1. Define nav items in an array (cleaner)
const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Manage Slots', path: '/admin/slots' },
  { name: 'Users', path: '/admin/users' },
  { name: 'Notifications', path: '/admin/notifications' }, // <-- ADD THIS
  // { name: 'Bookings', path: '/admin/bookings' }, // Add these later
  // { name: 'Staff', path: '/admin/staff' },
];

function AdminLayout() {
  const { user, logout } = useAuth(); // Get user for avatar
  const location = useLocation();

  const avatarLetter = user?.email ? user.email[0].toUpperCase() : 'A';

  return (
    <div className="layout-container">
      {/* --- Sidebar --- */}
      <nav className="sidebar">
        <h2 className="sidebar-logo">
          <span>Smart</span><span>Park</span>
        </h2>
        
        <ul className="sidebar-nav">
          {/* 2. Loop over nav items */}
          {navItems.map((item) => (
            <li key={item.name}>
              {/* 3. This is the FIX (was <link>) */}
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
        {/* 4. This is the NEW Top Bar */}
        <header className="top-bar">
          <div className="top-bar-search">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="top-bar-actions">
            <div className="top-bar-icon">🔔</div>
            <div className="top-bar-avatar">
              {avatarLetter}
            </div>
          </div>
        </header>
        
        {/* Page content renders here */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;