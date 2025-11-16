// frontend/src/pages/user/BookSlot.jsx
import React, { useState, useEffect } from 'react';
import { getSlots, createBooking, getMyVehicles, createRazorpayOrder, verifyPayment } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// --- Slot Card Component ---
function SlotCard({ slot, onSelect, isSelected }) {
  const { status, slot_number, vehicle_type } = slot;

  const getStatusClass = () => {
    if (status === 'available') return 'slot-available';
    if (status === 'booked' || status === 'reserved') return 'slot-booked';
    return 'slot-maintenance';
  };
  
  const isDisabled = status !== 'available';

  return (
    <button
      className={`slot-card-button ${getStatusClass()} ${isSelected ? 'selected' : ''}`}
      disabled={isDisabled}
      onClick={() => onSelect(slot)}
    >
      <span className="slot-card-name">{slot_number}</span>
      <span className="slot-card-type">{vehicle_type}</span>
    </button>
  );
}

// --- Main Page Component ---
function BookSlot() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Form State
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const slotsData = await getSlots();
        setSlots(slotsData);
        
        const vehiclesData = await getMyVehicles();
        setVehicles(vehiclesData);
        if (vehiclesData.length > 0) {
          setSelectedVehicle(vehiclesData[0].id);
        }
      } catch (err) {
        setError('Failed to fetch data. Add a vehicle in Profile Settings.');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/slots');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'slot_update') {
        setSlots((prevSlots) => 
          prevSlots.map((slot) => 
            slot.id === data.slot.id ? data.slot : slot
          )
        );
      }
    };
    return () => ws.close();
  }, []); 

  // Razorpay modal opener & verification
  const displayRazorpay = async (booking) => {
    try {
      const order = await createRazorpayOrder(booking.id);

      if (!window.Razorpay) {
        setBookingError('Razorpay SDK not loaded. Add <script src="https://checkout.razorpay.com/v1/checkout.js"></script> to index.html');
        return;
      }

      const options = {
        key: "", // Replace with your Razorpay Key ID
        amount: order.amount,
        currency: order.currency,
        name: "Smart Parking System",
        description: `Booking for ${booking.slot.slot_number}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await verifyPayment({
              ...response,
              booking_id: booking.id
            });
            alert("Payment Successful! Booking Confirmed.");
            navigate('/user/history');
          } catch (err) {
            setBookingError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: "#0d47a1"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setBookingError("Failed to create Razorpay order.");
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setBookingError('Please select a slot from the map.');
      return;
    }
    if (!selectedVehicle) {
      setBookingError('Please add a vehicle in Profile Settings first.');
      return;
    }
    setBookingError('');

    try {
      const isoStartTime = new Date(startTime).toISOString();
      const isoEndTime = new Date(endTime).toISOString();
      
      const newBooking = await createBooking(
        selectedSlot.id, 
        isoStartTime, 
        isoEndTime, 
        selectedVehicle, 
        paymentMethod
      );
      
      if (paymentMethod === 'online') {
        await displayRazorpay(newBooking);
      } else {
        alert(`Booking successful for slot ${selectedSlot.slot_number}!`);
        navigate('/user/history');
      }
      
    } catch (err) {
      setBookingError(err.response?.data?.detail || 'Booking failed.');
    }
  };

  if (loading) return <p>Loading slots...</p>;
  if (error) return <div className="alert-error">{error}</div>;

  return (
    <div className="book-slot-container">
      {/* --- Slot Map --- */}
      <div className="slot-map-wrapper">
        <div className="page-header">
          <h1>Select an Available Slot</h1>
        </div>
        <div className="slot-grid">
          {slots.map((slot) => (
            <SlotCard 
              key={slot.id} 
              slot={slot} 
              onSelect={setSelectedSlot}
              isSelected={selectedSlot && selectedSlot.id === slot.id}
            />
          ))}
        </div>
      </div>

      {/* --- Booking Form (UPDATED) --- */}
      <div className="booking-form-wrapper">
        <form className="form-box" onSubmit={handleBookingSubmit}>
          <h2>Booking Details</h2>
          
          <div className="form-group">
            <label>Selected Slot</label>
            <input type="text" value={selectedSlot ? `${selectedSlot.slot_number} ($${selectedSlot.price_per_hour.toFixed(2)}/hr)` : 'None Selected'} disabled />
          </div>

          {/* --- 5. SELECT VEHICLE DROPDOWN --- */}
          <div className="form-group">
            <label htmlFor="vehicle">Select Vehicle</label>
            <select id="vehicle" value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} required>
              <option value="" disabled>Select your vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.license_plate} ({v.make || 'Vehicle'})
                </option>
              ))}
            </select>
            {vehicles.length === 0 && (
              <small>No vehicles found. <a href="/user/profile">Add a vehicle</a></small>
            )}
          </div>
          
          <div className="form-group">
            <label>Start Time</label>
            <input 
              type="datetime-local" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label>End Time</label>
            <input 
              type="datetime-local" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required 
            />
          </div>

          {/* --- 6. PAYMENT METHOD DROPDOWN --- */}
          <div className="form-group">
            <label>Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cash">Pay at Gate (Cash)</option>
              <option value="online">Pay Online (Razorpay)</option>
            </select>
          </div>

          {bookingError && <div className="alert-error">{bookingError}</div>}
          
          <button type="submit" className="form-button" disabled={!selectedSlot || !selectedVehicle}>
            {paymentMethod === 'cash' ? 'Confirm & Book Slot' : 'Proceed to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookSlot;