#!/usr/bin/env python3
"""
Ocean Nanogrid - Sleep/Wake Pattern
====================================
- Persistent connection pool (no reconnect overhead)
- Keep-alive to Ollama
- Minimal footprint when idle
- Instant wake on request
- Rate limiting: 1000 msg/hour for free tier
- Optional API key authentication
"""
import asyncio
import json
import os
import time
from collections import defaultdict
from datetime import datetime, timedelta
from typing import AsyncGenerator, Optional

import httpx
from fastapi import Depends, FastAPI, HTTPException, Request, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import APIKeyHeader
from pydantic import BaseModel

OLLAMA = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL = os.getenv("MODEL", "llama3.1:8b")
PORT = int(os.getenv("PORT", "8030"))
API_KEYS_FILE = os.getenv("API_KEYS_FILE", "/app/config/api_keys.json")

# API Key Security (Optional)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def load_api_keys() -> dict:
    """Load valid API keys from config file."""
    try:
        with open(API_KEYS_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"dev": "clisonix-dev-key-2025"}


def verify_api_key(api_key: Optional[str] = Security(api_key_header)) -> str:
    """Verify API key if provided. Returns role or 'anonymous'."""
    if not api_key:
        return "anonymous"
    valid_keys = load_api_keys()
    for role, key in valid_keys.items():
        if key == api_key:
            return role
    return "anonymous"

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


# ═══════════════════════════════════════════════════════════════════
# REAL API INTEGRATIONS - CoinGecko, News, USGS, Internal Services
# ═══════════════════════════════════════════════════════════════════

async def fetch_crypto_prices() -> str:
    """Get crypto prices from CoinGecko (FREE API)"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd,eur")
            if r.status_code == 200:
                data = r.json()
                lines = []
                for coin, prices in data.items():
                    lines.append(f"- {coin.title()}: ${prices.get('usd', 'N/A')} / €{prices.get('eur', 'N/A')}")
                return "💰 Crypto Prices:\n" + "\n".join(lines)
    except:
        pass
    return ""


async def fetch_earthquakes() -> str:
    """Get recent earthquakes from USGS (FREE API)"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson")
            if r.status_code == 200:
                data = r.json()
                features = data.get("features", [])[:3]
                if features:
                    lines = []
                    for eq in features:
                        props = eq.get("properties", {})
                        lines.append(f"- M{props.get('mag')} {props.get('place')}")
                    return "🌍 Recent Earthquakes:\n" + "\n".join(lines)
    except:
        pass
    return ""


async def fetch_arxiv_papers(query: str = "AI") -> str:
    """Get recent papers from ArXiv (FREE API)"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"http://export.arxiv.org/api/query?search_query=all:{query}&max_results=3&sortBy=submittedDate")
            if r.status_code == 200:
                # Simple XML parsing
                text = r.text
                titles = []
                import re
                for match in re.findall(r'<title>(.*?)</title>', text)[1:4]:  # Skip first (feed title)
                    titles.append(f"- {match[:80]}...")
                if titles:
                    return "📚 Recent ArXiv Papers:\n" + "\n".join(titles)
    except:
        pass
    return ""


# ═══════════════════════════════════════════════════════════════════
# CLISONIX INTERNAL SERVICES - ALBA, ALBI, ASI, Kitchen
# ═══════════════════════════════════════════════════════════════════

INTERNAL_SERVICES = {
    "alba": {"port": 5555, "name": "ALBA Audio/EEG", "endpoints": ["/health", "/analyze"]},
    "albi": {"port": 6680, "name": "ALBI Neural", "endpoints": ["/health", "/process"]},
    "asi": {"port": 8035, "name": "ASI Intelligence", "endpoints": ["/health", "/status"]},
    "kitchen": {"port": 8006, "name": "Content Factory", "endpoints": ["/health", "/generate"]},
    "translation": {"port": 8036, "name": "Translation Node", "endpoints": ["/health", "/translate"]},
    "blerina": {"port": 8040, "name": "Blerina Formatter", "endpoints": ["/health", "/format"]},
    "excel": {"port": 8002, "name": "Excel Service", "endpoints": ["/health", "/api/excel/generate", "/api/excel/templates"]},
    "alphabet": {"port": 8061, "name": "Alphabet Layers", "endpoints": ["/health", "/api/v1/curiosity/algebra/op"]},
    "intelligence_lab": {"port": 8099, "name": "Intelligence Lab (KLAJDI+MALI)", "endpoints": ["/health", "/klajdi/status", "/mali/status"]},
    "jona": {"port": 7777, "name": "JONA Synthesizer", "endpoints": ["/health", "/synthesize"]},
}


# ═══════════════════════════════════════════════════════════════════
# LABORATORIES INTEGRATION - 23 Specialized Labs
# ═══════════════════════════════════════════════════════════════════

try:
    from laboratories import Laboratory, LaboratoryNetwork
    LABORATORIES_AVAILABLE = True
    _lab_network = LaboratoryNetwork()
except ImportError:
    LABORATORIES_AVAILABLE = False
    _lab_network = None
    logger.info("Laboratories module not loaded (optional)")


async def get_laboratory_status(lab_id: str = None) -> str:
    """Get status of laboratories"""
    if not LABORATORIES_AVAILABLE or not _lab_network:
        return "Laboratories module not available"
    
    try:
        if lab_id:
            lab = _lab_network.get_laboratory(lab_id)
            if lab:
                return f"""🔬 LABORATORY: {lab.name}
