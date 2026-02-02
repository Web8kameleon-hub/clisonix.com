#!/usr/bin/env python3
"""
Ocean  couriosity v4.1 - Full APSE + MegaLayerEngine (NO TRUNCATION)
5 Modes: FAST, BALANCED, DEEP, CREATIVE, TECHNICAL
Features: Adaptive scaling, Multi-layer prompts, Dynamic config
Max tokens: 8192 | Layers: 3-11 based on complexity
Fix: Increased token limits to prevent response cutoff
"""
import os, time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

OLLAMA = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("MODEL", "llama3.1:8b")
PORT = int(os.getenv("PORT", "8030"))

# ═══════════════════════════════════════════════════════════════
# ADAPTIVE PREDICT SCALER (APSE) - 5 Mode Detection
# ═══════════════════════════════════════════════════════════════

FAST_KEYWORDS = {
    "short", "quick", "fast", "simple", "briefly", "summarize", "tldr",
    "hi", "hello", "hey", "ok", "thanks", "yes", "no",
    "shkurt", "shpejt", "pershendetje", "faleminderit"
}

DEEP_KEYWORDS = {
    "analyze", "detailed", "complex", "research", "scientific", "breakdown",
    "explain", "analysis", "architecture", "strategy", "compare", "evaluate",
    "expert", "comprehensive", "thorough", "in-depth", "how", "why"
}

CREATIVE_KEYWORDS = {
    "story", "creative", "poem", "lyrics", "imagine", "roleplay", "scenario",
    "brainstorm", "fiction", "create", "invent", "dream",
    "histori", "poezi", "imagjino", "krijo"
}

TECHNICAL_KEYWORDS = {
    "code", "debug", "optimize", "system", "api", "docker", "kubernetes",
    "server", "database", "algorithm", "function", "class", "error", "bug",
    "deploy", "config", "setup", "latency",
    "kod", "optimizo", "gabim", "konfiguro"
}


def detect_mode(text: str) -> str:
    """APSE: Detect query complexity and return mode"""
    t = text.lower()
    words = set(t.split())
    length = len(t)
    
    # DEEP: Complex analytical queries (check FIRST - "what is X" are deep questions)
    if words & DEEP_KEYWORDS or length > 300:
        return "DEEP"
    
    # TECHNICAL: Code, debugging, system design
    if words & TECHNICAL_KEYWORDS:
        return "TECHNICAL"
    
    # CREATIVE: Storytelling, brainstorming
    if words & CREATIVE_KEYWORDS:
        return "CREATIVE"
    
    # FAST: Only simple greetings and very short queries
    if words & FAST_KEYWORDS and length < 50:
        return "FAST"
    
    # BALANCED: Default for medium queries
    return "BALANCED"


def get_config(text: str) -> dict:
    """APSE: Get optimal config based on query mode"""
    mode = detect_mode(text)
    length = len(text)
    
    # ELASTIC TOKENS - scales with query length, no fixed limits
    configs = {
        "FAST": {
            "mode": "FAST",
            "layers": 3,
            "num_predict": max(1000, length * 50),
            "num_ctx": 8192,
            "temperature": 0.3
        },
        "BALANCED": {
            "mode": "BALANCED",
            "layers": 6,
            "num_predict": max(2000, length * 80),
            "num_ctx": 16384,
            "temperature": 0.5
        },
        "DEEP": {
            "mode": "DEEP",
            "layers": 11,
            "num_predict": max(4000, length * 150),
            "num_ctx": 32768,
            "temperature": 0.2,
            "rerank": True,
            "cognitive_signature": True
        },
        "CREATIVE": {
            "mode": "CREATIVE",
            "layers": 7,
            "num_predict": max(10000, length * 100),
            "num_ctx": 32768,
            "temperature": 0.9,
            "emotion_layer": True,
            "realism_layer": True
        },
        "TECHNICAL": {
            "mode": "TECHNICAL",
            "layers": 8,
            "num_predict": max(20000, length * 120),
            "num_ctx": 65536,
            "temperature": 0.2,
            "technical_boundaries": True,
            "focus_layer": True
        }
    }
    
    return configs.get(mode, configs["BALANCED"])


# ═══════════════════════════════════════════════════════════════
# MEGA LAYER ENGINE - Dynamic Prompt Building
# ═══════════════════════════════════════════════════════════════

