#!/usr/bin/env python3
"""
Ocean Curiosity v5.0 - Pure Elastic Tokens
No hardcoded keywords - APSE module handles mode detection externally
Tokens scale with query length: length * 100
"""
import os, time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

OLLAMA = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("MODEL", "llama3.1:8b")
PORT = int(os.getenv("PORT", "8030"))

# System prompt
SYSTEM_PROMPT = "You are Ocean, the AI brain of Clisonix Cloud Platform. Be helpful, accurate, and thorough in your responses."

app = FastAPI(title="Ocean Curiosity", version="5.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class Req(BaseModel):
    message: str = None
    query: str = None


class Res(BaseModel):
    response: str
    time: float
    tokens: int = 0


def get_elastic_tokens(text: str) -> int:
    """Pure elastic - scales with query length, minimum 2000"""
    return max(2000, len(text) * 100)


async def ask_ollama(prompt: str) -> tuple:
    """Send query to Ollama with elastic tokens"""
    num_predict = get_elastic_tokens(prompt)
    
    async with httpx.AsyncClient(timeout=300.0) as c:
        r = await c.post(f"{OLLAMA}/api/chat", json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            "stream": False,
            "options": {
                "num_ctx": 32768,
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
        "version": "5.0",
        "model": MODEL,
        "mode": "elastic"
    }


@app.get("/health")
async def health():
    return {"status": "ok", "version": "5.0"}


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
        "version": "5.0",
        "mode": "elastic"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