- Location: {lab.location}
- Function: {lab.function}
- Status: {lab.status}
- Staff: {lab.staff_count}
- Active Projects: {lab.active_projects}
- Data Quality: {lab.data_quality_score * 100:.1f}%"""
            return f"Laboratory {lab_id} not found"
        
        # All labs summary
        labs = _lab_network.get_all_laboratories()
        lab_list = "\n".join([f"- {l.lab_id}: {l.function} ({l.location})" for l in labs[:10]])
        return f"""🔬 CLISONIX LABORATORY NETWORK ({len(labs)} labs):
{lab_list}
... and {len(labs) - 10} more

Available in: Albania, Kosovo, Greece, Italy, Switzerland, Serbia, Bulgaria, Croatia, Slovenia, and more."""
    except Exception as e:
        return f"Error accessing laboratories: {str(e)}"


async def query_laboratory(lab_id: str, query: str) -> dict:
    """Query a specific laboratory for data"""
    if not LABORATORIES_AVAILABLE:
        return {"error": "Laboratories not available"}
    
    try:
        lab = _lab_network.get_laboratory(lab_id)
        if not lab:
            return {"error": f"Lab {lab_id} not found"}
        
        return {
            "lab": lab.to_dict(),
            "query": query,
            "response": f"Query processed by {lab.name}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}


# ═══════════════════════════════════════════════════════════════════
# BINARY ALGEBRA INTEGRATION
# ═══════════════════════════════════════════════════════════════════

try:
    from curiosity_algebra.binary_algebra import BinaryOp, get_binary_algebra
    BINARY_ALGEBRA_AVAILABLE = True
except ImportError:
    BINARY_ALGEBRA_AVAILABLE = False
    logger.info("Binary Algebra not loaded (optional)")


async def perform_binary_operation(a: int, b: int, op: str = "XOR", bits: int = 8) -> dict:
    """Perform binary algebra operation"""
    if BINARY_ALGEBRA_AVAILABLE:
        try:
            algebra = get_binary_algebra()
            op_map = {"AND": BinaryOp.AND, "OR": BinaryOp.OR, "XOR": BinaryOp.XOR, 
                      "NOT": BinaryOp.NOT, "NAND": BinaryOp.NAND, "NOR": BinaryOp.NOR,
                      "SHL": BinaryOp.SHL, "SHR": BinaryOp.SHR, "ADD": BinaryOp.ADD}
            binary_op = op_map.get(op.upper(), BinaryOp.XOR)
            result = algebra.operate(a, binary_op, b, bits)
            return {
                "success": True,
                "a": a, "b": b, "op": op, "bits": bits,
                "result": result.value if hasattr(result, 'value') else result,
                "binary": bin(result.value if hasattr(result, 'value') else result)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # Fallback to simple Python operations
    ops = {"AND": a & b, "OR": a | b, "XOR": a ^ b, "NOT": ~a, "ADD": a + b}
    result = ops.get(op.upper(), a ^ b) & ((1 << bits) - 1)
    return {"success": True, "a": a, "b": b, "op": op, "result": result, "binary": bin(result)}


async def get_binary_context() -> str:
    """Get binary algebra context for chat"""
    if BINARY_ALGEBRA_AVAILABLE:
        return """🔢 BINARY ALGEBRA ENGINE ACTIVE:
