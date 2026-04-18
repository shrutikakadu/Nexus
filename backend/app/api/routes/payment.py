import os
import razorpay
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(override=True)

router = APIRouter(prefix="/api/payment", tags=["payment"])

def get_razorpay_client():
    load_dotenv(override=True)
    key_id = os.environ.get("RAZORPAY_KEY_ID", "rzp_test_YourMockKeyId")
    key_secret = os.environ.get("RAZORPAY_KEY_SECRET", "YourMockKeySecret")
    if key_id == "rzp_test_YourMockKeyId":
        return None, key_id
    try:
        return razorpay.Client(auth=(key_id, key_secret)), key_id
    except Exception as e:
        print(f"Failed to initialize Razorpay client: {e}")
        return None, key_id

class CreateOrderRequest(BaseModel):
    amount: int
    currency: str = "INR"
    receipt: str = "receipt_01"

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/create-order")
def create_order(order_req: CreateOrderRequest):
    client, key_id = get_razorpay_client()
    if not client:
        if key_id == "rzp_test_YourMockKeyId" or not key_id:
            raise HTTPException(status_code=400, detail="Your .env file is currently unsaved or empty. Please save the .env file with your valid Razorpay keys.")
        raise HTTPException(status_code=500, detail="Razorpay client not initialized. Check API keys.")

    try:
        data = {
            "amount": order_req.amount * 100, # Amount in paise
            "currency": order_req.currency,
            "receipt": order_req.receipt
        }
        order = client.order.create(data=data)
        return {"order_id": order["id"], "amount": order["amount"], "currency": order["currency"], "key_id": key_id}
    except razorpay.errors.BadRequestError as e:
        raise HTTPException(status_code=400, detail=f"Razorpay Bad Request: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Razorpay Error: {str(e)}")

@router.post("/verify-payment")
def verify_payment(payment_req: VerifyPaymentRequest):
    client, _ = get_razorpay_client()
    if not client:
        raise HTTPException(status_code=500, detail="Razorpay client not initialized.")
        
    try:
        params_dict = {
            'razorpay_order_id': payment_req.razorpay_order_id,
            'razorpay_payment_id': payment_req.razorpay_payment_id,
            'razorpay_signature': payment_req.razorpay_signature
        }
        # Verify the signature
        client.utility.verify_payment_signature(params_dict)
        return {"status": "success", "message": "Payment verified successfully"}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment signature verification failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
