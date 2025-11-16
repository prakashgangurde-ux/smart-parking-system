# backend/app/api/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..database import get_db
from ..dependencies import get_current_user
from typing import List # <-- Make sure List is imported

router = APIRouter()

@router.put("/me", response_model=schemas.User)
def update_user_me(
    user_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update the currently logged-in user's details.
    """
    user = crud.update_user(db, user=current_user, user_in=user_in)
    return user

# --- ADD THESE NEW ENDPOINTS ---

@router.post("/me/vehicles", response_model=schemas.Vehicle, status_code=status.HTTP_201_CREATED)
def create_vehicle_for_user(
    vehicle: schemas.VehicleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Add a new vehicle for the current user.
    """
    existing_vehicle = crud.get_vehicle_by_plate(db, license_plate=vehicle.license_plate)
    if existing_vehicle:
        raise HTTPException(
            status_code=400,
            detail="A vehicle with this license plate is already registered."
        )
    return crud.create_user_vehicle(db=db, vehicle=vehicle, user_id=current_user.id)


@router.get("/me/vehicles", response_model=List[schemas.Vehicle])
def read_vehicles_for_user(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get all vehicles for the current user.
    """
    return crud.get_vehicles_by_user(db, user_id=current_user.id)


@router.delete("/me/vehicles/{vehicle_id}", response_model=schemas.Vehicle)
def delete_vehicle_for_user(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Delete a vehicle for the current user.
    """
    db_vehicle = crud.delete_vehicle(db, vehicle_id=vehicle_id, user_id=current_user.id)
    if db_vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found or you do not have permission to delete it."
        )
    return db_vehicle

@router.get("/me/payments", response_model=List[schemas.Payment])
def read_payments_for_user(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get all payments for the current user.
    """
    return crud.get_payments_by_user(db, user_id=current_user.id)