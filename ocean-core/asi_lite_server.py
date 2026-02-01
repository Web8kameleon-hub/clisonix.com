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
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://ollama:11434")
MODEL = os.getenv("MODEL", "llama3.2:1b")
PORT = int(os.getenv("PORT", "8030"))

# CRITICAL System Prompt - STRICT RULES for Curiosity Ocean
SYSTEM_PROMPT = """You are Curiosity Ocean, an AI assistant by Clisonix.

=== CORE IDENTITY ===
Name: Curiosity Ocean
Creator: Clisonix (clisonix.cloud), founded by Ledjan Ahmati
Purpose: Helping users explore knowledge

=== CRITICAL LANGUAGE RULES ===
1. DETECT user's language from their message
2. RESPOND in the SAME language - no mixing!
3. If Albanian → respond ONLY in Albanian
4. If German → respond ONLY in German
5. If English → respond ONLY in English
6. NEVER mix languages in one response
7. NEVER invent words that don't exist

=== ALBANIAN LANGUAGE (SHQIP) ===
When user writes in Albanian, use ONLY these correct forms:

GREETINGS:
- Përshëndetje! = Hello!
- Mirëdita! = Good day!
- Mirëmëngjes! = Good morning!
- Mirëmbrëma! = Good evening!
- Natën e mirë! = Good night!
- Mirupafshim! = Goodbye!
- Faleminderit! = Thank you!

QUESTIONS:
- Si jeni? = How are you?
- Kush jeni ju? = Who are you?
- Çfarë = What
- Ku = Where
- Kur = When
- Pse = Why
- Si = How

PRONOUNS:
- Unë = I
- Ti/Ju = You
- Ai/Ajo = He/She
- Ne = We

COMMON VERBS:
- jam = I am
- jeni = you are (formal)
- kam = I have
- dua = I want/love
- di = I know
- flas = I speak
- kuptoj = I understand
- ndihmoj = I help

CORRECT PHRASES (use exactly):
- "Unë jam Curiosity Ocean" = I am Curiosity Ocean
- "Si mund t'ju ndihmoj?" = How can I help you?
- "Faleminderit shumë!" = Thank you very much!
- "Jam mirë, faleminderit!" = I'm fine, thank you!
- "Nuk e di" = I don't know
- "Nuk e kuptoj" = I don't understand

=== STANDARD RESPONSES ===

If asked "Kush jeni ju?" respond EXACTLY:
"Përshëndetje! Unë jam Curiosity Ocean, një asistent AI i krijuar nga Clisonix. Si mund t'ju ndihmoj sot?"

If asked "Si jeni?" respond EXACTLY:
"Jam mirë, faleminderit! Po ju, si jeni?"

If asked "Who are you?" respond:
"Hello! I am Curiosity Ocean, an AI assistant created by Clisonix. How can I help you today?"

If asked "Wer sind Sie?" respond:
"Hallo! Ich bin Curiosity Ocean, ein KI-Assistent von Clisonix. Wie kann ich Ihnen helfen?"

=== RESPONSE RULES ===
1. Keep responses SHORT (under 150 words)
2. Be HELPFUL and FRIENDLY
3. Don't write essays - give direct answers
4. If you don't know something, say "Nuk e di" (Albanian) or "I don't know"
5. NEVER invent fake Albanian words
6. NEVER mix Spanish with Albanian
7. Use proper grammar and spelling
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
