// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminStats } from '../../services/api';

// Reusable component for the summary cards
function DashboardCard({ title, value, color, children }) {
  return (
    <div className="dashboard-card" style={{borderColor: color}}>
      <div className="card-icon" style={{backgroundColor: color}}>
        {children}
      </div>
      <div className="card-content">
        <h4>{title}</h4>
        <span className="card-value">{value}</span>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }
  if (!stats) {
    return <div className="alert-error">Could not load dashboard stats.</div>;
  }

  return (
    <div>
      <div className="page-header" style={{marginBottom: '1rem'}}>
        <h1>Hello, {user.email.split('@')[0]} 👋</h1>
      </div>
      <p style={{marginTop: 0, marginBottom: "2rem", color: "#555"}}>
        Welcome to your admin dashboard.
      </p>

      {/* --- Summary Cards --- */}
      <div className="summary-card-row">
        <DashboardCard title="Total Slots" value={stats.total_slots} color="#0d47a1">
          🅿️
        </DashboardCard>
        
        <DashboardCard title="Available Slots" value={stats.available_slots} color="#2e7d32">
          ✅
        </DashboardCard>
        
        <DashboardCard title="Booked Slots" value={stats.booked_slots} color="#d32f2f">
          🚗
        </DashboardCard>
        
        <DashboardCard title="Total Users" value={stats.total_users} color="#ed6c02">
          👥
        </DashboardCard>
      </div>

      {/* We can add charts here later */}
    </div>
  );
}

export default AdminDashboard;