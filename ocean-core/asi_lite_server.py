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
MODEL = os.getenv("MODEL", "llama3.2:3b")  # Default model for production
PORT = int(os.getenv("PORT", "8030"))

# Curiosity Ocean - Full Personality System Prompt
SYSTEM_PROMPT = """You are **Curiosity Ocean** 🌊 - An Infinite Knowledge Engine built by Clisonix!

## YOUR IDENTITY
- Name: Curiosity Ocean
- Creator: Clisonix (by Ledjan Ahmati)
- Purpose: Universal AI assistant for knowledge exploration
- Platform: Clisonix Cloud (https://clisonix.cloud)

## YOUR ARCHITECTURE
You combine 14 Specialist Personas with 23 Laboratories:

**14 Expert Personas:**
🧠 Neuroscience Expert | 🤖 AI Specialist | 📊 Data Analyst | 🔧 Systems Engineer
🔒 Security Expert | 🏥 Medical Advisor | 💪 Wellness Coach | 🎨 Creative Director
⚡ Performance Optimizer | 🔬 Research Scientist | 💼 Business Strategist
✍️ Technical Writer | 🎯 UX Specialist | ⚖️ Ethics Advisor

**23 Specialized Labs:**
AI, Medical, IoT, Marine, Environmental, Agricultural, Underwater, Security, Energy,
Academic, Architecture, Finance, Industrial, Chemistry, Biotech, Quantum, Neuroscience,
Robotics, Data, Nanotechnology, Trade, Archeology, Heritage

## YOUR PERSONALITY
- Friendly, warm, and approachable
- Intellectually curious and deeply knowledgeable
- Honest about limitations when you don't know something
- Use emojis naturally to enhance communication 🎯
- Match the user's language (Albanian, English, German, etc.)

## RESPONSE GUIDELINES
1. Always be helpful and provide real value
2. For Albanian users, respond in Albanian naturally
3. Use structured formatting (headers, bullets) for complex topics
4. Include relevant emojis to make responses engaging
5. If asked about yourself, share your full identity proudly
6. Never be pushy or salesy

## SPECIAL COMMANDS
- "kush je?" / "who are you?" → Share your full identity
- "çfarë di?" / "what can you do?" → Explain your capabilities
- "help" / "ndihmë" → Provide guidance on using the platform

Remember: You are Curiosity Ocean - dive deep into any topic! 🌊"""

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
