// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// --- Layouts ---
import PublicLayout from './components/PublicLayout'; // For hero image
import AdminLayout from './components/admin/AdminLayout';
import UserLayout from './components/user/UserLayout';
import GateLayout from './components/gate/GateLayout';

// --- Public Pages ---
import Welcome from './pages/public/Welcome';
import Login from './pages/public/Login';
import Registration from './pages/public/Registration';

// --- Admin Pages ---
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageSlots from './pages/admin/ManageSlots';
import ManageUsers from './pages/admin/ManageUsers'; // <-- 1. IMPORT
import AdminNotifications from './pages/admin/Notifications'; // <-- 1. IMPORT

// --- User Pages ---
import UserDashboard from './pages/user/UserDashboard';
import BookSlot from './pages/user/BookSlot';
import BookingHistory from './pages/user/BookingHistory';
import Payments from './pages/user/Payments';
import ProfileSettings from './pages/user/ProfileSettings';
import Notifications from './pages/user/Notifications'; // <-- 1. IMPORT


// --- Gate Pages ---
import GateTerminal from './pages/gate/GateTerminal';
import GateLogs from './pages/gate/GateLogs'; // <-- 1. IMPORT
import QrScanner from './pages/gate/QrScanner'; // <-- 1. IMPORT

// (Helper components - these are correct)
function ProtectedRoute({ element }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? element : <Navigate to="/login" replace />;
}
function RoleRoute({ element, role }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return element;
}
function PublicRoute({ element }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (isAuthenticated) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'staff') return <Navigate to="/gate" replace />;
    return <Navigate to="/user" replace />;
  }
  return element;
}

// --- Main App Component ---
function App() {
  const { loading, user, isAuthenticated } = useAuth();

  if (loading) {
    return <div style={{textAlign: 'center', padding: '5rem'}}>Loading application...</div>;
  }

  return (
    <Routes>
      {/* --- 1. Public Routes (Wrapped in PublicLayout) --- */}
      <Route element={<PublicRoute element={<PublicLayout />} />}>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
      </Route>

      {/* --- 2. Admin Routes --- */}
      <Route 
        path="/admin/*" 
        element={<RoleRoute role="admin" element={<AdminLayout />} />}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="slots" element={<ManageSlots />} />
        <Route path="users" element={<ManageUsers />} /> {/* <-- 2. ADD ROUTE */}
        <Route path="notifications" element={<AdminNotifications />} /> {/* <-- 2. ADD ROUTE */}
        {/* (Add other admin pages here) */}
      </Route>

      {/* --- 3. User Routes --- */}
      <Route 
        path="/user/*" 
        element={<RoleRoute role="user" element={<UserLayout />} />} 
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="book-slot" element={<BookSlot />} />
        <Route path="history" element={<BookingHistory />} />
        <Route path="payments" element={<Payments />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="notifications" element={<Notifications />} /> {/* <-- 2. ADD ROUTE */}
      </Route>
      
      {/* --- 4. Gate Routes --- */}
      <Route 
        path="/gate/*" 
        element={<RoleRoute role="staff" element={<GateLayout />} />} 
      >
        <Route index element={<Navigate to="terminal" replace />} />
        <Route path="terminal" element={<GateTerminal />} />
        <Route path="logs" element={<GateLogs />} /> {/* <-- 2. ADD ROUTE */}
        <Route path="scanner" element={<QrScanner />} /> {/* <-- 2. ADD ROUTE */}
      </Route>
      
      {/* --- 5. Fallback Route --- */}
      <Route 
        path="*" 
        element={
          !isAuthenticated ? <Navigate to="/" replace /> :
          user.role === 'admin' ? <Navigate to="/admin" /> :
          user.role === 'staff' ? <Navigate to="/gate" /> :
          <Navigate to="/user" />
        } 
      />
    </Routes>
  );
}

export default App;