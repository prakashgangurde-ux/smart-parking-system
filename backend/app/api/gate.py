# backend/app/api/gate.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from .. import crud, schemas, models
from ..database import get_db
from ..dependencies import get_current_staff_user 

router = APIRouter()

class GateCheckinRequest(BaseModel):
    booking_id_str: str

@router.post("/checkin", response_model=schemas.Booking)
async def gate_check_in(
    request_data: GateCheckinRequest,
    db: Session = Depends(get_db),
    staff_user: models.User = Depends(get_current_staff_user)
):
    """
    Check in a vehicle by its Booking ID (e.g., "SPS-1002").
    (Staff/Admin Only)
    """
    booking = crud.get_booking_by_id_str(db, booking_id_str=request_data.booking_id_str)
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking ID not found")
        
    if booking.status != models.BookingStatus.upcoming:
        raise HTTPException(
            status_code=400, 
            detail="Booking is not 'upcoming'"
        )
    
    crud.create_gate_log(db, staff_id=staff_user.id, booking=booking, action="check-in")
    return await crud.check_in_booking(db, booking=booking)


@router.post("/checkout", response_model=schemas.Booking)
async def gate_check_out(
    request_data: GateCheckinRequest,
    db: Session = Depends(get_db),
    staff_user: models.User = Depends(get_current_staff_user)
):
    """
    Check out a vehicle by its Booking ID (e.g., "SPS-1002").
    (Staff/Admin Only)
    """
    booking = crud.get_booking_by_id_str(db, booking_id_str=request_data.booking_id_str)
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking ID not found")

    if booking.status != models.BookingStatus.active:
        raise HTTPException(
            status_code=400, 
            detail="Booking is not 'active'"
        )
    
    crud.create_gate_log(db, staff_id=staff_user.id, booking=booking, action="check-out")
    return await crud.check_out_booking(db, booking=booking)


@router.get("/logs", response_model=List[schemas.GateLog])
def get_logs(
    db: Session = Depends(get_db),
    staff_user: models.User = Depends(get_current_staff_user)
):
    """
    Get all gate logs.
    (Staff/Admin Only)
    """
    return crud.get_gate_logs(db)