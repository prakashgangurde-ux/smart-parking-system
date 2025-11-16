# backend/app/api/admin.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas, models
from ..database import get_db
from app.dependencies import get_current_admin_user

router = APIRouter()


# --- ADD THIS NEW ENDPOINT ---
@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
):
    """
    Get statistics for the admin dashboard.
    (Admin Only)
    """
    return crud.get_admin_stats(db)

# --- ADD THIS NEW ENDPOINT ---
@router.get("/users", response_model=List[schemas.User])
def read_all_users(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
):
    """
    Get a list of all users.
    (Admin Only)
    """
    users = crud.get_users(db)
    return users


@router.post("/users/create", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_new_user_by_admin(
    user_to_create: schemas.AdminUserCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
):
    """
    Create a new user (of any role).
    (Admin Only)
    """
    # 1. Check if user already exists
    db_user = crud.get_user_by_email(db, email=user_to_create.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # 2. Use the standard crud.create_user function
    # It will use the role from the AdminUserCreate schema
    return crud.create_user(db=db, user=user_to_create)