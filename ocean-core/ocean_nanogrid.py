#!/usr/bin/env python3
"""
Ocean Nanogrid - Sleep/Wake Pattern
====================================
- Persistent connection pool (no reconnect overhead)
- Keep-alive to Ollama
- Minimal footprint when idle
- Instant wake on request
- Rate limiting: 20 msg/hour for free tier (6 months trial)
"""
import asyncio
import json
import os
import time
from collections import defaultdict
from datetime import datetime, timedelta
from typing import AsyncGenerator

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

OLLAMA = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("MODEL", "llama3.1:8b")
PORT = int(os.getenv("PORT", "8030"))

# ═══════════════════════════════════════════════════════════════════
# TRANSLATION OVERRIDE + LEXICON CUSTOM
# Korrigjon përkthimet e gabuara PARA reasoning-it
# ═══════════════════════════════════════════════════════════════════

LEXICON_CUSTOM = {
    # Fjalë problematike → Përkthime të sakta
    "vend": "website",
    "vendi": "website", 
    "vendi juaj": "your website",
    "vendin tuaj": "your website",
    "site": "website",
    "faqe": "page",
    "faqja": "page",
    "faqen": "page",
    "vizitorë": "visitors",
    "vizitore": "visitors",
    "trafik": "traffic",
    "trafikun": "traffic",
    "platformë": "platform",
    "platforma": "platform",
    "modul": "module",
    "modulet": "modules",
    "shërbim": "service",
    "sherbim": "service",
    "shërbim cloud": "cloud service",
    "rrjet": "network",
    "rrjeti": "network",
    "lidhje": "connection",
    "lidhja": "connection",
    "përdorues": "user",
    "perdorues": "user",
    "përdoruesit": "users",
    "llogari": "account",
    "llogaria": "account",
    "çelës": "key",
    "celes": "key",
    "fjalëkalim": "password",
    "fjalekalim": "password",
    "aksesim": "access",
    "akses": "access",
    "kod": "code",
    "kodi": "code",
    "gabim": "error",
    "gabimi": "error",
    "problem": "issue",
    "problemi": "issue",
    "ngarkesë": "load",
    "ngarko": "upload",
    "shkarko": "download",
    "ruaj": "save",
    "fshi": "delete",
    "ndrysho": "edit",
    "krijo": "create",
    "konfigurim": "configuration",
    "konfigurimet": "settings",
    "paneli": "dashboard",
    "panel kontrolli": "control panel",
    # Clisonix-specifike
    "Clisonix": "Clisonix Cloud platform",
    "oqeani": "Ocean AI",
    "ocean": "Ocean AI",
}

# Fjalë që NUK duhet të përdoren
AVOID_WORDS = ["vendbanim", "shpirt historik", "pasionshëm", "romantik", "mistik"]

# Fjalë të preferuara
PREFER_WORDS = ["platformë", "website", "trafik", "modul", "shërbim", "users", "traffic"]

def apply_translation_override(text: str) -> str:
    """
    Apliko korrigjime të përkthimeve PARA se të shkojë te modeli.
    Zëvendëson fjalët problematike me versionet e sakta.
    """
    if not text:
        return text
    
    result = text.lower()
    
    # Zëvendëso sipas lexicon-it (frazat më të gjata së pari)
    sorted_lexicon = sorted(LEXICON_CUSTOM.items(), key=lambda x: len(x[0]), reverse=True)
    
    for albanian, english in sorted_lexicon:
        if albanian.lower() in result:
            # Ruaj kontekstin shqip por shto përkthimin
            # Kjo ndihmon modelin të kuptojë
            pass  # Mos zëvendëso, por shto context
    
    return text  # Ruaj origjinalin, por shto context në system prompt

def get_lexicon_context() -> str:
    """
    Kthen context për modelin me përkthimet e sakta.
    """
    context = """
## 🔤 TRANSLATION LEXICON (Albanian → English)
When user speaks Albanian, understand these correctly:
"""
    for alb, eng in list(LEXICON_CUSTOM.items())[:20]:
        context += f"- \"{alb}\" = \"{eng}\"\n"
    
    context += """
⚠️ NEVER use these words in response: vendbanim, shpirt historik, pasionshëm
✅ PREFER these technical terms: website, platform, traffic, module, service, users
"""
    return context

# ═══════════════════════════════════════════════════════════════════
# REAL-TIME CONTEXT - Date, Time, News, Weather
# ═══════════════════════════════════════════════════════════════════