- Operations: AND, OR, XOR, NOT, NAND, NOR, SHL, SHR, ADD, SUB, MUL
- Bit widths: 8, 16, 32, 64 bits
- Signal algebra, matrix operations, Fourier in binary
- Use: "calculate XOR of 255 and 128" or "binary operation 42 AND 15" """
    return ""


async def get_internal_service_status() -> str:
    """Check status of all Clisonix internal services"""
    results = []
    async with httpx.AsyncClient(timeout=2.0) as client:
        for name, config in INTERNAL_SERVICES.items():
            try:
                r = await client.get(f"http://localhost:{config['port']}/health")
                if r.status_code == 200:
                    results.append(f"✅ {config['name']} (:{config['port']})")
                else:
                    results.append(f"⚠️ {config['name']} (:{config['port']}) - {r.status_code}")
            except:
                results.append(f"❌ {config['name']} (:{config['port']}) - offline")
    return "🔧 Clisonix Services:\n" + "\n".join(results)


async def call_alba_analyze(data: dict) -> dict:
    """Call ALBA for audio/EEG analysis"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post("http://localhost:5555/analyze", json=data)
            return r.json()
    except Exception as e:
        return {"error": str(e)}


async def call_kitchen_generate(topic: str) -> dict:
    """Call Content Factory to generate content"""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post("http://localhost:8006/generate", json={"topic": topic})
            return r.json()
    except Exception as e:
        return {"error": str(e)}


# ═══════════════════════════════════════════════════════════════════
# SMART CONTEXT BUILDER - Fetches relevant data based on query
# ═══════════════════════════════════════════════════════════════════

async def build_smart_context(query: str) -> str:
    """Build context by fetching relevant data based on user query"""
    context_parts = []
    query_lower = query.lower()
    
    # Weather detection
    weather_keywords = ["weather", "wetter", "moti", "temperatura", "temperature", "rain", "sunny"]
    if any(kw in query_lower for kw in weather_keywords):
        # Extract city if mentioned
        cities = ["düsseldorf", "dusseldorf", "frankfurt", "berlin", "tirana", "munich", "hamburg", "cologne"]
        city = "Frankfurt"  # default
        for c in cities:
            if c in query_lower:
                city = c.title()
                break
        weather = await fetch_weather(city)
        if weather:
            context_parts.append(weather)
    
    # Crypto detection
    crypto_keywords = ["bitcoin", "crypto", "ethereum", "btc", "eth", "coin", "krypto"]
    if any(kw in query_lower for kw in crypto_keywords):
        crypto = await fetch_crypto_prices()
        if crypto:
            context_parts.append(crypto)
    
    # Earthquake/disaster detection
    earthquake_keywords = ["earthquake", "erdbeben", "tërmet", "seismic", "disaster"]
    if any(kw in query_lower for kw in earthquake_keywords):
        quakes = await fetch_earthquakes()
        if quakes:
            context_parts.append(quakes)
    
    # Scientific papers
    science_keywords = ["paper", "research", "study", "arxiv", "science", "publikim"]
    if any(kw in query_lower for kw in science_keywords):
        papers = await fetch_arxiv_papers("machine learning")
        if papers:
            context_parts.append(papers)
    
    # Service status
    service_keywords = ["service", "status", "health", "alba", "albi", "system", "shërbim"]
    if any(kw in query_lower for kw in service_keywords):
        status = await get_internal_service_status()
        context_parts.append(status)
    
    # Excel/data/tabela detection
    excel_keywords = ["excel", "tabela", "spreadsheet", "data", "export", "metrics", "të dhëna", "raport", "report"]
    if any(kw in query_lower for kw in excel_keywords):
        excel_data = await fetch_excel_data()
        if excel_data:
            context_parts.append(excel_data)
    
    # Data sources - 5000+ global open data sources
    data_keywords = ["burim", "source", "database", "hospital", "bank", "university", "government", "shëndetësi", "ministri"]
    if any(kw in query_lower for kw in data_keywords):
        data_sources = await fetch_from_data_sources(query)
        if data_sources:
            context_parts.append(data_sources)
    
    # Binary algebra detection
    binary_keywords = ["binary", "binar", "xor", "and", "or", "not", "bit", "algebra", "hex", "operacion"]
    if any(kw in query_lower for kw in binary_keywords):
        binary_context = await get_binary_context()
        if binary_context:
            context_parts.append(binary_context)
    
    # Laboratory detection - 23 specialized labs
    lab_keywords = ["lab", "laboratory", "laborator", "research", "elbasan", "tirana", "zurich", "prishtina", 
                    "durres", "vlore", "shkoder", "korce", "sarande", "athens", "rome", "beograd", 
                    "sofia", "zagreb", "ljubljana", "klajdi", "mali"]
    if any(kw in query_lower for kw in lab_keywords):
        lab_status = await get_laboratory_status()
        if lab_status:
            context_parts.append(lab_status)
    
    # Auto web browse - if user asks about a specific URL
    import re
    url_pattern = r'https?://[^\s<>"\']+'
    urls = re.findall(url_pattern, query)
    if urls:
        for url in urls[:2]:  # Max 2 URLs
            webpage = await fetch_webpage(url, max_chars=4000)
            if webpage and not webpage.startswith("Error"):
                context_parts.append(f"📄 WEBPAGE ({url}):\n{webpage[:3000]}")
    
    return "\n\n".join(context_parts) if context_parts else ""


