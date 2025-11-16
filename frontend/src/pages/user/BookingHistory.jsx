// frontend/src/pages/user/BookingHistory.jsx
import React, { useState, useEffect } from 'react';
import { getMyBookings, getReceipt } from '../../services/api';

function formatDateTime(isoString) {
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
  else if (status === 'upcoming') className += ' reserved';
  else if (status === 'cancelled') className += ' canceled';
  return (<span className={className}>{status}</span>);
};

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getMyBookings();
        setBookings(data);
      } catch (err) {
        setError('Failed to fetch booking history.');
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const handleDownloadReceipt = async (booking) => {
    setDownloadError('');
    try {
      const pdfBlob = await getReceipt(booking.id);
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${booking.booking_id_str}.pdf`);
      
      // Append to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      setDownloadError(`Could not download receipt for ${booking.booking_id_str}.`);
    }
  };

  if (loading) return <p>Loading history...</p>;

  return (
    <div>
      <div className="page-header"><h1>My Bookings</h1></div>
      <p style={{marginTop: "-2rem", marginBottom: "2rem", color: "#555"}}>
        View and manage your parking reservations.
      </p>
      {error && <div className="alert-error">{error}</div>}
      {downloadError && <div className="alert-error">{downloadError}</div>}

      <div className="table-container-box">
        <h3 className="table-title">Booking History</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Slot Number</th>
              <th>Vehicle Plate</th> {/* <-- UPDATED */}
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign: 'center'}}>You have no bookings.</td></tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.booking_id_str || `#${booking.id}`}</td>
                  <td>{booking.slot.slot_number}</td>
                  <td>{booking.vehicle.license_plate}</td> {/* <-- UPDATED */}
                  <td>{formatDateTime(booking.start_time)}</td>
                  <td>{formatDateTime(booking.end_time)}</td>
                  <td><StatusBadge status={booking.status} /></td>
                  <td>
                    {booking.qr_code_url ? (
                      <button 
                        className="receipt-button"
                        onClick={() => handleDownloadReceipt(booking)}
                      >
                        Download PDF
                      </button>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BookingHistory;