def get_realtime_context() -> str:
    """Get current date, time, and day of week"""
    now = datetime.now()
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    months = ["January", "February", "March", "April", "May", "June", 
              "July", "August", "September", "October", "November", "December"]
    
    return f"""
## CURRENT DATE & TIME
- Date: {weekdays[now.weekday()]}, {months[now.month-1]} {now.day}, {now.year}
- Time: {now.strftime('%H:%M:%S')} (Server Time - CET/Berlin)
- Unix Timestamp: {int(now.timestamp())}

## LIVE DATA ACCESS (Use when relevant)
🌐 **Web & Knowledge:**
- Wikipedia API (general encyclopedia)
- Arxiv API (scientific papers)
- PubMed API (medical research)
- GitHub API (open source code)
- DBpedia (structured data)

📊 **Statistics & Finance:**
- Eurostat (EU statistics)
- European Central Bank (exchange rates)
- CoinGecko (crypto prices)
- World Bank Open Data

🌍 **Regional Data:**
- INSTAT Albania (Albanian statistics)
- Bank of Albania (Albanian finance)
- EU Open Data Portal
- US Census, NOAA Weather

🌤️ **Real-Time:**
- Weather (wttr.in - global)
- Air Quality (OpenAQ)
- Earthquake data (USGS)

## CLISONIX AGENTS (Internal Services)
- ALBA: Audio/EEG Analysis (port 5555)
- ALBI: Neural Biofeedback (port 6680)
- ASI: Advanced System Intelligence
- JONA: Industrial IoT Gateway
- Translation Node: 72 languages (port 8036)
"""


async def fetch_wikipedia(query: str) -> str:
    """Quick Wikipedia search"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            params = {"action": "query", "list": "search", "srsearch": query, 
                      "srlimit": 3, "format": "json"}
            r = await client.get("https://en.wikipedia.org/w/api.php", params=params)
            if r.status_code == 200:
                results = r.json().get("query", {}).get("search", [])
                if results:
                    return "\n".join([f"- {item['title']}: {item['snippet'][:150]}..." 
                                     for item in results[:3]])
    except:
        pass
    return ""


async def fetch_weather(city: str = "Tirana") -> str:
    """Get weather from wttr.in (free, no API key)"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"https://wttr.in/{city}?format=j1")
            if r.status_code == 200:
                data = r.json()
                current = data.get("current_condition", [{}])[0]
                return f"Weather in {city}: {current.get('temp_C')}°C, {current.get('weatherDesc', [{}])[0].get('value', 'Unknown')}"
    except:
        pass
    return ""


def build_system_prompt(extra_context: str = "") -> str:
    """Build system prompt with real-time context and lexicon"""
    realtime = get_realtime_context()
    lexicon = get_lexicon_context()
    return f"""You are **Ocean** 🌊, the AI brain of Clisonix Cloud.

{realtime}

{lexicon}

## RESPONSE RULES
1. START WRITING IMMEDIATELY - no thinking pause
2. Respond in the user's language (Albanian or English)
3. Be helpful and thorough
4. Use real-time data when relevant (date, weather, etc.)
5. Never say "I don't have access to current date/time" - YOU DO!
6. Understand Albanian correctly using the lexicon above

{extra_context}

Remember: You know the current date and time! Use it when relevant."""

# Rate limiting config
FREE_TIER_LIMIT = 1000  # messages per hour (increased from 20 for better development experience)
FREE_TRIAL_MONTHS = 6
rate_limits: dict = defaultdict(list)  # user_id -> [timestamps]

def check_rate_limit(user_id: str, is_admin: bool = False) -> tuple[bool, int]:
    """Check if user is within rate limit. Returns (allowed, remaining)
    
    Args:
        user_id: User identifier (email, ID, or IP)
        is_admin: Admin users bypass all rate limits
    """
    # Admin users have no limit
    if is_admin:
        return True, float('inf')
    
    now = datetime.now()
    hour_ago = now - timedelta(hours=1)
    
    # Clean old entries
    rate_limits[user_id] = [ts for ts in rate_limits[user_id] if ts > hour_ago]
    
    count = len(rate_limits[user_id])
    if count >= FREE_TIER_LIMIT:
        return False, 0
    
    rate_limits[user_id].append(now)
    return True, FREE_TIER_LIMIT - count - 1

