#!/usr/bin/env python3
"""
Ocean Nanogrid - Sleep/Wake Pattern
====================================
- Persistent connection pool (no reconnect overhead)
- Keep-alive to Ollama
- Minimal footprint when idle
- Instant wake on request
- Rate limiting: 20 msg/hour for free tier (6 months trial)
"""
import asyncio
import os
import time
from collections import defaultdict
from datetime import datetime, timedelta

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

OLLAMA = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("MODEL", "llama3.1:8b")
PORT = int(os.getenv("PORT", "8030"))

# Rate limiting config
FREE_TIER_LIMIT = 1000  # messages per hour (increased from 20 for better development experience)
FREE_TRIAL_MONTHS = 6
rate_limits: dict = defaultdict(list)  # user_id -> [timestamps]

def check_rate_limit(user_id: str, is_admin: bool = False) -> tuple[bool, int]:
    """Check if user is within rate limit. Returns (allowed, remaining)
    
    Args:
        user_id: User identifier (email, ID, or IP)
        is_admin: Admin users bypass all rate limits
    """
    # Admin users have no limit
    if is_admin:
        return True, float('inf')
    
    now = datetime.now()
    hour_ago = now - timedelta(hours=1)
    
    # Clean old entries
    rate_limits[user_id] = [ts for ts in rate_limits[user_id] if ts > hour_ago]
    
    count = len(rate_limits[user_id])
    if count >= FREE_TIER_LIMIT:
        return False, 0
    
    rate_limits[user_id].append(now)
    return True, FREE_TIER_LIMIT - count - 1

# Persistent client (connection pool)
_client: httpx.AsyncClient = None

async def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=300.0,  # 5 minutes for elastic responses
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
            http2=True  # HTTP/2 for multiplexing
        )
    return _client

# FastAPI
app = FastAPI(title="Ocean Nanogrid", version="2.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Req(BaseModel):
    message: str = None
    query: str = None

class Res(BaseModel):
    response: str
    time: float

@app.on_event("startup")
async def startup():
    """Warm up connection pool"""
    client = await get_client()
    try:
        await client.get(f"{OLLAMA}/api/version")
        print(f"🟢 Nanogrid ready - Ollama connected")
    except:
        print(f"🟡 Nanogrid ready - Ollama will connect on first request")

@app.on_event("shutdown")
async def shutdown():
    global _client
    if _client:
        await _client.aclose()

@app.get("/")
async def root():
    return {"service": "Ocean Nanogrid", "model": MODEL, "status": "awake"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/v1/chat", response_model=Res)
async def chat(req: Req, request: Request):
    t0 = time.time()
    q = req.message or req.query
    if not q:
        raise HTTPException(400, "message required")
    
    # Get user identifier (IP for now, will be Clerk user_id later)
    user_id = request.headers.get("X-User-ID") or request.client.host or "anonymous"
    
    # Check if admin (via header or user ID)
    is_admin = request.headers.get("X-Admin") == "true" or user_id in ["admin", "adm"]
    
    # Check rate limit
    allowed, remaining = check_rate_limit(user_id, is_admin=is_admin)
    if not allowed:
        raise HTTPException(429, detail={
            "error": "Rate limit exceeded",
            "limit": FREE_TIER_LIMIT,
            "period": "1 hour",
            "upgrade_url": "https://clisonix.com/pricing"
        })
    
    client = await get_client()
    
    try:
        r = await client.post(f"{OLLAMA}/api/chat", json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": "You are Ocean, AI of Clisonix Cloud. Respond thoroughly."},
                {"role": "user", "content": q}
            ],
            "stream": False,
            "options": {
                "num_ctx": 8192,
                "num_predict": -1,
                "temperature": 0.7
            }
        })
        resp = r.json().get("message", {}).get("content", "")
    except Exception as e:
        raise HTTPException(500, str(e))
    
    return Res(response=resp, time=round(time.time() - t0, 2))

@app.post("/api/v1/query", response_model=Res)
async def query(req: Req, request: Request):
    return await chat(req, request)

@app.get("/api/v1/rate-limit")
async def get_rate_limit(request: Request):
    """Check current rate limit status"""
    user_id = request.headers.get("X-User-ID") or request.client.host or "anonymous"
    now = datetime.now()
    hour_ago = now - timedelta(hours=1)
    
    # Clean and count
    rate_limits[user_id] = [ts for ts in rate_limits[user_id] if ts > hour_ago]
    count = len(rate_limits[user_id])
    
    return {
        "user_id": user_id,
        "used": count,
        "limit": FREE_TIER_LIMIT,
        "remaining": max(0, FREE_TIER_LIMIT - count),
        "period": "1 hour",
        "tier": "free_trial",
        "trial_months": FREE_TRIAL_MONTHS
    }

@app.get("/api/v1/status")
async def status():
    return {"status": "ok", "model": MODEL, "mode": "nanogrid"}

# Keep-alive pulse (background)
async def keep_alive():
    """Pulse every 30s to keep Ollama model hot"""
    while True:
        await asyncio.sleep(30)
        try:
            client = await get_client()
            await client.get(f"{OLLAMA}/api/ps")
        except:
            pass

@app.on_event("startup")
async def start_keepalive():
    asyncio.create_task(keep_alive())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
