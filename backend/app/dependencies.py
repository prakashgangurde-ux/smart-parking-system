# backend/app/api/dependencies.py

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import crud, models 
from .database import get_db
from .security import oauth2_scheme, decode_token

def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> models.User:
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = decode_token(token)
    if token_data is None or token_data.email is None:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# --- ADD THIS NEW FUNCTION ---
def get_current_admin_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """
    Dependency that checks if the current user is an admin.
    If not, it raises an HTTP 403 Forbidden error.
    """
    if current_user.role != models.UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have administrative privileges"
        )
    return current_user

# --- ADD THIS NEW FUNCTION ---
def get_current_staff_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """
    Dependency that checks if the current user is a Staff member OR an Admin.
    If not, it raises an HTTP 403 Forbidden error.
    """
    if current_user.role == models.UserRole.user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have staff or admin privileges"
        )
    return current_user