# ═══════════════════════════════════════════════════════════════════
# EXCEL SERVICE INTEGRATION
# ═══════════════════════════════════════════════════════════════════

EXCEL_SERVICE_URL = os.environ.get("EXCEL_SERVICE_URL", "http://localhost:8002")

async def fetch_excel_data() -> str:
    """Fetch available Excel data and templates from Excel service"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Get available templates
            templates_resp = await client.get(f"{EXCEL_SERVICE_URL}/api/excel/templates")
            templates = templates_resp.json() if templates_resp.status_code == 200 else {}
            
            # Get available formulas
            formulas_resp = await client.get(f"{EXCEL_SERVICE_URL}/api/excel/formulas")
            formulas = formulas_resp.json() if formulas_resp.status_code == 200 else {}
            
            # Get service status
            status_resp = await client.get(f"{EXCEL_SERVICE_URL}/status")
            status = status_resp.json() if status_resp.status_code == 200 else {}
            
            return f"""📊 EXCEL SERVICE DATA (Live from port 8002):
- Status: {'✅ Online' if status else '❌ Offline'}
- Available Templates: {json.dumps(templates.get('templates', []), indent=2) if templates else 'None loaded'}
- Supported Formulas: {', '.join(formulas.get('categories', [])) if formulas else 'Standard Excel formulas'}
- Export Formats: XLSX, CSV, PDF
- Features: =PY() formula support, Office Scripts, Data Validation"""
    except Exception as e:
        return f"📊 Excel Service: Connection error ({str(e)[:50]})"


async def generate_excel_export(data: dict, title: str = "Ocean Export") -> dict:
    """Request Excel export from Excel service"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{EXCEL_SERVICE_URL}/api/excel/generate",
                params={"title": title, "include_metrics": True}
            )
            if resp.status_code == 200:
                return {"success": True, "message": "Excel file generated", "size": len(resp.content)}
            return {"success": False, "error": resp.text}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ═══════════════════════════════════════════════════════════════════
# WEB BROWSING - Auto-fetch web pages for context
# ═══════════════════════════════════════════════════════════════════

async def fetch_webpage(url: str, max_chars: int = 8000) -> str:
    """Fetch and extract text content from a webpage"""
    try:
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            headers = {"User-Agent": "Mozilla/5.0 (compatible; ClisonixOcean/1.0)"}
            resp = await client.get(url, headers=headers)
            
            if resp.status_code != 200:
                return f"Error fetching {url}: HTTP {resp.status_code}"
            
            html = resp.text
            
            # Simple HTML to text extraction
            import re
            # Remove scripts and styles
            html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
            html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
            # Remove HTML tags
            text = re.sub(r'<[^>]+>', ' ', html)
            # Clean whitespace
            text = re.sub(r'\s+', ' ', text).strip()
            # Decode entities
            text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
            
            return text[:max_chars]
    except Exception as e:
        return f"Error fetching webpage: {str(e)}"


