// frontend/src/router.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import UserDashboard from './pages/DashboardHome';
import AdminDashboard from './pages/AdminDashboard';
import GateDashboard from './pages/GateDashboard';
// We will create these pages in a moment.

export function AppRoutes() {
  // For now, we'll build the pages.
  // Later, we'll add logic to check the user's role.
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/gate" element={<GateDashboard />} />
      
      {/* Default route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}