#!/usr/bin/env python3
"""
Ocean Nanogrid - Sleep/Wake Pattern
====================================
- Persistent connection pool (no reconnect overhead)
- Keep-alive to Ollama
- Minimal footprint when idle
- Instant wake on request
"""
import os, time, asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

OLLAMA = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("MODEL", "llama3.1:8b")
PORT = int(os.getenv("PORT", "8030"))

# Persistent client (connection pool)
_client: httpx.AsyncClient = None

async def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=30.0,
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
async def chat(req: Req):
    t0 = time.time()
    q = req.message or req.query
    if not q:
        raise HTTPException(400, "message required")
    
    client = await get_client()
    
    try:
        r = await client.post(f"{OLLAMA}/api/chat", json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": "You are Ocean, AI of Clisonix Cloud. Be brief."},
                {"role": "user", "content": q}
            ],
            "stream": False,
            "options": {
                "num_ctx": 512,
                "num_predict": 100,
                "temperature": 0.7
            }
        })
        resp = r.json().get("message", {}).get("content", "")
    except Exception as e:
        raise HTTPException(500, str(e))
    
    return Res(response=resp, time=round(time.time() - t0, 2))

@app.post("/api/v1/query", response_model=Res)
async def query(req: Req):
    return await chat(req)

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
