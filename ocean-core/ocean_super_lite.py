#!/usr/bin/env python3
"""Ocean Core - Super Lite (100 lines)"""
import os, time, logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx

OLLAMA = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("MODEL", "llama3.1:8b")
PORT = int(os.getenv("PORT", "8030"))

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
log = logging.getLogger("Ocean")

# Services (inline)
SVC = {"eeg": "/modules/eeg-analysis", "neural": "/modules/neural-biofeedback",
       "doc": "/modules/document-tools", "fitness": "/modules/fitness-dashboard",
       "weather": "/modules/weather-dashboard", "crypto": "/modules/crypto-dashboard"}

PROMPT = """You are Curiosity Ocean 🌊 - AI of Clisonix Cloud (clisonix.cloud).
Be concise. Respond in user's language. Services: EEG, Neural, Documents, Fitness, Weather, Crypto."""

app = FastAPI(title="Ocean", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Req(BaseModel):
    message: str = None
    query: str = None

class Res(BaseModel):
    response: str
    time: float

def route(t):
    t = t.lower()
    for k, v in SVC.items():
        if k in t: return v
    return None

async def ask_ollama(prompt: str) -> str:
    async with httpx.AsyncClient(timeout=30.0) as c:
        r = await c.post(f"{OLLAMA}/api/chat", json={
            "model": MODEL,
            "messages": [{"role": "system", "content": PROMPT}, {"role": "user", "content": prompt}],
            "stream": False,
            "options": {"num_ctx": 512, "num_predict": 200, "temperature": 0.7}
        })
        return r.json().get("message", {}).get("content", "")

@app.get("/")
async def root(): return {"service": "Ocean", "model": MODEL}

@app.get("/health")
async def health(): return {"status": "ok"}

@app.post("/api/v1/chat", response_model=Res)
async def chat(req: Req):
    t0 = time.time()
    q = req.message or req.query
    if not q: raise HTTPException(400, "message required")
    
    svc = route(q)
    hint = f" Service: {svc}" if svc else ""
    
    try:
        resp = await ask_ollama(q + hint)
    except Exception as e:
        raise HTTPException(500, str(e))
    
    log.info(f"{time.time()-t0:.1f}s")
    return Res(response=resp, time=round(time.time()-t0, 2))

@app.post("/api/v1/query", response_model=Res)
async def query(req: Req): return await chat(req)

@app.get("/api/v1/status")
async def status(): return {"status": "ok", "model": MODEL}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
