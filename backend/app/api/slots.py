# backend/app/api/slots.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas, models
from ..database import get_db
from app.dependencies import get_current_user, get_current_admin_user

router = APIRouter()

@router.post("/", response_model=schemas.Slot, status_code=status.HTTP_201_CREATED)
def create_new_slot(
    slot: schemas.SlotCreate, 
    db: Session = Depends(get_db),
    # This dependency protects the route:
    admin_user: models.User = Depends(get_current_admin_user)
):
    """
    Create a new parking slot.
    (Admin Only)
    """
    db_slot = crud.get_slot_by_number(db, slot_number=slot.slot_number)
    if db_slot:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A slot with this number already exists"
        )
    return crud.create_slot(db=db, slot=slot)


@router.get("/", response_model=List[schemas.Slot])
def read_all_slots(
    db: Session = Depends(get_db),
    # Any logged-in user can view slots:
    current_user: models.User = Depends(get_current_user) 
):
    """
    Get a list of all parking slots.
    (Any Logged-in User)
    """
    slots = crud.get_slots(db)
    return slots

# --- ADD THIS NEW ENDPOINT ---
@router.delete("/{slot_id}", response_model=schemas.Slot)
def delete_a_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
):
    """
    Delete a parking slot.
    (Admin Only)
    """
    db_slot = crud.delete_slot(db, slot_id=slot_id)
    if db_slot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slot not found"
        )
    return db_slot

# --- ADD THIS NEW ENDPOINT ---
@router.put("/{slot_id}", response_model=schemas.Slot)
def update_a_slot(
    slot_id: int,
    slot_data: schemas.SlotUpdate, # Use the new schema
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
):
    """
    Update a parking slot.
    (Admin Only)
    """
    db_slot = crud.update_slot(db, slot_id=slot_id, slot_data=slot_data)
    if db_slot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slot not found"
        )
    return db_slot