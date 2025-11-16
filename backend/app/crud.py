# backend/app/crud.py

from datetime import datetime
from typing import List
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session
from .security import get_password_hash
from . import models, schemas
import os # <-- Import os
import json
from .websocket_manager import manager # <-- 1. Import the manager
from .security import verify_password, get_password_hash
from sqlalchemy.orm import Session 
from sqlalchemy import func

# --- 1. IMPORT QRCODE ---
import qrcode
from io import BytesIO

# User CRUD
def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[models.User]:
    """
    Reads a list of all users.
    """
    return db.query(models.User).offset(skip).limit(limit).all()

def update_user(db: Session, user: models.User, user_in: schemas.UserUpdate) -> models.User:
    """
    Update a user's details.
    """
    if user_in.email:
        user.email = user_in.email

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user_password(db: Session, user: models.User, new_password: str) -> models.User:
    """
    Updates a user's password.
    """
    user.hashed_password = get_password_hash(new_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ----------------------------
# SLOT CRUD Functions
# ----------------------------

def get_slot_by_number(db: Session, slot_number: str) -> models.Slot | None:
    """
    Reads a single slot from the database by its number.
    (Useful to prevent creating duplicates)
    """
    return db.query(models.Slot).filter(models.Slot.slot_number == slot_number).first()

def get_slots(db: Session, skip: int = 0, limit: int = 100) -> List[models.Slot]:
    """
    Reads a list of all slots.
    """
    return db.query(models.Slot).offset(skip).limit(limit).all()

def create_slot(db: Session, slot: schemas.SlotCreate) -> models.Slot:
    """
    Creates a new parking slot in the database.
    """
    db_slot = models.Slot(
        slot_number=slot.slot_number,
        vehicle_type=slot.vehicle_type,
        status=slot.status
        , price_per_hour=slot.price_per_hour
    )
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    return db_slot


def update_slot(db: Session, slot_id: int, slot_data: schemas.SlotUpdate) -> models.Slot | None:
    """
    Updates an existing slot.
    """
    db_slot = db.query(models.Slot).get(slot_id)
    if db_slot:
        db_slot.slot_number = slot_data.slot_number
        db_slot.vehicle_type = slot_data.vehicle_type
        db_slot.price_per_hour = slot_data.price_per_hour
        db_slot.status = slot_data.status # Allow admin to manually change status
        
        db.add(db_slot)
        db.commit()
        db.refresh(db_slot)
    return db_slot


# ----------------------------
# BOOKING CRUD Functions
# ----------------------------

def check_slot_availability(db: Session, slot_id: int, start_time: datetime, end_time: datetime) -> bool:
    """
    Checks if a slot is available for a given time window.
    A slot is unavailable if any existing booking overlaps with the requested time.
    """
    # Find bookings for this slot that overlap
    overlapping_bookings = db.query(models.Booking).filter(
        models.Booking.slot_id == slot_id,
        models.Booking.status.in_([models.BookingStatus.upcoming, models.BookingStatus.active]),
        or_(
            # Case 1: Existing booking starts during new booking
            and_(models.Booking.start_time >= start_time, models.Booking.start_time < end_time),
            # Case 2: Existing booking ends during new booking
            and_(models.Booking.end_time > start_time, models.Booking.end_time <= end_time),
            # Case 3: Existing booking envelops new booking
            and_(models.Booking.start_time <= start_time, models.Booking.end_time >= end_time)
        )
    ).count()

    return overlapping_bookings == 0


# --- 2. UPDATE create_booking ---
async def create_booking(db: Session, booking: schemas.BookingCreate, user_id: int) -> models.Booking:
    """
    Creates a new booking, updates slot to 'reserved', and broadcasts the change.
    """
    # Step 1: create booking record
    db_booking = models.Booking(
        user_id=user_id,
        slot_id=booking.slot_id,
        start_time=booking.start_time,
        end_time=booking.end_time,
        vehicle_id=booking.vehicle_id,     # <-- ADD THIS
        payment_method=booking.payment_method, # <-- ADD THIS
        status=models.BookingStatus.upcoming
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    # Step 2: Generate ID and QR code after we have the booking.id
    booking_id_str = f"SPS-{db_booking.id + 1000}"
    qr_file_name = f"{booking_id_str}.png"
    qr_file_path = os.path.join(os.path.dirname(__file__), "..", "static", "qr_codes", qr_file_name)
    qr_code_url = f"/static/qr_codes/{qr_file_name}"

    qr_img = qrcode.make(booking_id_str)
    qr_img.save(qr_file_path)

    # Step 3: Update booking and set slot to reserved
    slot = db_booking.slot
    slot.status = models.SlotStatus.reserved

    db_booking.booking_id_str = booking_id_str
    db_booking.qr_code_url = qr_code_url

    db.add(db_booking)
    db.add(slot)
    db.commit()
    db.refresh(db_booking)
    db.refresh(slot)

    # Step 4: Broadcast the change
    await manager.broadcast_json({"type": "slot_update", "slot": schemas.Slot.from_orm(slot).dict()})

    return db_booking

def get_bookings_by_user(db: Session, user_id: int) -> List[models.Booking]:
    """
    Gets all bookings for a specific user.
    """
    return db.query(models.Booking).filter(models.Booking.user_id == user_id).order_by(models.Booking.start_time.desc()).all()


# --- ADD THESE NEW FUNCTIONS ---

def get_booking_by_id_str(db: Session, booking_id_str: str) -> models.Booking | None:
    """
    Gets a single booking by its human-readable ID (e.g., "SPS-1002").
    """
    return db.query(models.Booking).filter(models.Booking.booking_id_str == booking_id_str).first()

# --- 5. UPDATE check_in_booking ---
async def check_in_booking(db: Session, booking: models.Booking) -> models.Booking:
    """
    Marks a booking as 'active', updates slot to 'booked' (occupied), and broadcasts.
    """
    slot = booking.slot

    booking.status = models.BookingStatus.active
    booking.check_in_time = datetime.utcnow()

    slot.status = models.SlotStatus.booked

    db.add(booking)
    db.add(slot)
    db.commit()
    db.refresh(booking)
    db.refresh(slot)

    await manager.broadcast_json({"type": "slot_update", "slot": schemas.Slot.from_orm(slot).dict()})

    return booking

# --- 6. UPDATE check_out_booking ---
async def check_out_booking(db: Session, booking: models.Booking) -> models.Booking:
    """
    Marks a booking as 'completed', frees slot to 'available', and broadcasts.
    """
    slot = booking.slot

    booking.status = models.BookingStatus.completed
    booking.check_out_time = datetime.utcnow()

    slot.status = models.SlotStatus.available

    db.add(booking)
    db.add(slot)
    db.commit()
    db.refresh(booking)
    db.refresh(slot)

    await manager.broadcast_json({"type": "slot_update", "slot": schemas.Slot.from_orm(slot).dict()})

    return booking

def delete_slot(db: Session, slot_id: int) -> models.Slot | None:
    """
    Deletes a slot from the database.
    """
    db_slot = db.query(models.Slot).get(slot_id)
    if db_slot:
        db.delete(db_slot)
        db.commit()
        return db_slot
    return None

# --- STATISTICS ---
def get_admin_stats(db: Session):
    total_slots = db.query(func.count(models.Slot.id)).scalar()

    available_slots = db.query(func.count(models.Slot.id)).filter(
        models.Slot.status == models.SlotStatus.available
    ).scalar()

    booked_slots = db.query(func.count(models.Slot.id)).filter(
        models.Slot.status.in_([models.SlotStatus.booked, models.SlotStatus.reserved])
    ).scalar()

    total_users = db.query(func.count(models.User.id)).scalar()

    total_bookings = db.query(func.count(models.Booking.id)).scalar()

    return {
        "total_slots": total_slots,
        "available_slots": available_slots,
        "booked_slots": booked_slots,
        "total_users": total_users,
        "total_bookings": total_bookings
    }

# ----------------------------
# VEHICLE CRUD Functions
# ----------------------------

def get_vehicle_by_plate(db: Session, license_plate: str) -> models.Vehicle | None:
    """
    Gets a vehicle by its license plate.
    """
    return db.query(models.Vehicle).filter(models.Vehicle.license_plate == license_plate).first()

def get_vehicles_by_user(db: Session, user_id: int) -> List[models.Vehicle]:
    """
    Gets all vehicles for a specific user.
    """
    return db.query(models.Vehicle).filter(models.Vehicle.owner_id == user_id).all()

def create_user_vehicle(db: Session, vehicle: schemas.VehicleCreate, user_id: int) -> models.Vehicle:
    """
    Creates a new vehicle for a user.
    """
    db_vehicle = models.Vehicle(
        **vehicle.dict(), # Pass all data from the schema
        owner_id=user_id
    )
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

def delete_vehicle(db: Session, vehicle_id: int, user_id: int) -> models.Vehicle | None:
    """
    Deletes a vehicle, ensuring it belongs to the user.
    """
    db_vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == vehicle_id,
        models.Vehicle.owner_id == user_id
    ).first()
    
    if db_vehicle:
        db.delete(db_vehicle)
        db.commit()
        return db_vehicle
    return None

# ----------------------------
# PAYMENT CRUD Functions
# ----------------------------

def create_payment_record(db: Session, booking_id: int, amount: float, order_id: str) -> models.Payment:
    """
    Creates a new payment record when a Razorpay order is generated.
    """
    db_payment = models.Payment(
        booking_id=booking_id,
        amount=amount,
        status=models.PaymentStatus.pending,
        payment_method="online",
        provider_transaction_id=order_id # Store the order_id here for now
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def update_payment_record(db: Session, order_id: str, payment_id: str, status: str) -> bool:
    """
    Updates a payment record after verification.
    """
    db_payment = db.query(models.Payment).filter(
        models.Payment.provider_transaction_id == order_id
    ).first()
    
    if db_payment:
        db_payment.status = status
        db_payment.provider_transaction_id = payment_id # Overwrite order_id with final payment_id
        db.add(db_payment)
        db.commit()
        return True
    return False

def get_payments_by_user(db: Session, user_id: int) -> List[models.Payment]:
    """
    Gets all payments for a specific user.
    """
    return db.query(models.Payment).join(models.Booking).filter(
        models.Booking.user_id == user_id
    ).order_by(models.Payment.created_at.desc()).all()

# ----------------------------
# GATE LOG CRUD Functions
# ----------------------------

def create_gate_log(db: Session, staff_id: int, booking: models.Booking, action: str):
    """
    Creates a new entry in the gate log.
    """
    log_entry = models.GateLog(
        staff_id=staff_id,
        booking_id=booking.id,
        action=action,
        vehicle_plate=booking.vehicle.license_plate # Get plate from vehicle
    )
    db.add(log_entry)
    db.commit()

def get_gate_logs(db: Session) -> List[models.GateLog]:
    """
    Gets all gate logs, newest first.
    """
    return db.query(models.GateLog).order_by(models.GateLog.timestamp.desc()).all()