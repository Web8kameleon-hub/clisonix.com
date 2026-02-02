#!/usr/bin/env python3
"""Ocean Chameleon - Adaptive Token Scaling"""
import os, time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

OLLAMA = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("MODEL", "llama3.1:8b")
PORT = int(os.getenv("PORT", "8030"))

PROMPT = "You are Ocean, AI of Clisonix Cloud. Be brief."

# Chameleon: Adaptive token scaling
COMPLEX_KEYWORDS = {
    "explain", "why", "how", "describe", "compare", "analyze", "detail",
    "shpjego", "pse", "si", "përshkruaj", "krahaso", "analizo",  # Albanian
    "erklär", "warum", "wie", "beschreib",  # German
    "spiega", "perché", "come", "descrivi",  # Italian
    "explain", "código", "arquitectura", "documentation"  # Spanish/Tech
}

MEDIUM_KEYWORDS = {
    "what", "list", "show", "tell", "services", "help",
    "çfarë", "lista", "trego", "ndihm", "shërbim",
    "was", "zeig", "hilf", "cosa", "mostra", "aiut"
}

def get_predict_tokens(query: str) -> tuple:
    """Chameleon: Returns (num_predict, num_ctx) based on query complexity"""
    q = query.lower()
    words = set(q.split())
    
    # Complex query → more tokens
    if words & COMPLEX_KEYWORDS or len(q) > 100 or "?" in q and len(q) > 50:
        return 150, 1024  # ~6-8s
    
    # Medium query
    if words & MEDIUM_KEYWORDS or len(q) > 30:
        return 80, 512   # ~3-4s
    
    # Simple query (hi, hello, ok)
    return 30, 256       # ~1-2s

app = FastAPI(title="Ocean Chameleon", version="2.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Req(BaseModel):
    message: str = None
    query: str = None

class Res(BaseModel):
    response: str
    time: float
    mode: str = "chameleon"

async def ask_ollama(prompt: str) -> tuple:
    """Returns (response, mode) with adaptive token scaling"""
    num_predict, num_ctx = get_predict_tokens(prompt)
    mode = "fast" if num_predict <= 30 else ("medium" if num_predict <= 80 else "deep")
    
    async with httpx.AsyncClient(timeout=60.0) as c:
        r = await c.post(f"{OLLAMA}/api/chat", json={
            "model": MODEL,
            "messages": [{"role": "system", "content": PROMPT}, {"role": "user", "content": prompt}],
            "stream": False,
            "options": {"num_ctx": num_ctx, "num_predict": num_predict, "temperature": 0.7}
        })
        return r.json().get("message", {}).get("content", ""), mode

@app.get("/")
async def root(): return {"service": "Ocean Chameleon", "model": MODEL, "modes": ["fast", "medium", "deep"]}

@app.get("/health")
async def health(): return {"status": "ok"}

@app.post("/api/v1/chat", response_model=Res)
async def chat(req: Req):
    t0 = time.time()
    q = req.message or req.query
    if not q: raise HTTPException(400, "message required")
    
    try:
        resp, mode = await ask_ollama(q)
    except Exception as e:
        raise HTTPException(500, str(e))
    
    return Res(response=resp, time=round(time.time()-t0, 2), mode=mode)

@app.post("/api/v1/query", response_model=Res)
async def query(req: Req): return await chat(req)

@app.get("/api/v1/status")
async def status(): return {"status": "ok", "model": MODEL, "mode": "chameleon"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