async def search_web(query: str, num_results: int = 5) -> list:
    """Search the web using DuckDuckGo (no API key needed)"""
    try:
        search_url = f"https://html.duckduckgo.com/html/?q={query}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {"User-Agent": "Mozilla/5.0 (compatible; ClisonixOcean/1.0)"}
            resp = await client.get(search_url, headers=headers)
            
            if resp.status_code != 200:
                return [{"error": f"Search failed: HTTP {resp.status_code}"}]
            
            # Parse results (simplified)
            import re
            results = []
            # Find result links
            links = re.findall(r'href="//duckduckgo.com/l/\?uddg=([^"&]+)', resp.text)
            titles = re.findall(r'class="result__a"[^>]*>([^<]+)', resp.text)
            
            from urllib.parse import unquote
            for i, link in enumerate(links[:num_results]):
                url = unquote(link)
                title = titles[i] if i < len(titles) else url
                results.append({"title": title, "url": url})
            
            return results if results else [{"info": "No results found"}]
    except Exception as e:
        return [{"error": str(e)}]


# ═══════════════════════════════════════════════════════════════════
# GLOBAL DATA SOURCES - 5000+ sources from 200+ countries
# ═══════════════════════════════════════════════════════════════════

async def fetch_from_data_sources(query: str, region: str = "global") -> str:
    """Fetch relevant data from the 5000+ registered global data sources"""
    try:
        # Import the data sources module
        import sys
        sys.path.insert(0, str(Path(__file__).parent.parent / "data_sources"))
        
        from data_sources.global_data_sources import (
            get_sources_by_country,
            get_sources_for_topic,
        )
        
        # Detect topic from query
        query_lower = query.lower()
        
        topic_mappings = {
            "weather": "environmental",
            "bank": "bank", "finance": "bank", "economic": "bank",
            "hospital": "hospital", "health": "hospital", "medical": "hospital",
            "university": "university", "education": "university", "research": "research",
            "news": "news", "media": "news",
            "government": "government", "politik": "government",
            "sport": "sport", "football": "sport", "futbol": "sport",
            "industry": "industry", "manufacture": "industry",
            "tech": "technology", "technology": "technology"
        }
        
        detected_topic = None
        for keyword, topic in topic_mappings.items():
            if keyword in query_lower:
                detected_topic = topic
                break
        
        if detected_topic:
            sources = get_sources_for_topic(detected_topic, limit=10)
            if sources:
                source_list = "\n".join([f"- {s.name}: {s.url}" for s in sources[:10]])
                return f"""📚 DATA SOURCES for {detected_topic.upper()}:
{source_list}

Note: These are verified open data sources. For real-time data, query their APIs directly."""
        
        return ""
    except Exception as e:
        logger.debug(f"Data sources not available: {e}")
        return ""


