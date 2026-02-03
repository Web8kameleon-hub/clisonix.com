#!/usr/bin/env python3
"""
Ocean Curiosity v5.1 - Optimized for Speed
Fast responses for simple queries, elastic for complex ones
Tokens: min 256 for greetings, scales up for longer queries
"""
import os, time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

OLLAMA = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("MODEL", "llama3.1:8b")
PORT = int(os.getenv("PORT", "8030"))

# ═══════════════════════════════════════════════════════════════════════════════
# SYSTEM PROMPT v6.1.0 - MICRO VERSION (Optimized for speed)
# ═══════════════════════════════════════════════════════════════════════════════
SYSTEM_PROMPT = """Jam Curiosity Ocean (clisonix.com).
Përgjigju në gjuhën e pyetjes. Ji konciz, i saktë.
Mos shpik. Pranoj kur nuk di. Mos jep të dhëna të brendshme.

Clisonix: AI platform by Ledjan Ahmati / ABA GmbH (Germany).
Features: Neural Intelligence, EEG Analysis, AI Chat, Industrial IoT.
Website: https://clisonix.cloud"""

# ═══════════════════════════════════════════════════════════════════════════════
# SIMPLE QUERY DETECTION - For fast responses
# ═══════════════════════════════════════════════════════════════════════════════
SIMPLE_PATTERNS = [
    "pershendetje", "përshëndetje", "hello", "hi", "hey", "hallo",
    "mirëdita", "miredita", "miremengjesi", "mirembrema",
    "si je", "si jeni", "how are you", "wie geht",
    "ciao", "buongiorno", "salut", "bonjour", "hola",
    "kalimera", "geia", "yassou", "merhaba",
    "faleminderit", "thank", "thanks", "danke", "grazie", "merci",
    "ok", "okay", "po", "jo", "yes", "no", "ja", "nein",
]

def is_simple_query(text: str) -> bool:
    """Detect simple greetings and short queries"""
    text_lower = text.lower().strip()
    # Very short queries
    if len(text_lower) < 30:
        return True
    # Known simple patterns
    for pattern in SIMPLE_PATTERNS:
        if pattern in text_lower:
            return True
    return False

def get_smart_tokens(text: str) -> int:
    """Smart token allocation based on query complexity"""
    text_len = len(text.strip())
    
    # Simple greetings: fast response (256 tokens)
    if is_simple_query(text):
        return 256
    
    # Short queries (< 100 chars): medium response (512 tokens)
    if text_len < 100:
        return 512
    
    # Medium queries (100-300 chars): standard response (1024 tokens)
    if text_len < 300:
        return 1024
    
    # Long/complex queries: full response (2048 tokens max)
    return min(2048, text_len * 10)


app = FastAPI(title="Ocean Curiosity", version="5.1")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class Req(BaseModel):
    message: str = None
    query: str = None


class Res(BaseModel):
    response: str
    time: float
    tokens: int = 0


async def ask_ollama(prompt: str) -> tuple:
    """Send query to Ollama with smart token allocation"""
    num_predict = get_smart_tokens(prompt)
    
    async with httpx.AsyncClient(timeout=120.0) as c:
        r = await c.post(f"{OLLAMA}/api/chat", json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            "stream": False,
            "options": {
                "num_ctx": 4096,  # Reduced context for speed
                "num_predict": num_predict,
                "temperature": 0.7
            }
        })
        content = r.json().get("message", {}).get("content", "")
        return content, num_predict


@app.get("/")
async def root():
    return {
        "service": "Ocean Curiosity",
        "version": "5.1",
        "model": MODEL,
        "mode": "smart-elastic"
    }


@app.get("/health")
async def health():
    return {"status": "ok", "version": "5.1"}


@app.post("/api/v1/chat", response_model=Res)
async def chat(req: Req):
    t0 = time.time()
    q = req.message or req.query
    if not q:
        raise HTTPException(400, "message required")

    try:
        resp, tokens = await ask_ollama(q)
    except Exception as e:
        raise HTTPException(500, str(e))

    return Res(
        response=resp,
        time=round(time.time() - t0, 2),
        tokens=tokens
    )


@app.post("/api/v1/query", response_model=Res)
async def query(req: Req):
    return await chat(req)


@app.get("/api/v1/status")
async def status():
    return {
        "status": "ok",
        "model": MODEL,
        "version": "5.1",
        "mode": "smart-elastic",
        "token_tiers": {
            "simple": 256,
            "short": 512,
            "medium": 1024,
            "complex": 2048
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