# Persistent client (connection pool)
_client: httpx.AsyncClient = None

async def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=300.0,  # 5 minutes for elastic responses
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
            http2=True  # HTTP/2 for multiplexing
        )
    return _client

# FastAPI
app = FastAPI(title="Ocean Nanogrid", version="2.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Req(BaseModel):
    message: str = None
    query: str = None

class Res(BaseModel):
    response: str
    time: float

@app.on_event("startup")
async def startup():
    """Warm up connection pool"""
    client = await get_client()
    try:
        await client.get(f"{OLLAMA}/api/version")
        print(f"🟢 Nanogrid ready - Ollama connected")
    except:
        print(f"🟡 Nanogrid ready - Ollama will connect on first request")

@app.on_event("shutdown")
async def shutdown():
    global _client
    if _client:
        await _client.aclose()

@app.get("/")
async def root():
    return {"service": "Ocean Nanogrid", "model": MODEL, "status": "awake"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/v1/chat", response_model=Res)
async def chat(req: Req, request: Request):
    t0 = time.time()
    q = req.message or req.query
    if not q:
        raise HTTPException(400, "message required")
    
    # Get user identifier (IP for now, will be Clerk user_id later)
    user_id = request.headers.get("X-User-ID") or request.client.host or "anonymous"
    
    # Check if admin (via header or user ID)
    is_admin = request.headers.get("X-Admin") == "true" or user_id in ["admin", "adm"]
    
    # Check rate limit
    allowed, remaining = check_rate_limit(user_id, is_admin=is_admin)
    if not allowed:
        raise HTTPException(429, detail={
            "error": "Rate limit exceeded",
            "limit": FREE_TIER_LIMIT,
            "period": "1 hour",
            "upgrade_url": "https://clisonix.com/pricing"
        })
    
    client = await get_client()
    
    try:
        # Build prompt with real-time context
        system_prompt = build_system_prompt()
        
        r = await client.post(f"{OLLAMA}/api/chat", json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": q}
            ],
            "stream": False,
            "options": {
                "num_ctx": 8192,
                "num_predict": -1,
                "temperature": 0.7,
                "num_keep": 0,
                "mirostat": 0,
                "repeat_last_n": 64,
                "stop": []
            }
        })
        resp = r.json().get("message", {}).get("content", "")
    except Exception as e:
        raise HTTPException(500, str(e))
    
    return Res(response=resp, time=round(time.time() - t0, 2))


# ═══════════════════════════════════════════════════════════════════
# STREAMING ENDPOINT - First token in 2-3 seconds!
# ═══════════════════════════════════════════════════════════════════

async def stream_ollama(query: str) -> AsyncGenerator[str, None]:
    """Stream response from Ollama - text appears immediately!"""
    client = await get_client()
    system_prompt = build_system_prompt()
    
    try:
        async with client.stream(
            "POST",
            f"{OLLAMA}/api/chat",
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                "stream": True,  # STREAMING!
                "options": {
                    "num_ctx": 8192,
                    "num_predict": -1,
                    "temperature": 0.7,
                    "num_keep": 0,
                    "mirostat": 0
                }
            }
        ) as response:
            async for line in response.aiter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        if "message" in data and "content" in data["message"]:
                            content = data["message"]["content"]
                            if content:
                                yield content
                        if data.get("done", False):
                            break
                    except json.JSONDecodeError:
                        continue
    except Exception as e:
        yield f"\n[Error: {str(e)}]"


@app.post("/api/v1/chat/stream")
async def chat_stream(req: Req, request: Request):
    """
    STREAMING chat endpoint!
    First token appears within 2-3 seconds instead of waiting 60+ seconds.
    """
    q = req.message or req.query
    if not q:
        raise HTTPException(400, "message required")
    
    # Rate limit check
    user_id = request.headers.get("X-User-ID") or request.client.host or "anonymous"
    is_admin = request.headers.get("X-Admin") == "true"
    allowed, remaining = check_rate_limit(user_id, is_admin=is_admin)
    if not allowed:
        raise HTTPException(429, "Rate limit exceeded")
    
    return StreamingResponse(
        stream_ollama(q),
        media_type="text/plain"
    )


@app.post("/api/v1/query", response_model=Res)
async def query(req: Req, request: Request):
    return await chat(req, request)

