# backend/app/models.py

import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, 
    Boolean, Enum, ForeignKey, Float
)
from sqlalchemy.orm import relationship
from .database import Base

# Enums
class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    staff = "staff"

class SlotStatus(str, enum.Enum):
    available = "available"
    reserved = "reserved"  # <-- ADD THIS
    booked = "booked"
    maintenance = "maintenance"

class BookingStatus(str, enum.Enum):
    upcoming = "upcoming"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.user)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    bookings = relationship("Booking", back_populates="user")
    vehicles = relationship("Vehicle", back_populates="owner")

class Slot(Base):
    __tablename__ = "slots"
    id = Column(Integer, primary_key=True, index=True)
    slot_number = Column(String(20), unique=True, nullable=False)
    vehicle_type = Column(String(50), default="Car")
    status = Column(Enum(SlotStatus), nullable=False, default=SlotStatus.available)
    # --- ADD THIS LINE ---
    price_per_hour = Column(Float, nullable=False, default=5.0) # Default ₹5/hr
    bookings = relationship("Booking", back_populates="slot")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    slot_id = Column(Integer, ForeignKey("slots.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    booking_id_str = Column(String(50), unique=True, index=True, nullable=True)
    qr_code_url = Column(String(255), nullable=True)
    status = Column(Enum(BookingStatus), nullable=False, default=BookingStatus.upcoming)
    payment_method = Column(String(50), default="cash") # 'cash' or 'online'
    user = relationship("User", back_populates="bookings")
    slot = relationship("Slot", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)
    vehicle = relationship("Vehicle")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.pending)
    payment_method = Column(String(50), default="cash")
    provider_transaction_id = Column(String(100), nullable=True) 
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    booking = relationship("Booking", back_populates="payment")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    license_plate = Column(String(50), unique=True, index=True, nullable=False)
    make = Column(String(50), nullable=True) # e.g., "Toyota"
    model = Column(String(50), nullable=True) # e.g., "Camry"
    
    # --- Link to the user ---
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="vehicles")

    def __repr__(self):
        return f"<Vehicle(license_plate='{self.license_plate}')>"

# --- ADD THIS NEW MODEL ---
class GateLog(Base):
    __tablename__ = "gate_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    staff_id = Column(Integer, ForeignKey("users.id"))
    booking_id = Column(Integer, ForeignKey("bookings.id"))

    action = Column(String(50)) # e.g., "check-in", "check-out"
    vehicle_plate = Column(String(50))

    staff = relationship("User")
    booking = relationship("Booking")