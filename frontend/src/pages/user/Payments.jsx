// frontend/src/pages/user/Payments.jsx
import React, { useState, useEffect } from 'react';
import { getMyPayments } from '../../services/api';

// --- Helper Functions (Moved inside) ---
function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}
const StatusBadge = ({ status }) => {
  let className = 'status-badge';
  if (status === 'completed') className += ' completed';
  else if (status === 'active') className += ' active';
  else if (status === 'pending') className += ' reserved';
  else if (status === 'failed') className += ' canceled';
  return (<span className={className}>{status}</span>);
};
// ------------------------------------

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await getMyPayments();
        setPayments(data);
      } catch (err) {
        setError('Failed to fetch payment history.');
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  if (loading) return <p>Loading payment history...</p>;

  return (
    <div>
      <div className="page-header"><h1>Payments</h1></div>
      {error && <div className="alert-error">{error}</div>}
      <div className="table-container-box">
        <h3 className="table-title">Payment History</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Booking ID</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{textAlign: 'center'}}>
                  No payment history found.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatDateTime(payment.created_at)}</td>
                  <td>{payment.booking_id}</td>
                  {/* This line will now work */}
                  <td>₹{payment.amount.toFixed(2)}</td>
                  <td>{payment.payment_method}</td>
                  <td><StatusBadge status={payment.status} /></td>
                  <td>{payment.provider_transaction_id || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Payments;