from fastapi import FastAPI, APIRouter, Request, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from paypalcheckoutsdk.core import PayPalHttpClient, SandboxEnvironment, LiveEnvironment
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest, OrdersGetRequest


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Stripe configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# PayPal configuration
PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID')
PAYPAL_SECRET = os.environ.get('PAYPAL_SECRET')
PAYPAL_MODE = os.environ.get('PAYPAL_MODE', 'sandbox')

# Initialize PayPal client
if PAYPAL_MODE == 'live':
    paypal_environment = LiveEnvironment(client_id=PAYPAL_CLIENT_ID, client_secret=PAYPAL_SECRET)
else:
    paypal_environment = SandboxEnvironment(client_id=PAYPAL_CLIENT_ID, client_secret=PAYPAL_SECRET)

paypal_client = PayPalHttpClient(paypal_environment)

# Pricing plans
PRICING_PLANS = {
    'free': {'price': 0.00, 'name': 'Free Plan'},
    'pro': {'price': 9.00, 'name': 'Pro Plan', 'stripe_price_id': None},
    'enterprise': {'price': 29.00, 'name': 'Enterprise Plan', 'stripe_price_id': None}
}


# Define Models
class MetadataSnapshot(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_metadata: Dict[str, Any]
    server_metadata: Dict[str, Any]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_id: Optional[str] = None

class MetadataSnapshotCreate(BaseModel):
    client: Dict[str, Any]
    server: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None

class CheckoutRequest(BaseModel):
    plan: str
    origin_url: str
    provider: str = 'stripe'  # 'stripe' or 'paypal'

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    plan: str
    amount: float
    currency: str
    payment_status: str
    metadata: Dict[str, Any]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


@api_router.get("/")
async def root():
    return {"message": "Device Metadata API - Premium Edition"}


@api_router.get("/metadata/collect")
async def collect_metadata(request: Request):
    """
    Collect server-side metadata from the request
    """
    client_ip = request.client.host
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    metadata = {
        "ip_address": client_ip,
        "user_agent": request.headers.get("user-agent", "N/A"),
        "accept_language": request.headers.get("accept-language", "N/A"),
        "accept_encoding": request.headers.get("accept-encoding", "N/A"),
        "referer": request.headers.get("referer", "N/A"),
        "origin": request.headers.get("origin", "N/A"),
        "connection": request.headers.get("connection", "N/A"),
        "sec_fetch_site": request.headers.get("sec-fetch-site", "N/A"),
        "sec_fetch_mode": request.headers.get("sec-fetch-mode", "N/A"),
        "sec_fetch_dest": request.headers.get("sec-fetch-dest", "N/A"),
        "host": request.headers.get("host", "N/A"),
    }
    
    return metadata


@api_router.post("/metadata/save", response_model=MetadataSnapshot)
async def save_metadata(input: MetadataSnapshotCreate):
    """
    Save a metadata snapshot to the database
    """
    snapshot_obj = MetadataSnapshot(
        client_metadata=input.client,
        server_metadata=input.server or {},
        user_id=input.user_id
    )
    
    doc = snapshot_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.metadata_snapshots.insert_one(doc)
    return snapshot_obj


@api_router.get("/metadata/history", response_model=List[MetadataSnapshot])
async def get_metadata_history(user_id: Optional[str] = None):
    """
    Get all saved metadata snapshots
    """
    query = {}
    if user_id:
        query['user_id'] = user_id
    
    snapshots = await db.metadata_snapshots.find(query, {"_id": 0}).sort("timestamp", -1).to_list(100)
    
    for snapshot in snapshots:
        if isinstance(snapshot['timestamp'], str):
            snapshot['timestamp'] = datetime.fromisoformat(snapshot['timestamp'])
    
    return snapshots


@api_router.post("/payments/checkout")
async def create_checkout(request: Request, checkout_req: CheckoutRequest):
    """
    Create Stripe or PayPal checkout session for subscription
    """
    if checkout_req.plan not in PRICING_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
    
    if checkout_req.plan == 'free':
        raise HTTPException(status_code=400, detail="Free plan doesn't require payment")
    
    plan_info = PRICING_PLANS[checkout_req.plan]
    amount = plan_info['price']
    
    if checkout_req.provider == 'stripe':
        return await create_stripe_checkout(request, checkout_req, plan_info, amount)
    elif checkout_req.provider == 'paypal':
        return await create_paypal_order(request, checkout_req, plan_info, amount)
    else:
        raise HTTPException(status_code=400, detail="Invalid payment provider")


async def create_stripe_checkout(request: Request, checkout_req: CheckoutRequest, plan_info: dict, amount: float):
    """
    Create Stripe checkout session
    """
    host_url = checkout_req.origin_url
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{host_url}/success?session_id={{CHECKOUT_SESSION_ID}}&provider=stripe"
    cancel_url = f"{host_url}/"
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "plan": checkout_req.plan,
            "plan_name": plan_info['name']
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    transaction = PaymentTransaction(
        session_id=session.session_id,
        plan=checkout_req.plan,
        amount=amount,
        currency="usd",
        payment_status="pending",
        metadata={
            "plan_name": plan_info['name'],
            "provider": "stripe"
        }
    )
    
    doc = transaction.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.payment_transactions.insert_one(doc)
    
    return {"url": session.url, "session_id": session.session_id, "provider": "stripe"}


async def create_paypal_order(request: Request, checkout_req: CheckoutRequest, plan_info: dict, amount: float):
    """
    Create PayPal order
    """
    order_request = OrdersCreateRequest()
    order_request.prefer('return=representation')
    
    order_request.request_body({
        "intent": "CAPTURE",
        "purchase_units": [{
            "reference_id": checkout_req.plan,
            "description": plan_info['name'],
            "amount": {
                "currency_code": "USD",
                "value": f"{amount:.2f}"
            }
        }],
        "application_context": {
            "return_url": f"{checkout_req.origin_url}/success?provider=paypal",
            "cancel_url": f"{checkout_req.origin_url}/",
            "brand_name": "Device Intel",
            "user_action": "PAY_NOW"
        }
    })
    
    try:
        response = paypal_client.execute(order_request)
        order_id = response.result.id
        
        # Find approval URL
        approval_url = None
        for link in response.result.links:
            if link.rel == "approve":
                approval_url = link.href
                break
        
        # Create transaction record
        transaction = PaymentTransaction(
            session_id=order_id,
            plan=checkout_req.plan,
            amount=amount,
            currency="usd",
            payment_status="pending",
            metadata={
                "plan_name": plan_info['name'],
                "provider": "paypal"
            }
        )
        
        doc = transaction.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.payment_transactions.insert_one(doc)
        
        return {"url": approval_url, "order_id": order_id, "provider": "paypal"}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PayPal error: {str(e)}")


@api_router.post("/payments/paypal/capture/{order_id}")
async def capture_paypal_order(order_id: str):
    """
    Capture PayPal order after approval
    """
    capture_request = OrdersCaptureRequest(order_id)
    
    try:
        response = paypal_client.execute(capture_request)
        
        # Update transaction
        await db.payment_transactions.update_one(
            {"session_id": order_id},
            {"$set": {"payment_status": response.result.status.lower()}}
        )
        
        return {
            "order_id": order_id,
            "status": response.result.status,
            "payer_email": response.result.payer.email_address if hasattr(response.result, 'payer') else None
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PayPal capture error: {str(e)}")


@api_router.get("/payments/status/{session_id}")
async def get_payment_status(request: Request, session_id: str):
    """
    Get payment status from Stripe
    """
    host_url = str(request.base_url)
    webhook_url = f"{host_url.rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction in database
        existing_transaction = await db.payment_transactions.find_one(
            {"session_id": session_id},
            {"_id": 0}
        )
        
        if existing_transaction and existing_transaction['payment_status'] != status.payment_status:
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": status.payment_status}}
            )
        
        return {
            "session_id": session_id,
            "payment_status": status.payment_status,
            "status": status.status,
            "amount": status.amount_total / 100,  # Convert cents to dollars
            "currency": status.currency,
            "metadata": status.metadata
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events
    """
    host_url = str(request.base_url)
    webhook_url = f"{host_url.rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update payment transaction
        await db.payment_transactions.update_one(
            {"session_id": webhook_response.session_id},
            {"$set": {"payment_status": webhook_response.payment_status}}
        )
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
