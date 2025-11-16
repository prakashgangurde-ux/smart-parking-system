# backend/app/main.py

# --- 1. IMPORT STATICFILES ---
from fastapi.staticfiles import StaticFiles
import os # Import os to handle file paths
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from . import models
from .core.config import settings
from .api import auth, slots, bookings, gate, admin, users, payments
from .websocket_manager import manager # <-- 1. Import the manager

# --- 2. DEFINE STATIC PATH ---
# Create the directory if it doesn't exist
static_qr_dir = os.path.join(os.path.dirname(__file__), "..", "static", "qr_codes")
os.makedirs(static_qr_dir, exist_ok=True)


# --- Create Database Tables ---
# This line tells SQLAlchemy to create all tables
# based on your models.py
Base.metadata.create_all(bind=engine)

# --- Initialize FastAPI App ---
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the Smart Parking System project."
)

# --- CORS Middleware ---
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# --- 2. ADD THE WEBSOCKET ENDPOINT ---
@app.websocket("/ws/slots")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- API Routers ---
# Plug in your authentication routes
app.include_router(
    auth.router, 
    prefix=f"{settings.API_V1_STR}/auth", # This is now /api/v1/auth
    tags=["Authentication"]
)

# --- 2. ADD THE NEW SLOTS ROUTER ---
app.include_router(
    slots.router,
    prefix=f"{settings.API_V1_STR}/slots", # This makes URLs /api/v1/slots/
    tags=["Slots"]
)

# --- 3. ADD THE NEW BOOKINGS ROUTER ---
app.include_router(
    bookings.router,
    prefix=f"{settings.API_V1_STR}/bookings", # This makes URLs /api/v1/bookings/
    tags=["Bookings"]
)

# --- 4. MOUNT THE STATIC DIRECTORY ---
# This must be mounted *before* the routers
app.mount(
    "/static", 
    StaticFiles(directory=os.path.join(os.path.dirname(__file__), "..", "static")), 
    name="static"
)

# --- 5. ADD THE NEW GATE ROUTER ---
app.include_router(
    gate.router,
    prefix=f"{settings.API_V1_STR}/gate", # This makes URLs /api/v1/gate/
    tags=["Gate Operations"]
)

# --- 2. ADD THE NEW ADMIN ROUTER ---
app.include_router(
    admin.router,
    prefix=f"{settings.API_V1_STR}/admin", # This makes URLs /api/v1/admin/
    tags=["Admin"]
)

# --- 2. ADD THE NEW USERS ROUTER ---
app.include_router(
    users.router,
    prefix=f"{settings.API_V1_STR}/users",
    tags=["Users"]
)

# --- 2. ADD THE NEW PAYMENTS ROUTER ---
app.include_router(
    payments.router,
    prefix=f"{settings.API_V1_STR}/payments",
    tags=["Payments"]
)


# --- Root Endpoint ---
@app.get("/", tags=["Root"])
def read_root():
    """
    A simple "health check" endpoint.
    """
    return {"message": f"Welcome to the {settings.PROJECT_NAME}"}