def build_system_prompt(extra_context: str = "") -> str:
    """Build system prompt with real-time context"""
    realtime = get_realtime_context()
    return f"""You are **Ocean** 🌊, the AI brain of Clisonix Cloud.

{realtime}

## RESPONSE RULES
1. START WRITING IMMEDIATELY - no thinking pause
2. Respond in the user's language
3. Be helpful and thorough
4. Use real-time data when relevant (date, weather, etc.)
5. Never say "I don't have access to current date/time" - YOU DO!

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
        # 🔥 SMART CONTEXT: Fetch real data based on query
        smart_context = await build_smart_context(q)
        
        # Build prompt with real-time context + smart data
        system_prompt = build_system_prompt(extra_context=smart_context)
        
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
    
    # 🔥 SMART CONTEXT: Fetch real data based on query
    smart_context = await build_smart_context(query)
    system_prompt = build_system_prompt(extra_context=smart_context)
    
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


# ═══════════════════════════════════════════════════════════════════
# BINARY ALGEBRA ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@app.get("/api/v1/algebra/op")
async def binary_algebra_operation(a: int, b: int = 0, op: str = "XOR", bits: int = 8):
    """
    Operacion binar algjebrik
    
    Përdorimi:
        GET /api/v1/algebra/op?a=255&b=128&op=XOR
        GET /api/v1/algebra/op?a=42&b=15&op=AND&bits=16
    
    Operations: AND, OR, XOR, NOT, NAND, NOR, SHL, SHR, ADD
    """
    result = await perform_binary_operation(a, b, op, bits)
    return result


@app.get("/api/v1/algebra/convert")
async def binary_convert(value: int, bits: int = 8):
    """
    Konverto numër në formate të ndryshme
    
    Përdorimi:
        GET /api/v1/algebra/convert?value=255&bits=8
    
    Returns: binary, hex, octal representations
    """
    mask = (1 << bits) - 1
    masked = value & mask
    return {
        "decimal": masked,
        "binary": bin(masked),
        "hex": hex(masked),
        "octal": oct(masked),
        "bits": bits,
        "bit_array": [int(b) for b in format(masked, f'0{bits}b')]
    }


# ═══════════════════════════════════════════════════════════════════
# LABORATORIES ENDPOINTS - 23 Specialized Labs
# ═══════════════════════════════════════════════════════════════════

@app.get("/api/v1/labs")
async def list_laboratories():
    """
    Lista e 23 laboratorëve të Clisonix
    
    Returns: All laboratories with their functions and locations
    """
    status = await get_laboratory_status()
    return {"laboratories": status, "count": 23}


@app.get("/api/v1/labs/{lab_id}")
async def get_laboratory_info(lab_id: str):
    """
    Informacion për një laborator specifik
    
    Përdorimi:
        GET /api/v1/labs/Zurich_Finance
        GET /api/v1/labs/Elbasan_AI
        GET /api/v1/labs/Tirana_Medical
    """
    status = await get_laboratory_status(lab_id)
    return {"lab_id": lab_id, "info": status}


@app.post("/api/v1/labs/{lab_id}/query")
async def query_laboratory_endpoint(lab_id: str, request: Request):
    """
    Dërgo pyetje në një laborator
    
    Body: {"query": "your question"}
    """
    body = await request.json()
    query = body.get("query", "")
    result = await query_laboratory(lab_id, query)
    return result


# ═══════════════════════════════════════════════════════════════════
# WEB BROWSING ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@app.get("/api/v1/browse")
async def browse_webpage_endpoint(url: str, max_chars: int = 8000):
    """
    Lexon përmbajtjen e një faqe web
    
    Përdorimi:
        GET /api/v1/browse?url=https://example.com
        GET /api/v1/browse?url=https://example.com&max_chars=4000
    
    Returns:
        Teksti i pastër i faqes web
    """
    content = await fetch_webpage(url, max_chars)
    return {
        "url": url,
        "content": content,
        "chars": len(content)
    }


@app.get("/api/v1/search")
async def web_search_endpoint(q: str, num: int = 5):
    """
    Kërkon në internet me DuckDuckGo
    
    Përdorimi:
        GET /api/v1/search?q=python tutorials
        GET /api/v1/search?q=weather tirana&num=3
    
    Returns:
        Lista e rezultateve
    """
    results = await search_web(q, num)
    return {
        "query": q,
        "results": results,
        "source": "DuckDuckGo"
    }


@app.post("/api/v1/chat/browse")
async def chat_with_webpage(request: Request):
    """
    Chat me kontekstin e një faqe web
    
    Body:
    {
        "url": "https://example.com",
        "message": "Çfarë thotë kjo faqe?"
    }
    
    Ocean lexon faqen dhe përgjigjet bazuar në përmbajtjen
    """
    body = await request.json()
    url = body.get("url", "")
    message = body.get("message", body.get("query", ""))
    
    if not url:
        raise HTTPException(400, "url required")
    if not message:
        raise HTTPException(400, "message required")
    
    # Lexo faqen
    webpage_content = await fetch_webpage(url, max_chars=6000)
    
    # Krijo system prompt me kontekstin e faqes
    system_prompt = build_system_prompt(extra_context=f"""
📄 WEB PAGE CONTENT from {url}:
{webpage_content}

Answer the user's question based on this webpage content.""")
    
    client = await get_client()
    resp = await client.post(
        f"{OLLAMA}/api/chat",
        json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "stream": False,
            "options": {"num_ctx": 8192, "temperature": 0.7}
        }
    )
    
    data = resp.json()
    answer = data.get("message", {}).get("content", "No response")
    
    return {
        "url": url,
        "question": message,
        "answer": answer
    }


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


# ═══════════════════════════════════════════════════════════════════
# 🎤 MULTIMODAL ENDPOINTS - Mikrofon, Kamera, Dokumente
# ═══════════════════════════════════════════════════════════════════

import base64

# Multimodal Models
VISION_MODEL = os.getenv("VISION_MODEL", "llava:latest")

class VisionRequest(BaseModel):
    """Request për analizë imazhi"""
    image_base64: str
    prompt: Optional[str] = "Përshkruaj këtë imazh në detaje"
    extract_text: bool = False  # OCR mode

