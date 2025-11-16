// frontend/src/pages/user/Notifications.jsx
import React from 'react';

function Notifications() {
  return (
    <div>
      <div className="page-header">
        <h1>Notifications</h1>
      </div>
      <div className="table-container-box">
        <h3 className="table-title">Your Notifications</h3>
        <p style={{ textAlign: 'center', color: '#555', padding: '2rem 0' }}>
          You have no new notifications.
        </p>
      </div>
    </div>
  );
}

export default Notifications;