class MegaLayerEngine:
    """Builds layered prompts based on mode and config"""
    
    LAYERS = {
        # Core layers (always used)
        "identity": "You are Ocean, the AI brain of Clisonix Cloud Platform.",
        "helpful": "Be helpful, accurate, and responsive to the user's needs.",
        "concise": "Keep responses focused and avoid unnecessary verbosity.",
        
        # Mode-specific layers
        "emotion_layer": "Infuse emotional depth and human-like warmth in your response.",
        "realism_layer": "Make the content vivid, believable, and immersive.",
        "focus_layer": "Stay strictly on topic. Avoid tangents or unrelated information.",
        "technical_boundaries": "Use precise technical terminology. Include code examples when relevant.",
        "cognitive_signature": "Apply deep analytical thinking. Consider multiple perspectives.",
        "creative_flow": "Let creativity guide the narrative. Be imaginative and original.",
        
        # Advanced layers
        "rerank": "Prioritize the most relevant and accurate information first.",
        "persona_router": "Adapt your communication style to match the query context.",
        "chain_of_thought": "Break down complex problems step by step.",
    }
    
    def build(self, text: str, config: dict) -> str:
        """Build layered system prompt based on config"""
        layers_count = config.get("layers", 6)
        mode = config.get("mode", "BALANCED")
        
        # Start with core layers
        prompt_parts = [
            self.LAYERS["identity"],
            self.LAYERS["helpful"],
        ]
        
        # Add mode-specific layers
        if mode == "FAST":
            prompt_parts.append(self.LAYERS["concise"])
            prompt_parts.append("Respond briefly and directly.")
            
        elif mode == "BALANCED":
            prompt_parts.append(self.LAYERS["concise"])
            prompt_parts.append(self.LAYERS["focus_layer"])
            
        elif mode == "DEEP":
            prompt_parts.append(self.LAYERS["cognitive_signature"])
            prompt_parts.append(self.LAYERS["chain_of_thought"])
            prompt_parts.append(self.LAYERS["rerank"])
            prompt_parts.append("Provide comprehensive, well-structured analysis.")
            if config.get("cognitive_signature"):
                prompt_parts.append("Apply expert-level reasoning and insight.")
                
        elif mode == "CREATIVE":
            prompt_parts.append(self.LAYERS["emotion_layer"])
            prompt_parts.append(self.LAYERS["realism_layer"])
            prompt_parts.append(self.LAYERS["creative_flow"])
            prompt_parts.append("Be imaginative, expressive, and engaging.")
            
        elif mode == "TECHNICAL":
            prompt_parts.append(self.LAYERS["technical_boundaries"])
            prompt_parts.append(self.LAYERS["focus_layer"])
            prompt_parts.append(self.LAYERS["chain_of_thought"])
            prompt_parts.append("Provide accurate technical solutions with examples.")
        
        # Build final prompt
        system_prompt = " ".join(prompt_parts[:layers_count])
        return system_prompt


# Initialize layer engine
layer_engine = MegaLayerEngine()


# ═══════════════════════════════════════════════════════════════
# FASTAPI SERVER
# ═══════════════════════════════════════════════════════════════

app = FastAPI(title="Ocean Chameleon APSE", version="4.1-NoTruncation")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class Req(BaseModel):
    message: str = None
    query: str = None


class Res(BaseModel):
    response: str
    time: float
    mode: str
    tokens: int = 0
    layers: int = 0


async def ask_ollama(prompt: str) -> tuple:
    """Send query to Ollama with APSE + MegaLayerEngine"""
    config = get_config(prompt)
    system_prompt = layer_engine.build(prompt, config)
    
    async with httpx.AsyncClient(timeout=180.0) as c:
        r = await c.post(f"{OLLAMA}/api/chat", json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "stream": False,
            "options": {
                "num_ctx": config["num_ctx"],
                "num_predict": config["num_predict"],
                "temperature": config["temperature"]
            }
        })
        content = r.json().get("message", {}).get("content", "")
        return content, config["mode"], config["num_predict"], config["layers"]


@app.get("/")
async def root():
    return {
        "service": "Ocean Chameleon APSE",
        "version": "4.0",
        "model": MODEL,
        "features": ["AdaptivePredictScaler", "MegaLayerEngine"],
        "modes": ["FAST", "BALANCED", "DEEP", "CREATIVE", "TECHNICAL"],
        "max_tokens": 2048,
        "max_layers": 11
    }


@app.get("/health")
async def health():
    return {"status": "ok", "version": "4.1", "fix": "no-truncation"}


@app.post("/api/v1/chat", response_model=Res)
async def chat(req: Req):
    t0 = time.time()
    q = req.message or req.query
    if not q:
        raise HTTPException(400, "message required")
    
    try:
        resp, mode, tokens, layers = await ask_ollama(q)
    except Exception as e:
        raise HTTPException(500, str(e))
    
    return Res(
        response=resp,
        time=round(time.time() - t0, 2),
        mode=mode,
        tokens=tokens,
        layers=layers
    )


@app.post("/api/v1/query", response_model=Res)
async def query(req: Req):
    return await chat(req)


@app.get("/api/v1/status")
async def status():
    return {
        "status": "ok",
        "model": MODEL,
        "version": "4.1-APSE-NoTruncation",
        "features": ["AdaptivePredictScaler", "MegaLayerEngine", "ExtendedTokenLimits"],
        "modes": ["FAST", "BALANCED", "DEEP", "CREATIVE", "TECHNICAL"],
        "min_tokens": {"FAST": 2048, "BALANCED": 4096, "DEEP": 8192, "CREATIVE": 12000, "TECHNICAL": 16000}
    }


@app.get("/api/v1/modes")
async def modes():
    """Show all modes and their configs (v4.1 - NO TRUNCATION)"""
    return {
        "FAST": {"tokens": "2048+", "ctx": 8192, "layers": 3, "temp": 0.3, "use": "Simple queries, greetings"},
        "BALANCED": {"tokens": "4096+", "ctx": 16384, "layers": 6, "temp": 0.5, "use": "General questions"},
        "DEEP": {"tokens": "8192+", "ctx": 32768, "layers": 11, "temp": 0.2, "use": "Analysis, research, comparison"},
        "CREATIVE": {"tokens": "12000+", "ctx": 32768, "layers": 7, "temp": 0.9, "use": "Stories, poems, brainstorming"},
        "TECHNICAL": {"tokens": "16000+", "ctx": 65536, "layers": 8, "temp": 0.2, "use": "Code, debugging, system design"}
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