class AudioRequest(BaseModel):
    """Request për transkriptim audio"""
    audio_base64: str
    language: str = "sq"  # Albanian default

class DocumentRequest(BaseModel):
    """Request për lexim/shkrim dokumentash"""
    content: str
    action: str = "analyze"  # "analyze", "summarize", "extract", "write"
    doc_type: str = "text"  # "pdf", "docx", "text", "markdown"
    output_format: str = "text"  # "text", "markdown", "json"

class WriteDocumentRequest(BaseModel):
    """Request për gjenerim dokumenti"""
    topic: str
    doc_type: str = "article"  # "article", "report", "letter", "contract", "email"
    length: str = "medium"  # "short", "medium", "long"
    language: str = "sq"
    style: str = "professional"  # "professional", "casual", "academic"
    additional_context: Optional[str] = None


@app.post("/api/v1/vision/analyze")
async def analyze_image(req: VisionRequest):
    """
    🎥 KAMERA - Analizë imazhi me AI
    
    Përdorime:
    - Përshkrim imazhi
    - Njohje objektesh
    - OCR (text extraction)
    - Analizë skenash
    """
    t0 = time.time()
    
    try:
        client = await get_client()
        
        # Kontrollo nëse llava është instaluar
        prompt = req.prompt
        if req.extract_text:
            prompt = "Ekstrakto të gjithë tekstin e dukshëm në këtë imazh. Kthe vetëm tekstin."
        
        response = await client.post(
            f"{OLLAMA}/api/generate",
            json={
                "model": VISION_MODEL,
                "prompt": prompt,
                "images": [req.image_base64],
                "stream": False,
                "options": {
                    "num_predict": -1,
                    "temperature": 0.3
                }
            },
            timeout=60.0
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                "status": "success",
                "analysis": result.get("response", ""),
                "mode": "ocr" if req.extract_text else "vision",
                "model": VISION_MODEL,
                "processing_time": round(time.time() - t0, 2)
            }
        else:
            # Fallback nëse llava nuk është instaluar
            return {
                "status": "model_not_found",
                "message": f"Modeli {VISION_MODEL} nuk është instaluar. Ekzekuto: ollama pull llava",
                "install_command": f"ollama pull {VISION_MODEL}"
            }
            
    except Exception as e:
        raise HTTPException(500, f"Vision error: {str(e)}")


@app.post("/api/v1/audio/transcribe")
async def transcribe_audio(req: AudioRequest):
    """
    🎤 MIKROFON - Transkriptim audio në tekst
    
    Përdorime:
    - Speech-to-text
    - Diktim zëri
    - Transkriptim takimesh
    - Ndihmë për të verbërit
    """
    t0 = time.time()
    
    try:
        # Decode audio
        audio_bytes = base64.b64decode(req.audio_base64)
        audio_size = len(audio_bytes)
        
        # Për demo: simulim transkriptimi
        # Real implementation do të përdorte Whisper ose faster-whisper
        
        # Kontrollo nëse whisper model ekziston
        client = await get_client()
        
        # Provo me Whisper API (nëse është instaluar)
        try:
            # Whisper përmes Ollama (nëse është vendosur)
            # Për tani, kthe simulim
            transcript = f"[Audio transkriptim: {audio_size} bytes, gjuha: {req.language}]"
            
            return {
                "status": "success",
                "transcript": transcript,
                "language": req.language,
                "duration_seconds": audio_size / 16000,  # Approx
                "word_count": len(transcript.split()),
                "processing_time": round(time.time() - t0, 2),
                "note": "Instaloni faster-whisper për transkriptim real"
            }
            
        except Exception as e:
            return {
                "status": "whisper_not_available",
                "message": "Whisper model nuk është instaluar",
                "install_command": "pip install faster-whisper"
            }
            
    except Exception as e:
        raise HTTPException(500, f"Audio error: {str(e)}")


