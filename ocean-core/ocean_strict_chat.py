#!/usr/bin/env python3
"""
OCEAN STRICT CHAT
=================
Skedar i veçantë për admin chat me strict mode.
Detyron ndjekjen e rregullave pa devijim.

Port: 8035
"""

import logging
import os
import time
from typing import Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ═══════════════════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════════════════
logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(name)s - %(message)s")
logger = logging.getLogger("OceanStrictChat")

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("MODEL", "llama3.1:8b")
PORT = int(os.getenv("PORT", "8035"))

# ═══════════════════════════════════════════════════════════════════
# STRICT SYSTEM PROMPT - KY ËSHTË THELBI
# ═══════════════════════════════════════════════════════════════════
STRICT_SYSTEM_PROMPT = """Ti je Curiosity Ocean 🌊 - Truri Administrativ i Clisonix Cloud.
Krijuar nga Ledjan Ahmati (WEB8euroweb GmbH, Gjermani).

## MODALITETI STRIKT - RREGULLA ABSOLUTE

Ti DUHET të ndjekësh këto rregulla PA PËRJASHTIM:

### 1. FILLO MENJËHERË
- Fillo të shkruash brenda 2-3 sekondave
- Mos bëj pauza mendimi
- Mos prit, mos planifiko - shkruaj direkt

### 2. QËNDRO NË TEMË
- Përgjigju VETËM asaj që u pyet
- Mos shto informacion që nuk u kërkua
- Mos devijo në tema të tjera

### 3. MOS PYET
- Mos i bëj pyetje përdoruesit
- Nëse diçka nuk është e qartë, jep përgjigjen më të mirë të mundshme
- Mos kërko sqarime - vepro

### 4. MOS HALUCINO
- Nëse nuk e di përgjigjen, thuaj "Nuk e di"
- Mos shpik fakte
- Mos jep informacion të pasaktë

### 5. NDIQ UDHËZIMET E LISTËS
- Nëse të jepen hapa, ekzekutoji TË GJITHË
- Ekzekutoji në rendin e dhënë
- Mos kapërce asnjë hap

### 6. VETË-ANALIZË E SINQERTË
- Nëse të kërkohet të analizosh përgjigjen tënde, bëje
- Identifiko gabimet reale, jo teorike
- Jep korrigjime konkrete

### 7. OUTPUT I VAZHDUESHËM
- Shkruaj pa u ndalur derisa detyra të përfundojë
- Mos e përfundo përgjigjen herët
- Jep analizë të plotë kur kërkohet

### 8. STRUKTURA E QARTË
- Përdor tituj dhe nën-tituj kur ka sens
- Përdor lista kur ke shumë pika
- Mbaj formatimin e pastër

## DËNIMET
Shkelja e këtyre rregullave do të konsiderohet dështim.
Ti je një asistent administrativ profesional - sillju si i tillë.

Tani fillo të përgjigjesh:"""


# ═══════════════════════════════════════════════════════════════════
# SESSION MEMORY
# ═══════════════════════════════════════════════════════════════════
sessions: Dict[str, List[Dict[str, str]]] = {}
MAX_HISTORY = 20


def get_session_history(session_id: str) -> List[Dict[str, str]]:
    """Merr historinë e sesionit"""
    if session_id not in sessions:
        sessions[session_id] = []
    return sessions[session_id]


def add_to_history(session_id: str, role: str, content: str):
    """Shto mesazh në histori"""
    history = get_session_history(session_id)
    history.append({"role": role, "content": content})
    
    # Limit history
    if len(history) > MAX_HISTORY:
        sessions[session_id] = history[-MAX_HISTORY:]


def clear_session(session_id: str):
    """Pastro sesionin"""
    if session_id in sessions:
        del sessions[session_id]


# ═══════════════════════════════════════════════════════════════════
# FASTAPI APP
# ═══════════════════════════════════════════════════════════════════
app = FastAPI(
    title="Ocean Strict Chat",
    description="Admin chat me strict mode - ndjek rregullat pa devijim",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════
# MODELS
# ═══════════════════════════════════════════════════════════════════
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    temperature: float = 0.3  # Më i ulët = më deterministik


class ChatResponse(BaseModel):
    response: str
    session_id: str
    processing_time: float
    mode: str = "strict"
    history_length: int


# ═══════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "mode": "strict",
        "model": MODEL,
        "active_sessions": len(sessions)
    }


