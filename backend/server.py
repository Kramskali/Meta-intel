from fastapi import FastAPI, APIRouter, Request, HTTPException, Header, Depends
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
from paypalcheckoutsdk.core import PayPalHttpClient, SandboxEnvironment, LiveEnvironment
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest, OrdersGetRequest


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database and payment clients are optional at startup so /health can report
# configuration problems without crashing the whole service.
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME', 'device_intel_prod')
cert_path = os.environ.get('MONGODB_CERT_PATH')
client = None
db = None

if mongo_url:
    if cert_path and os.path.exists(cert_path):
        client = AsyncIOMotorClient(
            mongo_url,
            tls=True,
            tlsCertificateKeyFile=cert_path,
            authMechanism='MONGODB-X509'
        )
    else:
        client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

# PayPal configuration
PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID')
PAYPAL_SECRET = os.environ.get('PAYPAL_SECRET')
PAYPAL_MODE = os.environ.get('PAYPAL_MODE', 'sandbox')

# Initialize PayPal only when both protected settings are present.
paypal_client = None
if PAYPAL_CLIENT_ID and PAYPAL_SECRET:
    if PAYPAL_MODE == 'live':
        paypal_environment = LiveEnvironment(client_id=PAYPAL_CLIENT_ID, client_secret=PAYPAL_SECRET)
    else:
        paypal_environment = SandboxEnvironment(client_id=PAYPAL_CLIENT_ID, client_secret=PAYPAL_SECRET)
    paypal_client = PayPalHttpClient(paypal_environment)

# Optional shared-secret gate for state-changing / data-returning endpoints.
# Fail-closed: if API_KEY is not configured, protected endpoints return 503.
API_KEY = os.environ.get('API_KEY')

async def require_api_key(x_api_key: Optional[str] = Header(default=None)):
    if not API_KEY:
        raise HTTPException(status_code=503, detail="Endpoint disabled: API_KEY not configured")
    if not x_api_key or x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")

# Create the main app without a prefix
app = FastAPI()

@app.get("/health")
async def health_check():
    """Readiness probe: verifies the database actually answers, not just that
    a client object was constructed."""
    db_reachable = False
    if db is not None:
        try:
            await db.command("ping")
            db_reachable = True
        except Exception:
            db_reachable = False
    return {
        "status": "ok",
        "database_configured": db is not None,
        "database_reachable": db_reachable,
        "paypal_configured": all([PAYPAL_CLIENT_ID, PAYPAL_SECRET]),
    }


# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


def require_db():
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not configured")
    return db


def require_paypal():
    if paypal_client is None:
        raise HTTPException(status_code=503, detail="PayPal is not configured")
    return paypal_client

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
    provider: str = 'paypal'

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
    Report server-side metadata from the request. Both the socket peer and
    the X-Forwarded-For header are reported separately and labeled, because
    X-Forwarded-For is client-supplied and freely spoofable; showing that
    difference is part of what this tool teaches.
    """
    socket_ip = request.client.host if request.client else "N/A"
    forwarded_for = request.headers.get("X-Forwarded-For", "")

    metadata = {
        "connection_ip": socket_ip,
        "x_forwarded_for_raw": forwarded_for,
        "ip_note": "connection_ip is the peer this server actually talks to (on Render, the edge proxy). x_forwarded_for_raw is a request header any client can set to any value; never trust it as identity.",
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


@api_router.post("/metadata/save", response_model=MetadataSnapshot,
                 dependencies=[Depends(require_api_key)])
async def save_metadata(input: MetadataSnapshotCreate):
    """
    Save a metadata snapshot to the database. Protected: requires X-API-Key.
    """
    snapshot_obj = MetadataSnapshot(
        client_metadata=input.client,
        server_metadata=input.server or {},
        user_id=input.user_id
    )

    doc = snapshot_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()

    database = require_db()
    _ = await database.metadata_snapshots.insert_one(doc)
    return snapshot_obj


@api_router.get("/metadata/history", response_model=List[MetadataSnapshot],
                dependencies=[Depends(require_api_key)])
async def get_metadata_history(user_id: Optional[str] = None):
    """
    Get saved metadata snapshots. Protected: requires X-API-Key.
    A user_id query parameter is required; unscoped reads are not served.
    """
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    database = require_db()
    snapshots = await database.metadata_snapshots.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("timestamp", -1).to_list(100)

    for snapshot in snapshots:
        if isinstance(snapshot['timestamp'], str):
            snapshot['timestamp'] = datetime.fromisoformat(snapshot['timestamp'])

    return snapshots


@api_router.post("/payments/checkout")
async def create_checkout(request: Request, checkout_req: CheckoutRequest):
    """
    Create a PayPal checkout order.
    """
    if checkout_req.plan not in PRICING_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan selected")

    if checkout_req.plan == 'free':
        raise HTTPException(status_code=400, detail="Free plan doesn't require payment")

    plan_info = PRICING_PLANS[checkout_req.plan]
    amount = plan_info['price']

    if checkout_req.provider == 'stripe':
        raise HTTPException(status_code=503, detail="Stripe is not available. Use PayPal.")
    elif checkout_req.provider == 'paypal':
        return await create_paypal_order(request, checkout_req, plan_info, amount)
    else:
        raise HTTPException(status_code=400, detail="Invalid payment provider")


async def create_paypal_order(request: Request, checkout_req: CheckoutRequest, plan_info: dict, amount: float):
    """
    Create PayPal order
    """
    paypal = require_paypal()
    database = require_db()
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
        response = paypal.execute(order_request)
        order_id = response.result.id

        # Find approval URL
        approval_url = None
        for link in response.result.links:
            if link.rel == "approve":
                approval_url = link.href
                break

        if not approval_url:
            raise HTTPException(status_code=502, detail="PayPal did not return an approval URL")

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
        await database.payment_transactions.insert_one(doc)

        return {"url": approval_url, "order_id": order_id, "provider": "paypal"}

    except HTTPException:
        raise
    except Exception:
        logger.exception("PayPal order creation failed")
        raise HTTPException(status_code=502, detail="PayPal order creation failed")


@api_router.post("/payments/paypal/capture/{order_id}")
async def capture_paypal_order(order_id: str):
    """
    Capture PayPal order after approval. The order is verified with PayPal
    before capture; nothing about the caller's claims is trusted. Payer
    details are not returned.
    """
    paypal = require_paypal()
    database = require_db()

    try:
        # Verify the order exists at PayPal and is in a capturable state.
        get_response = paypal.execute(OrdersGetRequest(order_id))
        order_status = get_response.result.status

        if order_status == "COMPLETED":
            return {"order_id": order_id, "status": "COMPLETED"}
        if order_status != "APPROVED":
            raise HTTPException(status_code=409, detail="Order is not approved for capture")

        capture_response = paypal.execute(OrdersCaptureRequest(order_id))

        # Update transaction
        await database.payment_transactions.update_one(
            {"session_id": order_id},
            {"$set": {"payment_status": capture_response.result.status.lower()}},
            upsert=True
        )

        return {
            "order_id": order_id,
            "status": capture_response.result.status
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception("PayPal capture failed for order %s", order_id)
        raise HTTPException(status_code=502, detail="PayPal capture failed")


# Include the router in the main app
app.include_router(api_router)

# CORS: known frontends only, no credentials. Never reflect arbitrary origins.
DEFAULT_CORS_ORIGINS = 'https://meta-intel.vercel.app,https://metaintel.com,https://www.metaintel.com'
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get('CORS_ORIGINS', DEFAULT_CORS_ORIGINS).split(','),
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
    if client is not None:
        client.close()