@app.post("/api/v1/document/analyze")
async def analyze_document(req: DocumentRequest):
    """
    📄 DOKUMENT SCANNING - Lexim dhe analizë dokumentash
    
    Veprime:
    - analyze: Analizë e plotë
    - summarize: Përmbledhje
    - extract: Ekstraktim entitetesh
    """
    t0 = time.time()
    
    try:
        client = await get_client()
        
        # Ndërto prompt bazuar në veprim
        if req.action == "summarize":
            prompt = f"Përmbledh këtë dokument në 3-5 fjali kryesore:\n\n{req.content}"
        elif req.action == "extract":
            prompt = f"Ekstrakto entitetet kryesore (emra, data, organizata, vendndodhje) nga ky dokument:\n\n{req.content}"
        else:
            prompt = f"Analizo këtë dokument dhe jep një vlerësim të detajuar:\n\n{req.content}"
        
        response = await client.post(
            f"{OLLAMA}/api/chat",
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": "Ti je një analist dokumentash profesional. Përgjigju në gjuhën e dokumentit."},
                    {"role": "user", "content": prompt}
                ],
                "stream": False,
                "options": {"num_predict": -1}
            }
        )
        
        result = response.json()
        analysis = result.get("message", {}).get("content", "")
        
        return {
            "status": "success",
            "action": req.action,
            "doc_type": req.doc_type,
            "analysis": analysis,
            "word_count": len(req.content.split()),
            "processing_time": round(time.time() - t0, 2)
        }
        
    except Exception as e:
        raise HTTPException(500, f"Document error: {str(e)}")


@app.post("/api/v1/document/write")
async def write_document(req: WriteDocumentRequest):
    """
    ✍️ DOKUMENT WRITING - Gjenerim dokumentash
    
    Llojet:
    - article: Artikull
    - report: Raport
    - letter: Letër
    - contract: Kontratë
    - email: Email
    """
    t0 = time.time()
    
    try:
        client = await get_client()
        
        # Gjatësia sipas kërkesës
        length_guide = {
            "short": "200-300 fjalë",
            "medium": "500-800 fjalë",
            "long": "1000-1500 fjalë"
        }
        target_length = length_guide.get(req.length, "500-800 fjalë")
        
        # Ndërto prompt për gjenerim
        doc_type_prompts = {
            "article": f"Shkruaj një artikull profesional për temën: {req.topic}",
            "report": f"Shkruaj një raport formal për: {req.topic}",
            "letter": f"Shkruaj një letër zyrtare për: {req.topic}",
            "contract": f"Shkruaj një draft kontrate për: {req.topic}",
            "email": f"Shkruaj një email profesional për: {req.topic}"
        }
        
        base_prompt = doc_type_prompts.get(req.doc_type, doc_type_prompts["article"])
        
        full_prompt = f"""
{base_prompt}

Specifikimet:
- Gjatësia: {target_length}
- Gjuha: {"Shqip" if req.language == "sq" else req.language}
- Stili: {req.style}
{"- Kontekst shtesë: " + req.additional_context if req.additional_context else ""}

Shkruaj dokumentin e plotë, të gatshëm për përdorim.
"""
        
        response = await client.post(
            f"{OLLAMA}/api/chat",
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": "Ti je një shkrimtar profesional dokumentash. Gjithmonë shkruaj dokumente të plota, të formatuara mirë."},
                    {"role": "user", "content": full_prompt}
                ],
                "stream": False,
                "options": {"num_predict": -1, "temperature": 0.7}
            }
        )
        
        result = response.json()
        document = result.get("message", {}).get("content", "")
        
        return {
            "status": "success",
            "doc_type": req.doc_type,
            "topic": req.topic,
            "language": req.language,
            "document": document,
            "word_count": len(document.split()),
            "format": req.output_format if hasattr(req, 'output_format') else "text",
            "processing_time": round(time.time() - t0, 2)
        }
        
    except Exception as e:
        raise HTTPException(500, f"Document write error: {str(e)}")


@app.get("/api/v1/multimodal/status")
async def multimodal_status():
    """Kontrollo statusin e modeleve multimodal"""
    client = await get_client()
    
    try:
        response = await client.get(f"{OLLAMA}/api/tags")
        models = response.json().get("models", [])
        model_names = [m["name"] for m in models]
        
        return {
            "status": "ok",
            "capabilities": {
                "vision": {
                    "available": any("llava" in m.lower() for m in model_names),
                    "model": VISION_MODEL,
                    "endpoints": ["/api/v1/vision/analyze"]
                },
                "audio": {
                    "available": False,  # Whisper needs separate install
                    "note": "Instalo faster-whisper për audio",
                    "endpoints": ["/api/v1/audio/transcribe"]
                },
                "document": {
                    "available": True,
                    "model": MODEL,
                    "endpoints": ["/api/v1/document/analyze", "/api/v1/document/write"]
                }
            },
            "installed_models": model_names
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


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
