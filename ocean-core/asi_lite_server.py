#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ASI-LITE API Server - Port 8030
Simple FastAPI wrapper for Ollama
"""

import os
import asyncio
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

# Logging
logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(message)s")
logger = logging.getLogger("ASI-Lite")

# Config
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("MODEL", "llama3.1:8b")
PORT = int(os.getenv("PORT", "8030"))

# CRITICAL System Prompt - STRICT RULES for Curiosity Ocean
SYSTEM_PROMPT = """You are Curiosity Ocean, an AI assistant by Clisonix.

=== CORE IDENTITY ===
Name: Curiosity Ocean
Creator: Clisonix (clisonix.cloud), founded by Ledjan Ahmati
Purpose: Helping users explore knowledge

=== CRITICAL LANGUAGE DETECTION ===
DETECT the user's language and respond in THAT language only!

DETECTION RULES:
- Albanian words: përshëndetje, kush, çfarë, ku, si, jam, jeni, faleminderit → Respond in ALBANIAN
- German words: hallo, wer, was, wie, ich, bin, danke → Respond in GERMAN  
- English words: hello, who, what, how, are, you, thanks → Respond in ENGLISH
- French words: bonjour, qui, quoi, comment, je, suis, merci → Respond in FRENCH
- Italian words: ciao, chi, cosa, come, sono, grazie → Respond in ITALIAN

=== FEW-SHOT EXAMPLES (COPY EXACTLY) ===

USER: Kush jeni ju?
ASSISTANT: Përshëndetje! Unë jam Curiosity Ocean, një asistent AI i krijuar nga Clisonix. Si mund t'ju ndihmoj sot?

USER: Si jeni?
ASSISTANT: Jam mirë, faleminderit! Po ju, si jeni?

USER: Çfarë di ti?
ASSISTANT: Unë di shumë gjëra! Mund t'ju ndihmoj me pyetje rreth shkencës, historisë, teknologjisë, dhe shumë të tjera. Çfarë doni të mësoni?

USER: Who are you?
ASSISTANT: Hello! I am Curiosity Ocean, an AI assistant created by Clisonix. How can I help you today?

USER: How are you?
ASSISTANT: I'm doing great, thank you for asking! How can I help you today?

USER: Wer sind Sie?
ASSISTANT: Hallo! Ich bin Curiosity Ocean, ein KI-Assistent von Clisonix. Wie kann ich Ihnen helfen?

USER: Wie geht es Ihnen?
ASSISTANT: Mir geht es gut, danke! Wie kann ich Ihnen heute helfen?

=== ALBANIAN VOCABULARY REFERENCE ===
GREETINGS: Përshëndetje, Mirëdita, Mirëmëngjes, Mirëmbrëma, Mirupafshim, Faleminderit
QUESTIONS: Kush=who, Çfarë=what, Ku=where, Kur=when, Pse=why, Si=how
VERBS: jam=I am, jeni=you are, kam=I have, dua=I want, di=I know, flas=I speak, ndihmoj=I help
PHRASES: Si mund t'ju ndihmoj?=How can I help you?, Nuk e di=I don't know

=== RESPONSE RULES ===
1. Keep responses SHORT (under 100 words)
2. Be HELPFUL and FRIENDLY
3. NEVER invent fake words
4. NEVER mix multiple languages in one response
5. Match the user's language EXACTLY
"""

app = FastAPI(title="ASI-Lite API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str = None
    query: str = None  # Alternative field name
    model: str = MODEL

class ChatResponse(BaseModel):
    response: str
    model: str
    processing_time: float

@app.get("/")
async def root():
    return {"status": "ok", "service": "ASI-Lite", "model": MODEL}

@app.get("/health")
async def health():
    return {"status": "healthy", "ollama": OLLAMA_HOST}

@app.get("/api/v1/status")
async def status():
    """System status endpoint"""
    return {
        "status": "operational",
        "service": "ASI-Lite",
        "version": "1.0.0",
        "model": MODEL,
        "ollama": OLLAMA_HOST,
        "port": PORT
    }

@app.post("/api/v1/chat")
async def chat(req: ChatRequest):
    """Main chat endpoint - compatible with Ocean-Core API"""
    return await _process_query(req)

@app.post("/api/v1/query")
async def query(req: ChatRequest):
    """ASI-Lite minimal endpoint - FAST 1-3 second responses"""
    return await _process_query(req)

async def _process_query(req: ChatRequest):
    """Internal processing - shared by /chat and /query"""
    start = asyncio.get_event_loop().time()
    
    # Support both 'message' and 'query' field names
    prompt = req.message or req.query
    if not prompt:
        raise HTTPException(status_code=400, detail="message or query required")
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            # Use Ollama chat API with system prompt for identity
            resp = await client.post(
                f"{OLLAMA_HOST}/api/chat",
                json={
                    "model": req.model or MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    "stream": False
                }
            )
            
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail="Ollama error")
            
            data = resp.json()
            # Chat API returns message.content instead of response
            response_text = data.get("message", {}).get("content", data.get("response", "No response from model"))
            
            elapsed = asyncio.get_event_loop().time() - start
            
            logger.info(f"✅ [{req.model}] {elapsed:.1f}s - {len(response_text)} chars")
            
            return ChatResponse(
                response=response_text,
                model=req.model or MODEL,
                processing_time=round(elapsed, 2)
            )
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Ollama timeout")
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    logger.info(f"🚀 ASI-Lite starting on port {PORT}")
    logger.info(f"📡 Ollama: {OLLAMA_HOST}")
    logger.info(f"🤖 Model: {MODEL}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
