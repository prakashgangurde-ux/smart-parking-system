// frontend/src/pages/gate/GateTerminal.jsx
import React, { useState } from 'react';
import { checkIn, checkOut } from '../../services/api';

function GateTerminal() {
  const [bookingId, setBookingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const result = await checkIn(bookingId);
      setSuccess(`Success: ${result.booking_id_str} checked in at ${new Date(result.check_in_time).toLocaleTimeString()}.`);
      setBookingId('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Check-in failed.');
    }
  };
  
  const handleCheckOut = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const result = await checkOut(bookingId);
      setSuccess(`Success: ${result.booking_id_str} checked out at ${new Date(result.check_out_time).toLocaleTimeString()}.`);
      setBookingId('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Check-out failed.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Gate Check-In / Check-Out</h1>
      </div>
      
      {/* We use the booking form wrapper from the user page for consistent style */}
      <div className="booking-form-wrapper" style={{maxWidth: '600px'}}>
        <form className="form-box">
          <h2>Verify Booking</h2>
          
          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          <div className="form-group">
            <label htmlFor="bookingId">Enter Booking ID (e.g., SPS-1001)</label>
            <input
              type="text"
              id="bookingId"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value.toUpperCase())}
              placeholder="SPS-..."
              required
            />
          </div>
          
          <div className="gate-button-row">
            <button 
              type="button" 
              className="form-button gate-button-checkin"
              onClick={handleCheckIn}
            >
              Check-In
            </button>
            <button 
              type="button" 
              className="form-button gate-button-checkout"
              onClick={handleCheckOut}
            >
              Check-Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GateTerminal;