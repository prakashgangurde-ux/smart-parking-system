# backend/app/schemas.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from .models import UserRole, SlotStatus, BookingStatus, PaymentStatus

# Base
class UserBase(BaseModel):
    email: str

class SlotBase(BaseModel):
    slot_number: str
    vehicle_type: str
    status: SlotStatus = SlotStatus.available
    price_per_hour: float # <-- ADD THIS

# Create
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)
    role: UserRole = UserRole.user


class UserUpdate(BaseModel):
    # For now, we'll just let them update their email
    # We'll add password later
    email: Optional[str] = None

# --- ADD THESE NEW SCHEMAS ---
class VehicleBase(BaseModel):
    license_plate: str
    make: Optional[str] = None
    model: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

# --- ADD THIS NEW CLASS ---
# This is for the admin dashboard
class AdminUserCreate(UserCreate):
    # Admin can create any role
    role: UserRole 
# ---------------------------


class SlotCreate(SlotBase):
    pass

class SlotUpdate(SlotBase):
    pass

# --- UPDATE THIS SCHEMA ---
class BookingCreate(BaseModel):
    slot_id: int
    start_time: datetime
    end_time: datetime
    vehicle_id: int      # <-- ADD THIS
    payment_method: str  # <-- ADD THIS

# Read
class User(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Slot(SlotBase):
    id: int
    class Config:
        from_attributes = True



class Payment(BaseModel): # <-- This is the one to replace
    id: int
    booking_id: int
    status: PaymentStatus
    
    # --- ADD THESE MISSING FIELDS ---
    amount: float
    payment_method: str
    provider_transaction_id: Optional[str] = None
    created_at: datetime
    # --------------------------------

    class Config:
        from_attributes = True

class Booking(BaseModel):
    id: int
    user_id: int
    slot_id: int
    status: BookingStatus
    user: User
    slot: Slot
    payment: Optional[Payment] = None
    class Config:
        from_attributes = True

# --- UPDATE THIS SCHEMA ---
# We need a 'lite' version of Slot and User for the booking
class SlotLite(BaseModel):
    id: int
    slot_number: str
    class Config:
        from_attributes = True

class UserLite(BaseModel):
    id: int
    email: str
    class Config:
        from_attributes = True

class VehicleLite(BaseModel): # <-- ADD THIS NEW 'LITE' SCHEMA
    id: int
    license_plate: str
    class Config:
        from_attributes = True

class Booking(BaseModel):
    id: int
    status: BookingStatus
    start_time: datetime
    end_time: datetime
    booking_id_str: Optional[str] = None
    qr_code_url: Optional[str] = None
    payment_method: str # <-- ADD THIS
    user: UserLite
    slot: SlotLite
    vehicle: VehicleLite # <-- ADD THIS
    class Config:
        from_attributes = True


class ChangePasswordSchema(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=72)


# --- ADD THIS NEW SCHEMA ---
class Vehicle(VehicleBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True # Changed from orm_mode = True


# --- ADD THESE NEW SCHEMAS ---
class StaffLite(BaseModel): # A simple schema for the log
    id: int
    email: str
    class Config:
        from_attributes = True

class GateLog(BaseModel):
    id: int
    timestamp: datetime
    action: str
    vehicle_plate: str
    staff: StaffLite

    class Config:
        from_attributes = True


# Auth
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None