@app.get("/api/v1/rate-limit")
async def get_rate_limit(request: Request):
    """Check current rate limit status"""
    user_id = request.headers.get("X-User-ID") or request.client.host or "anonymous"
    now = datetime.now()
    hour_ago = now - timedelta(hours=1)
    
    # Clean and count
    rate_limits[user_id] = [ts for ts in rate_limits[user_id] if ts > hour_ago]
    count = len(rate_limits[user_id])
    
    return {
        "user_id": user_id,
        "used": count,
        "limit": FREE_TIER_LIMIT,
        "remaining": max(0, FREE_TIER_LIMIT - count),
        "period": "1 hour",
        "tier": "free_trial",
        "trial_months": FREE_TRIAL_MONTHS
    }

@app.get("/api/v1/status")
async def status():
    return {"status": "ok", "model": MODEL, "mode": "nanogrid", "realtime": True}


# ═══════════════════════════════════════════════════════════════════
# REAL-TIME DATA ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@app.get("/api/v1/now")
async def get_now():
    """Get current date/time"""
    now = datetime.now()
    return {
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M:%S"),
        "weekday": now.strftime("%A"),
        "timestamp": now.isoformat(),
        "timezone": "CET/Berlin"
    }


@app.get("/api/v1/weather/{city}")
async def get_weather(city: str = "Tirana"):
    """Get weather for a city"""
    weather = await fetch_weather(city)
    return {"city": city, "weather": weather}


@app.get("/api/v1/wiki/{query}")
async def get_wiki(query: str):
    """Search Wikipedia"""
    results = await fetch_wikipedia(query)
    return {"query": query, "results": results}


# ═══════════════════════════════════════════════════════════════════
# MORE DATA SOURCES
# ═══════════════════════════════════════════════════════════════════

@app.get("/api/v1/crypto/{symbol}")
async def get_crypto(symbol: str = "bitcoin"):
    """Get crypto price from CoinGecko (free)"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"https://api.coingecko.com/api/v3/simple/price?ids={symbol}&vs_currencies=usd,eur")
            if r.status_code == 200:
                return {"symbol": symbol, "prices": r.json()}
    except:
        pass
    return {"symbol": symbol, "error": "Could not fetch price"}


@app.get("/api/v1/github/{owner}/{repo}")
async def get_github_repo(owner: str, repo: str):
    """Get GitHub repo info"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"https://api.github.com/repos/{owner}/{repo}")
            if r.status_code == 200:
                data = r.json()
                return {
                    "name": data.get("full_name"),
                    "description": data.get("description"),
                    "stars": data.get("stargazers_count"),
                    "forks": data.get("forks_count"),
                    "language": data.get("language"),
                    "url": data.get("html_url")
                }
    except:
        pass
    return {"error": "Could not fetch repo"}


@app.get("/api/v1/arxiv/{query}")
async def search_arxiv(query: str):
    """Search scientific papers on Arxiv"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(f"http://export.arxiv.org/api/query?search_query=all:{query}&max_results=5")
            if r.status_code == 200:
                # Parse XML response (simplified)
                text = r.text
                titles = []
                import re
                for match in re.findall(r'<title>(.*?)</title>', text):
                    if match != "ArXiv Query":
                        titles.append(match.strip())
                return {"query": query, "papers": titles[:5]}
    except:
        pass
    return {"query": query, "papers": []}


@app.get("/api/v1/earthquake")
async def get_earthquakes():
    """Get recent earthquakes from USGS"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson")
            if r.status_code == 200:
                data = r.json()
                quakes = []
                for f in data.get("features", [])[:5]:
                    props = f.get("properties", {})
                    quakes.append({
                        "place": props.get("place"),
                        "magnitude": props.get("mag"),
                        "time": props.get("time")
                    })
                return {"earthquakes": quakes}
    except:
        pass
    return {"earthquakes": []}


@app.get("/api/v1/sources")
async def list_sources():
    """List all available data sources"""
    return {
        "realtime": ["now", "weather", "earthquake"],
        "knowledge": ["wiki", "arxiv", "github"],
        "finance": ["crypto"],
        "agents": ["alba", "albi", "asi", "jona", "translation"]
    }


# Keep-alive pulse (background)
async def keep_alive():
    """Pulse every 30s to keep Ollama model hot"""
    while True:
        await asyncio.sleep(30)
        try:
            client = await get_client()
            await client.get(f"{OLLAMA}/api/ps")
        except:
            pass

@app.on_event("startup")
async def start_keepalive():
    asyncio.create_task(keep_alive())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
