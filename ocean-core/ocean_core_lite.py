#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OCEAN CORE LITE - Fast & Clean
==============================
Vetëm ato që funksionojnë 100%:
1. Translation Node - 72 gjuhë
2. Service Router - 31 module  
3. Ollama - llama3.1:8b

Pa: MegaLayerEngine, KnowledgeSeeds, RealAnswerEngine
Port: 8030
"""

import os
import logging
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import httpx

# ═══════════════════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════════════════
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("MODEL", "llama3.1:8b")
PORT = int(os.getenv("PORT", "8030"))
TRANSLATION_NODE = os.getenv("TRANSLATION_NODE", "http://localhost:8036")

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(message)s")
logger = logging.getLogger("OceanLite")

# ═══════════════════════════════════════════════════════════════════
# KNOWLEDGE LAYER - Minimal (inline, no import)
# ═══════════════════════════════════════════════════════════════════
SERVICES = {
    "curiosity-ocean": "/modules/curiosity-ocean",
    "eeg-analysis": "/modules/eeg-analysis",
    "neural-biofeedback": "/modules/neural-biofeedback",
    "document-tools": "/modules/document-tools",
    "fitness-dashboard": "/modules/fitness-dashboard",
    "weather-dashboard": "/modules/weather-dashboard",
    "aviation-weather": "/modules/aviation-weather",
    "crypto-dashboard": "/modules/crypto-dashboard",
    "ocean-analytics": "/modules/ocean-analytics",
    "iot-network": "/modules/my-data-dashboard",
}

INTENTS = {
    "eeg": "eeg-analysis", "brain": "eeg-analysis", "neural": "neural-biofeedback",
    "document": "document-tools", "excel": "document-tools", "pdf": "document-tools",
    "fitness": "fitness-dashboard", "workout": "fitness-dashboard",
    "weather": "weather-dashboard", "metar": "aviation-weather", "aviation": "aviation-weather",
    "crypto": "crypto-dashboard", "bitcoin": "crypto-dashboard",
    "analytics": "ocean-analytics", "iot": "iot-network", "sensor": "iot-network",
}

def route_intent(text: str) -> Optional[str]:
    text_lower = text.lower()
    for kw, svc in INTENTS.items():
        if kw in text_lower:
            return svc
    return None

# ═══════════════════════════════════════════════════════════════════
# SYSTEM PROMPT - Minimal
# ═══════════════════════════════════════════════════════════════════
SYSTEM_PROMPT = """You are Curiosity Ocean 🌊 - AI assistant of Clisonix Cloud (https://clisonix.cloud).
Created by Ledjan Ahmati, WEB8euroweb GmbH Germany.

RULES:
1. Respond in user's language
2. Be concise and helpful
3. Use emojis sparingly 😊

If asked about platform services, mention: EEG Analysis, Neural Biofeedback, Document Tools, Fitness Dashboard, Weather, Crypto, Analytics, IoT Network."""

# ═══════════════════════════════════════════════════════════════════
# FASTAPI
# ═══════════════════════════════════════════════════════════════════
app = FastAPI(title="Ocean Core Lite", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class ChatRequest(BaseModel):
    message: str = None
    query: str = None
    model: str = None

class ChatResponse(BaseModel):
    response: str
    model: str
    processing_time: float
    language_detected: str = "en"
    routed_service: Optional[str] = None

# ═══════════════════════════════════════════════════════════════════
# LANGUAGE DETECTION - Fast (1s timeout)
# ═══════════════════════════════════════════════════════════════════
async def detect_language(text: str) -> tuple:
    try:
        async with httpx.AsyncClient(timeout=1.0) as client:
            resp = await client.post(f"{TRANSLATION_NODE}/api/v1/detect", json={"text": text})
            if resp.status_code == 200:
                data = resp.json()
                return data.get("detected_language", "en"), data.get("language_name", "English")
    except:
        pass
    return "en", "English"

# ═══════════════════════════════════════════════════════════════════
# MAIN CHAT - Direct Ollama call
# ═══════════════════════════════════════════════════════════════════
async def process_chat(req: ChatRequest) -> ChatResponse:
    start = time.time()
    prompt = req.message or req.query
    if not prompt:
        raise HTTPException(400, "message required")
    
    # 1. Detect language (fast)
    lang_code, lang_name = await detect_language(prompt)
    
    # 2. Route service (instant)
    routed = route_intent(prompt)
    
    # 3. Build prompt
    lang_hint = f"\nRespond in {lang_name}." if lang_code != "en" else ""
    service_hint = f"\nUser is asking about {routed}. URL: {SERVICES.get(routed, '')}" if routed else ""
    
    system = SYSTEM_PROMPT + lang_hint + service_hint
    
    # 4. Call Ollama (main latency)
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                f"{OLLAMA_HOST}/api/chat",
                json={
                    "model": req.model or MODEL,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt}
                    ],
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_ctx": 1024,      # Small context = fast
                        "num_predict": 256,   # Short response = fast
                        "repeat_penalty": 1.1
                    }
                }
            )
            if resp.status_code != 200:
                raise HTTPException(resp.status_code, "Ollama error")
            
            response_text = resp.json().get("message", {}).get("content", "")
    except httpx.TimeoutException:
        raise HTTPException(504, "Timeout")
    except Exception as e:
        raise HTTPException(500, str(e))
    
    elapsed = time.time() - start
    logger.info(f"[{lang_code}] {elapsed:.1f}s")
    
    return ChatResponse(
        response=response_text,
        model=req.model or MODEL,
        processing_time=round(elapsed, 2),
        language_detected=lang_code,
        routed_service=routed
    )

# ═══════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════
@app.get("/")
async def root():
    return {"service": "Ocean Core Lite", "version": "1.0.0", "model": MODEL}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/v1/status")
async def status():
    return {"status": "operational", "model": MODEL, "services": len(SERVICES)}

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    return await process_chat(req)

@app.post("/api/v1/query", response_model=ChatResponse)
async def query(req: ChatRequest):
    return await process_chat(req)

@app.get("/api/v1/services")
async def list_services():
    return {"services": SERVICES}

if __name__ == "__main__":
    import uvicorn
    logger.info(f"🌊 Ocean Core Lite on port {PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