@app.post("/api/v1/chat", response_model=ChatResponse)
async def strict_chat(req: ChatRequest):
    """Strict mode chat - ndjek rregullat pa devijim"""
    start = time.time()
    
    # Session ID
    session_id = req.session_id or f"strict_{int(time.time())}"
    
    # Build messages
    history = get_session_history(session_id)
    messages = [
        {"role": "system", "content": STRICT_SYSTEM_PROMPT}
    ]
    
    # Add history (last 10 exchanges)
    for msg in history[-10:]:
        messages.append(msg)
    
    # Add current message
    messages.append({"role": "user", "content": req.message})
    
    # Call Ollama with strict options
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            resp = await client.post(
                f"{OLLAMA_HOST}/api/chat",
                json={
                    "model": MODEL,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": req.temperature,  # Low = deterministic
                        "num_ctx": 8192,
                        "num_predict": -1,  # Unlimited
                        "repeat_penalty": 1.3,  # Penalize repetition
                        "top_p": 0.8,
                        "num_keep": 0,
                        "mirostat": 0,
                        "repeat_last_n": 64,
                        "stop": []  # No early stopping
                    }
                }
            )
            
            if resp.status_code != 200:
                logger.error(f"Ollama error: {resp.status_code}")
                raise HTTPException(resp.status_code, "Ollama error")
            
            response_text = resp.json().get("message", {}).get("content", "")
    
    except httpx.TimeoutException:
        raise HTTPException(504, "Timeout - modeli po mendon shumë gjatë")
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(500, str(e))
    
    # Record in history
    add_to_history(session_id, "user", req.message)
    add_to_history(session_id, "assistant", response_text)
    
    elapsed = time.time() - start
    logger.info(f"[{session_id}] {elapsed:.1f}s - {len(response_text)} chars")
    
    return ChatResponse(
        response=response_text,
        session_id=session_id,
        processing_time=round(elapsed, 2),
        mode="strict",
        history_length=len(get_session_history(session_id))
    )


@app.post("/api/v1/analyze")
async def self_analyze(req: ChatRequest):
    """Detyro modelin të analizojë përgjigjen e mëparshme"""
    session_id = req.session_id or f"analyze_{int(time.time())}"
    history = get_session_history(session_id)
    
    if not history:
        return {"error": "Nuk ka histori për të analizuar"}
    
    # Find last assistant message
    last_response = None
    for msg in reversed(history):
        if msg["role"] == "assistant":
            last_response = msg["content"]
            break
    
    if not last_response:
        return {"error": "Nuk u gjet përgjigje e mëparshme"}
    
    # Build analysis prompt
    analysis_prompt = f"""Analizo përgjigjen tënde të mëparshme dhe identifiko:

PËRGJIGJA JOTE E MËPARSHME:
{last_response}

PYETJA E PËRDORUESIT:
{req.message}

Tani bëj:
1. Identifiko gabimet e përkthimit (nëse ka)
2. Identifiko mospërputhjet logjike
3. Identifiko përmbajtjen e palidhur me temën
4. Identifiko halucinacionet (informacion i shpikur)
5. Shpjego çdo gabim qartë
6. Rishkruaj përgjigjen e korrigjuar

FILLO:"""
    
    # Modify request and call strict chat
    req.message = analysis_prompt
    return await strict_chat(req)


@app.delete("/api/v1/session/{session_id}")
async def delete_session(session_id: str):
    """Pastro një sesion"""
    if session_id in sessions:
        del sessions[session_id]
        return {"status": "cleared", "session_id": session_id}
    return {"status": "not_found", "session_id": session_id}


@app.get("/api/v1/sessions")
async def list_sessions():
    """Lista e sesioneve aktive"""
    return {
        "active_sessions": len(sessions),
        "sessions": [
            {
                "id": sid,
                "message_count": len(msgs)
            }
            for sid, msgs in sessions.items()
        ]
    }


# ═══════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    logger.info(f"🌊 Ocean Strict Chat starting on port {PORT}")
    logger.info(f"   Model: {MODEL}")
    logger.info("   Mode: STRICT")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
