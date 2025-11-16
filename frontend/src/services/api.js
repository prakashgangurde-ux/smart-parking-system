// frontend/src/services/api.js
import axios from 'axios';
const API_URL = 'http://localhost:8000/api/v1';

// --- Token Helper ---
const getToken = () => localStorage.getItem('token');

// --- AUTH FUNCTIONS ---
export const login = async (email, password) => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  const response = await axios.post(`${API_URL}/auth/token`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data.access_token;
};
export const signup = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/signup`, {
    email, password, role: 'user',
  });
  return response.data;
};
export const getMe = async () => {
  const token = getToken();
  if (!token) return null;
  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const logout = () => {
  localStorage.removeItem('token');
};

// --- APP FUNCTIONS ---
export const getSlots = async () => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/slots/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const createSlot = async (slotNumber, vehicleType, price) => {
  const token = getToken();
  const response = await axios.post(
    `${API_URL}/slots/`,
    { 
      slot_number: slotNumber, 
      vehicle_type: vehicleType,
      price_per_hour: price,
      status: 'available' 
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
export const updateSlot = async (slotId, slotData) => {
  const token = getToken();
  const response = await axios.put(
    `${API_URL}/slots/${slotId}`,
    slotData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
export const deleteSlot = async (slotId) => {
  const token = getToken();
  const response = await axios.delete(
    `${API_URL}/slots/${slotId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// --- USER BOOKING FUNCTIONS ---

export const createBooking = async (slotId, startTime, endTime, vehicleId, paymentMethod) => {
  const token = getToken(); // Get the user token
  const response = await axios.post(
    `${API_URL}/bookings/`,
    {
      slot_id: slotId,
      start_time: startTime,
      end_time: endTime,
      vehicle_id: vehicleId,       // <-- ADD THIS
      payment_method: paymentMethod  // <-- ADD THIS
    },
    {
      headers: { Authorization: `Bearer ${token}` }, // Add the user token
    }
  );
  return response.data;
};

// --- ADD THIS FUNCTION ---
export const getMyBookings = async () => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/bookings/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// --- ADD THIS FUNCTION ---
export const getReceipt = async (bookingId) => {
  const token = getToken();
  const response = await axios.get(
    `${API_URL}/bookings/receipt/${bookingId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob', // This is crucial for file downloads
    }
  );
  return response.data; // This will be the PDF file blob
};


// gate terminal
// --- GATE FUNCTIONS ---

export const checkIn = async (bookingIdStr) => {
  const token = getToken();
  const response = await axios.post(
    `${API_URL}/gate/checkin`,
    { booking_id_str: bookingIdStr },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const checkOut = async (bookingIdStr) => {
  const token = getToken();
  const response = await axios.post(
    `${API_URL}/gate/checkout`,
    { booking_id_str: bookingIdStr },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// --- USER PROFILE FUNCTIONS ---

// --- USER PROFILE FUNCTIONS ---

export const updateMyProfile = async (email) => {
  const token = getToken();
  const response = await axios.put(
    `${API_URL}/users/me`,
    { email: email }, // Send the new email
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const token = getToken();
  const response = await axios.post(
    `${API_URL}/auth/change-password`,
    {
      current_password: currentPassword,
      new_password: newPassword
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// --- ADMIN FUNCTIONS ---

export const getAllUsers = async () => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createUserByAdmin = async (email, password, role) => {
  const token = getToken();
  const response = await axios.post(
    `${API_URL}/admin/users/create`,
    {
      email: email,
      password: password,
      role: role // e.g., 'staff', 'user', or 'admin'
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// --- ADD THIS FUNCTION ---
export const getAdminStats = async () => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


// --- ADD USER DASHBOARD ---

// --- ADD THESE NEW FUNCTIONS ---

export const getMyVehicles = async () => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/users/me/vehicles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addVehicle = async (license_plate, make, model) => {
  const token = getToken();
  const response = await axios.post(
    `${API_URL}/users/me/vehicles`,
    {
      license_plate: license_plate,
      make: make,
      model: model,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const deleteVehicle = async (vehicleId) => {
  const token = getToken();
  const response = await axios.delete(
    `${API_URL}/users/me/vehicles/${vehicleId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// --- PAYMENT FUNCTIONS ---
export const createRazorpayOrder = async (bookingId) => {
  const token = getToken();
  const response = await axios.post(
    `${API_URL}/payments/create-order`,
    { booking_id: bookingId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data; // This will be the Razorpay order object
};

export const verifyPayment = async (paymentData) => {
  const token = getToken();
  const response = await axios.post(
    `${API_URL}/payments/verify-payment`,
    paymentData, // { razorpay_order_id, razorpay_payment_id, ... }
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};


export const getMyPayments = async () => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/users/me/payments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getGateLogs = async () => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/gate/logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};