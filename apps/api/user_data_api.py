# -*- coding: utf-8 -*-
"""
User Data API - Backend for User Data Dashboard
Manages user data sources (IoT, API, LoRa, GSM, CBOR, MQTT, Webhook)
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid
import json
import os

# Router
user_data_router = APIRouter(prefix="/api/user", tags=["user-data"])

# ============================================================================
# ENUMS & MODELS
# ============================================================================

class DataSourceType(str, Enum):
    IOT = "iot"
    API = "api"
    LORA = "lora"
    GSM = "gsm"
    CBOR = "cbor"
    MQTT = "mqtt"
    WEBHOOK = "webhook"

class DataSourceStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"

class DataSourceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: DataSourceType
    endpoint: Optional[str] = None
    api_key: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class DataSourceUpdate(BaseModel):
    name: Optional[str] = None
    endpoint: Optional[str] = None
    api_key: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    status: Optional[DataSourceStatus] = None

class DataSourceResponse(BaseModel):
    id: str
    name: str
    type: DataSourceType
    status: DataSourceStatus
    endpoint: Optional[str]
    data_points: int
    last_sync: Optional[str]
    created_at: str
    updated_at: str

class MetricCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    source_id: str
    unit: str = ""
    
class MetricResponse(BaseModel):
    id: str
    name: str
    value: float
    unit: str
    trend: str  # up, down, stable
    source: str
    last_updated: str

class DataIngest(BaseModel):
    source_id: str
    data: Dict[str, Any]
    timestamp: Optional[str] = None

# ============================================================================
# IN-MEMORY STORAGE (Replace with PostgreSQL in production)
# ============================================================================

# Storage path
STORAGE_PATH = os.environ.get("USER_DATA_STORAGE", "/app/storage/user_data")

def ensure_storage():
    """Ensure storage directory exists"""
    os.makedirs(STORAGE_PATH, exist_ok=True)
    os.makedirs(f"{STORAGE_PATH}/sources", exist_ok=True)
    os.makedirs(f"{STORAGE_PATH}/metrics", exist_ok=True)
    os.makedirs(f"{STORAGE_PATH}/data", exist_ok=True)

def load_sources(user_id: str) -> List[dict]:
    """Load data sources for a user"""
    ensure_storage()
    path = f"{STORAGE_PATH}/sources/{user_id}.json"
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return []

def save_sources(user_id: str, sources: List[dict]):
    """Save data sources for a user"""
    ensure_storage()
    path = f"{STORAGE_PATH}/sources/{user_id}.json"
    with open(path, "w") as f:
        json.dump(sources, f, indent=2)

def load_metrics(user_id: str) -> List[dict]:
    """Load metrics for a user"""
    ensure_storage()
    path = f"{STORAGE_PATH}/metrics/{user_id}.json"
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return []

def save_metrics(user_id: str, metrics: List[dict]):
    """Save metrics for a user"""
    ensure_storage()
    path = f"{STORAGE_PATH}/metrics/{user_id}.json"
    with open(path, "w") as f:
        json.dump(metrics, f, indent=2)

def get_user_id(x_user_id: Optional[str] = Header(None, alias="X-User-ID")) -> str:
    """Get user ID from header or use default"""
    return x_user_id or "demo-user"

# ============================================================================
# DATA SOURCES ENDPOINTS
# ============================================================================

@user_data_router.get("/data-sources", response_model=List[DataSourceResponse])
async def list_data_sources(user_id: str = Depends(get_user_id)):
    """List all data sources for a user"""
    sources = load_sources(user_id)
    return sources

@user_data_router.post("/data-sources", response_model=DataSourceResponse)
async def create_data_source(
    source: DataSourceCreate,
    user_id: str = Depends(get_user_id)
):
    """Create a new data source"""
    sources = load_sources(user_id)
    
    now = datetime.utcnow().isoformat()
    new_source = {
        "id": str(uuid.uuid4()),
        "name": source.name,
        "type": source.type.value,
        "status": DataSourceStatus.ACTIVE.value,
        "endpoint": source.endpoint,
        "api_key": source.api_key,  # In production, encrypt this!
        "config": source.config or {},
        "data_points": 0,
        "last_sync": None,
        "created_at": now,
        "updated_at": now
    }
    
    sources.append(new_source)
    save_sources(user_id, sources)
    
    # Return without api_key
    response = {**new_source}
    response.pop("api_key", None)
    response.pop("config", None)
    return response

@user_data_router.get("/data-sources/{source_id}", response_model=DataSourceResponse)
async def get_data_source(
    source_id: str,
    user_id: str = Depends(get_user_id)
):
    """Get a specific data source"""
    sources = load_sources(user_id)
    
    for source in sources:
        if source["id"] == source_id:
            response = {**source}
            response.pop("api_key", None)
            response.pop("config", None)
            return response
    
    raise HTTPException(status_code=404, detail="Data source not found")

@user_data_router.put("/data-sources/{source_id}", response_model=DataSourceResponse)
async def update_data_source(
    source_id: str,
    update: DataSourceUpdate,
    user_id: str = Depends(get_user_id)
):
    """Update a data source"""
    sources = load_sources(user_id)
    
    for i, source in enumerate(sources):
        if source["id"] == source_id:
            if update.name:
                source["name"] = update.name
            if update.endpoint:
                source["endpoint"] = update.endpoint
            if update.api_key:
                source["api_key"] = update.api_key
            if update.config:
                source["config"] = update.config
            if update.status:
                source["status"] = update.status.value
            
            source["updated_at"] = datetime.utcnow().isoformat()
            sources[i] = source
            save_sources(user_id, sources)
            
            response = {**source}
            response.pop("api_key", None)
            response.pop("config", None)
            return response
    
    raise HTTPException(status_code=404, detail="Data source not found")

@user_data_router.delete("/data-sources/{source_id}")
async def delete_data_source(
    source_id: str,
    user_id: str = Depends(get_user_id)
):
    """Delete a data source"""
    sources = load_sources(user_id)
    
    for i, source in enumerate(sources):
        if source["id"] == source_id:
            sources.pop(i)
            save_sources(user_id, sources)
            return {"success": True, "message": "Data source deleted"}
    
    raise HTTPException(status_code=404, detail="Data source not found")

# ============================================================================
# METRICS ENDPOINTS
# ============================================================================

@user_data_router.get("/metrics", response_model=List[MetricResponse])
async def list_metrics(user_id: str = Depends(get_user_id)):
    """List all metrics for a user"""
    metrics = load_metrics(user_id)
    return metrics

@user_data_router.post("/metrics", response_model=MetricResponse)
async def create_metric(
    metric: MetricCreate,
    user_id: str = Depends(get_user_id)
):
    """Create a new metric"""
    metrics = load_metrics(user_id)
    sources = load_sources(user_id)
    
    # Find source name
    source_name = "Unknown"
    for source in sources:
        if source["id"] == metric.source_id:
            source_name = source["name"]
            break
    
    now = datetime.utcnow().isoformat()
    new_metric = {
        "id": str(uuid.uuid4()),
        "name": metric.name,
        "value": 0.0,
        "unit": metric.unit,
        "trend": "stable",
        "source": source_name,
        "source_id": metric.source_id,
        "last_updated": now
    }
    
    metrics.append(new_metric)
    save_metrics(user_id, metrics)
    
    return new_metric

# ============================================================================
# DATA INGESTION ENDPOINT
# ============================================================================

@user_data_router.post("/ingest")
async def ingest_data(
    data: DataIngest,
    user_id: str = Depends(get_user_id)
):
    """
    Ingest data from IoT devices, APIs, etc.
    This is where external data comes in.
    """
    sources = load_sources(user_id)
    
    # Find the source
    source_found = False
    for i, source in enumerate(sources):
        if source["id"] == data.source_id:
            source_found = True
            source["data_points"] = source.get("data_points", 0) + 1
            source["last_sync"] = data.timestamp or datetime.utcnow().isoformat()
            source["status"] = "active"
            sources[i] = source
            save_sources(user_id, sources)
            break
    
    if not source_found:
        raise HTTPException(status_code=404, detail="Data source not found")
    
    # Save the data point
    ensure_storage()
    data_path = f"{STORAGE_PATH}/data/{user_id}_{data.source_id}.jsonl"
    
    with open(data_path, "a") as f:
        entry = {
            "timestamp": data.timestamp or datetime.utcnow().isoformat(),
            "data": data.data
        }
        f.write(json.dumps(entry) + "\n")
    
    # Update metrics if applicable
    metrics = load_metrics(user_id)
    for i, metric in enumerate(metrics):
        if metric.get("source_id") == data.source_id:
            # Check if the metric name exists in the data
            if metric["name"].lower() in [k.lower() for k in data.data.keys()]:
                key = next(k for k in data.data.keys() if k.lower() == metric["name"].lower())
                old_value = metric["value"]
                new_value = float(data.data[key])
                
                # Calculate trend
                if new_value > old_value:
                    metric["trend"] = "up"
                elif new_value < old_value:
                    metric["trend"] = "down"
                else:
                    metric["trend"] = "stable"
                
                metric["value"] = new_value
                metric["last_updated"] = datetime.utcnow().isoformat()
                metrics[i] = metric
    
    save_metrics(user_id, metrics)
    
    return {
        "success": True,
        "message": "Data ingested successfully",
        "timestamp": datetime.utcnow().isoformat()
    }

# ============================================================================
# SUMMARY ENDPOINT
# ============================================================================

@user_data_router.get("/summary")
async def get_summary(user_id: str = Depends(get_user_id)):
    """Get summary statistics for dashboard"""
    sources = load_sources(user_id)
    metrics = load_metrics(user_id)
    
    total_sources = len(sources)
    active_sources = sum(1 for s in sources if s.get("status") == "active")
    total_data_points = sum(s.get("data_points", 0) for s in sources)
    total_metrics = len(metrics)
    
    return {
        "total_sources": total_sources,
        "active_sources": active_sources,
        "total_data_points": total_data_points,
        "total_metrics": total_metrics,
        "sources_by_type": {
            t.value: sum(1 for s in sources if s.get("type") == t.value)
            for t in DataSourceType
        }
    }

# ============================================================================
# WEBHOOK ENDPOINT (For external services to push data)
# ============================================================================

@user_data_router.post("/webhook/{source_id}")
async def webhook_ingest(
    source_id: str,
    request_data: Dict[str, Any]
):
    """
    Webhook endpoint for external services.
    No authentication required - uses source_id as identifier.
    """
    # Find the source across all users
    ensure_storage()
    sources_dir = f"{STORAGE_PATH}/sources"
    
    if not os.path.exists(sources_dir):
        raise HTTPException(status_code=404, detail="Source not found")
    
    for filename in os.listdir(sources_dir):
        if filename.endswith(".json"):
            user_id = filename.replace(".json", "")
            sources = load_sources(user_id)
            
            for source in sources:
                if source["id"] == source_id and source["type"] == "webhook":
                    # Found the source, ingest the data
                    ingest = DataIngest(
                        source_id=source_id,
                        data=request_data
                    )
                    return await ingest_data(ingest, user_id)
    
    raise HTTPException(status_code=404, detail="Webhook source not found")


# ============================================================================
# STANDALONE APP (for Docker deployment)
# ============================================================================
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Clisonix User Data API",
    version="1.0.0",
    description="User data sources management API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_data_router)

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "userdata"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
