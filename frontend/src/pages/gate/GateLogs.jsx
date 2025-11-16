// frontend/src/pages/gate/GateLogs.jsx
import React, { useState, useEffect } from 'react';
import { getGateLogs } from '../../services/api';

function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
}

function GateLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await getGateLogs();
        setLogs(data);
      } catch (err) {
        setError('Failed to fetch gate logs.');
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) return <p>Loading logs...</p>;
  
  return (
    <div>
      <div className="page-header">
        <h1>Gate Activity Log</h1>
      </div>
      {error && <div className="alert-error">{error}</div>}
      <div className="table-container-box">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Staff</th>
              <th>Action</th>
              <th>Vehicle Plate</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="4" style={{textAlign: 'center'}}>No log entries found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.timestamp)}</td>
                  <td>{log.staff.email}</td>
                  <td>{log.action}</td>
                  <td>{log.vehicle_plate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default GateLogs;