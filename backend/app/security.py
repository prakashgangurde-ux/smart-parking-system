# backend/app/security.py

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError
from .core.config import settings
from . import schemas

# 1. Password Hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')
    truncated_bytes = password_bytes[:72]
    return pwd_context.hash(truncated_bytes)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')
    truncated_bytes = password_bytes[:72]
    try:
        return pwd_context.verify(truncated_bytes, hashed_password)
    except Exception:
        return False

# 2. OAuth2
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/token"
)

# 3. Token Creation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# 4. Token Decoding
def decode_token(token: str) -> schemas.TokenData | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_data = schemas.TokenData(email=payload.get("sub"))
        return token_data
    except (JWTError, ValidationError, AttributeError):
        return None