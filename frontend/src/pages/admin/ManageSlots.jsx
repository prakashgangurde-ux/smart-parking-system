// frontend/src/pages/ManageSlots.jsx
import React, { useState, useEffect } from 'react';
import { getSlots, createSlot, updateSlot, deleteSlot } from '../..//services/api';


// --- Reusable Modal Component ---
function Modal({ children, onClose, title }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-button" onClick={onClose}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// --- Slot Card Component (UPDATED with Edit) ---
function SlotCard({ slot, onDelete, onEdit }) { // Added onEdit
  const getStatusClass = () => {
    if (slot.status === 'available') return 'status-available';
    if (slot.status === 'booked' || slot.status === 'reserved') return 'status-booked';
    if (slot.status === 'maintenance') return 'status-maintenance';
    return 'status-default';
  };

  return (
    <div className={`slot-card ${getStatusClass()}`}>
      <div className="slot-card-header">
        <span className="slot-id">{slot.slot_number}</span>
        <span className={`slot-status-badge ${getStatusClass()}`}>{slot.status}</span>
      </div>
      <div className="slot-card-body">
        {slot.vehicle_type}
      </div>
      <div className="slot-card-price">
        ${slot.price_per_hour.toFixed(2)} / hr 
      </div>
      <div className="slot-card-actions">
        {/* Pass the full slot object to onEdit */}
        <button className="action-button edit-button" onClick={() => onEdit(slot)}>Edit</button>
        <button className="action-button delete-button" onClick={() => onDelete(slot.id, slot.slot_number)}>
          Delete
        </button>
      </div>
    </div>
  );
}

// --- Main Page Component ---
function ManageSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- NEW: State for tracking edit mode ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null); // Slot being edited
  
  // Form state
  const [slotNumber, setSlotNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Standard Vehicle');
  const [price, setPrice] = useState(5.0);
  const [status, setStatus] = useState('available'); // For edit
  const [formError, setFormError] = useState('');

  // Fetch slots
  const fetchSlots = async () => {
    try {
      const data = await getSlots();
      setSlots(data);
    } catch (err) {
      setError('Failed to fetch slots.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Live WebSocket (No changes)
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/slots');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'slot_update') {
        setSlots((prevSlots) => 
          prevSlots.map((slot) => slot.id === data.slot.id ? data.slot : slot)
        );
      }
    };
    return () => ws.close();
  }, []);

  // --- Modal Close Function ---
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentSlot(null);
    setFormError('');
    // Reset form
    setSlotNumber('');
    setVehicleType('Standard Vehicle');
    setPrice(5.0);
    setStatus('available');
  };

  // --- Open Modal for CREATE ---
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // --- Open Modal for EDIT ---
  const handleOpenEditModal = (slot) => {
    setIsEditMode(true);
    setCurrentSlot(slot);
    // Pre-fill form with slot data
    setSlotNumber(slot.slot_number);
    setVehicleType(slot.vehicle_type);
    setPrice(slot.price_per_hour);
    setStatus(slot.status);
    setIsModalOpen(true);
  };

  // Handle Form Submit (CREATE or UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const slotData = {
      slot_number: slotNumber,
      vehicle_type: vehicleType,
      price_per_hour: parseFloat(price),
      status: status
    };

    try {
      if (isEditMode) {
        // --- UPDATE ---
        await updateSlot(currentSlot.id, slotData);
      } else {
        // --- CREATE ---
        await createSlot(slotNumber, vehicleType, parseFloat(price));
      }
      closeModal();
      fetchSlots(); // Refresh the list
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to save slot.');
    }
  };

  // Handle Delete
  const handleDeleteSlot = async (slotId, slotNumber) => {
    if (window.confirm(`Are you sure you want to delete slot ${slotNumber}?`)) {
      try {
        await deleteSlot(slotId);
        fetchSlots(); // Refresh the list
      } catch (err) {
        setError('Failed to delete slot.');
      }
    }
  };

  // Calculate Summary (No changes)
  const totalSlots = slots.length;
  const availableSlots = slots.filter(s => s.status === 'available').length;
  const bookedSlots = slots.filter(s => s.status === 'booked' || s.status === 'reserved').length;
  const maintenanceSlots = slots.filter(s => s.status === 'maintenance').length;

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {error && <div className="alert-error" style={{marginBottom: '1rem'}}>{error}</div>}
      
      <div className="page-header">
        <h1>Manage Slots</h1>
        <div className="header-actions">
          <span className="connection-status">Connected</span>
          <button className="add-slot-button" onClick={handleOpenCreateModal}>
            + Add New Slot
          </button>
        </div>
      </div>

      <div className="summary-card-row">
        {/* ... (Summary cards... no changes) ... */}
      </div>

      <div className="slot-grid-container">
        {slots.length === 0 ? (
          <p>No slots found. Click "Add New Slot" to create one.</p>
        ) : (
          slots.map((slot) => (
            <SlotCard 
              key={slot.id} 
              slot={slot} 
              onDelete={handleDeleteSlot} 
              onEdit={handleOpenEditModal} // Pass the handler
            />
          ))
        )}
      </div>

      {/* --- "Add/Edit" Modal --- */}
      {isModalOpen && (
        <Modal onClose={closeModal} title={isEditMode ? "Edit Slot" : "Add New Slot"}>
          <form onSubmit={handleSubmit}>
            {formError && <div className="alert-error">{formError}</div>}
            
            <div className="form-group">
              <label htmlFor="slotNumber">Slot Number (e.g., A-01)</label>
              <input type="text" id="slotNumber" value={slotNumber} onChange={(e) => setSlotNumber(e.target.value)} required />
            </div>
            
            <div className="form-group">
              <label htmlFor="vehicleType">Vehicle Type</label>
              <select id="vehicleType" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                <option value="Standard Vehicle">Standard Vehicle</option>
                <option value="SUV">SUV</option>
                <option value="EV Charging">EV Charging</option>
                <option value="Bike">Bike</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="price">Price per Hour ($)</label>
              <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.5" />
            </div>

            {/* --- NEW: Status field (only shows in edit mode) --- */}
            {isEditMode && (
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="booked">Booked</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            )}
            
            <button type="submit" className="form-button">
              {isEditMode ? "Save Changes" : "Create Slot"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ManageSlots;