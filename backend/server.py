from fastapi import FastAPI, APIRouter, Request
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


# Define Models
class MetadataSnapshot(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_metadata: Dict[str, Any]
    server_metadata: Dict[str, Any]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MetadataSnapshotCreate(BaseModel):
    client: Dict[str, Any]
    server: Optional[Dict[str, Any]] = None


@api_router.get("/")
async def root():
    return {"message": "Device Metadata API"}


@api_router.get("/metadata/collect")
async def collect_metadata(request: Request):
    """
    Collect server-side metadata from the request
    """
    # Extract client IP (considering proxy headers)
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
        server_metadata=input.server or {}
    )
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = snapshot_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.metadata_snapshots.insert_one(doc)
    return snapshot_obj


@api_router.get("/metadata/history", response_model=List[MetadataSnapshot])
async def get_metadata_history():
    """
    Get all saved metadata snapshots
    """
    snapshots = await db.metadata_snapshots.find({}, {"_id": 0}).to_list(100)
    
    # Convert ISO string timestamps back to datetime objects
    for snapshot in snapshots:
        if isinstance(snapshot['timestamp'], str):
            snapshot['timestamp'] = datetime.fromisoformat(snapshot['timestamp'])
    
    return snapshots


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
