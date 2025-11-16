# backend/app/api/bookings.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import pdf_generator
from .. import crud, schemas, models
from ..database import get_db
# --- THIS IS THE FIX ---
from ..dependencies import get_current_user # Was 'from app.dependencies...'
# ------------------------
from fastapi.responses import FileResponse
import os
import asyncio

router = APIRouter()

@router.post("/", response_model=schemas.Booking, status_code=status.HTTP_201_CREATED)
async def create_new_booking(
    booking: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a new booking for the currently logged-in user.
    """
    
    is_available = crud.check_slot_availability(
        db, 
        slot_id=booking.slot_id, 
        start_time=booking.start_time, 
        end_time=booking.end_time
    )
    
    if not is_available:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This slot is not available for the requested time. It may be already booked."
        )
        
    new_booking = await crud.create_booking(db=db, booking=booking, user_id=current_user.id)
    return new_booking


@router.get("/me", response_model=List[schemas.Booking])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get all bookings for the currently logged-in user.
    """
    bookings = crud.get_bookings_by_user(db, user_id=current_user.id)
    return bookings


@router.get("/receipt/{booking_id}", response_class=FileResponse)
def get_booking_receipt(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Generates and returns a PDF receipt for a specific booking.
    """
    booking = db.query(models.Booking).get(booking_id)

    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
    if booking.user_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to view this receipt")

    receipts_dir = os.path.join(os.path.dirname(__file__), "..", "..", "static", "receipts")
    os.makedirs(receipts_dir, exist_ok=True)
    
    pdf_file_name = f"receipt_{booking.booking_id_str}.pdf"
    pdf_file_path = os.path.join(receipts_dir, pdf_file_name)

    try:
        pdf_generator.generate_booking_receipt(booking, pdf_file_path)
    except Exception as e:
        print(f"PDF Generation Error: {e}")
        raise HTTPException(status_code=500, detail="Could not generate PDF receipt.")

    return FileResponse(
        pdf_file_path, 
        media_type='application/pdf', 
        filename=pdf_file_name
    )