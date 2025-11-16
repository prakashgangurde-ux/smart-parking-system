# backend/app/api/payments.py
import math
import razorpay
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .. import crud, schemas, models
from ..database import get_db
from ..dependencies import get_current_user
from ..core.config import settings

router = APIRouter()

# Initialize Razorpay client
client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

class OrderRequest(BaseModel):
    booking_id: int

class PaymentVerificationRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    booking_id: int

@router.post("/create-order", status_code=status.HTTP_201_CREATED)
def create_razorpay_order(
    order_request: OrderRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a Razorpay order for an existing booking.
    """
    booking = db.query(models.Booking).get(order_request.booking_id)
    
    # Security check
    if not booking or booking.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Booking not found or access denied")
        
    # Calculate total
    slot = booking.slot
    duration = booking.end_time - booking.start_time
    total_hours = max(1, math.ceil(duration.total_seconds() / 3600))
    total_amount = total_hours * slot.price_per_hour
    
    # Create Razorpay Order
    order_data = {
        "amount": int(total_amount * 100),  # Amount in paise (e.g., ₹100 = 10000 paise)
        "currency": "INR",
        "receipt": f"receipt_booking_{booking.booking_id_str}",
        "notes": {
            "booking_id": booking.id,
            "user_email": current_user.email
        }
    }
    
    try:
        order = client.order.create(data=order_data)
        
        # Create a new payment record in our DB
        crud.create_payment_record(
            db, 
            booking_id=booking.id, 
            amount=total_amount, 
            order_id=order['id']
        )
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Razorpay error: {e}")


@router.post("/verify-payment")
def verify_payment_signature(
    request_data: PaymentVerificationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Verify the payment signature from Razorpay.
    """
    params_dict = {
        'razorpay_order_id': request_data.razorpay_order_id,
        'razorpay_payment_id': request_data.razorpay_payment_id,
        'razorpay_signature': request_data.razorpay_signature
    }
    
    try:
        # 1. Verify the signature
        client.utility.verify_payment_signature(params_dict)
        
        # 2. Signature is valid. Find and update our payment record.
        success = crud.update_payment_record(
            db, 
            order_id=request_data.razorpay_order_id, 
            payment_id=request_data.razorpay_payment_id,
            status="completed"
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Payment record not found")
            
        return {"status": "success", "message": "Payment verified and recorded."}

    except razorpay.errors.SignatureVerificationError:
        crud.update_payment_record(
            db, 
            order_id=request_data.razorpay_order_id, 
            payment_id=request_data.razorpay_payment_id,
            status="failed"
        )
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))