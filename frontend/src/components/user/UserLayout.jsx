// frontend/src/components/user/UserLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// 1. Define User navigation items (from your screenshot)
const navItems = [
  { name: 'Dashboard', path: '/user/dashboard' },
  { name: 'Book Slot', path: '/user/book-slot' },
  { name: 'Booking History', path: '/user/history' },
  { name: 'Payments', path: '/user/payments' },
  { name: 'Profile Settings', path: '/user/profile' },
  { name: 'Notifications', path: '/user/notifications' }, // <-- ADD THIS
  // { name: 'Notifications', path: '/user/notifications' },
];

function UserLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const avatarLetter = user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <div className="layout-container">
      {/* --- Sidebar --- */}
      <nav className="sidebar" style={{ backgroundColor: '#0d47a1' }}> {/* User's Blue Sidebar */}
        <h2 className="sidebar-logo">
          <span>Smart</span><span>Park</span>
        </h2>
        
        <ul className="sidebar-nav">
          {navItems.map((item) => (
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
        {/* --- Top Bar (Navbar) --- */}
        <header className="top-bar">
          <div className="top-bar-search">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="top-bar-actions">
            <div className="top-bar-icon">🔔</div> {/* Notification Bell */}
            <div className="top-bar-avatar" style={{ backgroundColor: '#0d47a1' }}>
              {avatarLetter}
            </div>
          </div>
        </header>
        
        {/* This is where the page content will go */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default UserLayout;