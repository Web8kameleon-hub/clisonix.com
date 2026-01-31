"""
SMART API ROUTER - THËRRAS API TË BRENDSHME DIREKT (1% CPU)
============================================================
Në vend që të përdorim Ollama për çdo pyetje (800% CPU, 38+ sek),
ky router thërret direkt API-të e brendshme për pyetje specifike.

Kur përdoret:
- "sa servise janë aktive" → thërret /health endpoints direkt
- "si është alba" → thërret alba API direkt  
- "çfarë laboratore kemi" → merr listën nga laboratories

Kur NUK përdoret (Ollama):
- Pyetje kreative, filozofike, diskutime
- Pyetje që kërkojnë logjikë komplekse
- Gjithçka që nuk ka endpoint specifik

CPU: 1% (vs 800% me Ollama)
Koha: <100ms (vs 38+ sekonda me Ollama)
"""

import os
import asyncio
import logging
import re
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime
from dataclasses import dataclass, field

logger = logging.getLogger("smart_api_router")

# API endpoints të brendshme
INTERNAL_ENDPOINTS = {
    "alba": {"port": 5555, "health": "/health", "name": "Alba Feeder"},
    "albi": {"port": 6666, "health": "/health", "name": "Albi Core"},
    "ocean": {"port": 8030, "health": "/health", "name": "Ocean Core"},
    "jona": {"port": 8001, "health": "/api/v1/health", "name": "Jona Gateway"},
    "asi": {"port": 8025, "health": "/health", "name": "ASI Realtime"},
    "cycle": {"port": 8020, "health": "/health", "name": "Cycle Engine"},
    "web": {"port": 3000, "health": "/", "name": "Web Frontend"},
    "balancer": {"port": 3333, "health": "/health", "name": "Balancer"},
    "ollama": {"port": 11434, "health": "/api/tags", "name": "Ollama LLM"},
}

# Pattern-at për query matching
SERVICE_PATTERNS = {
    "status": [
        r"(si\s+)?është\s+(alba|albi|ocean|jona|asi|cycle)",
        r"statusi?\s+i?\s*(alba|albi|ocean|jona|asi|cycle)",
        r"(alba|albi|ocean|jona|asi|cycle)\s+status",
        r"a\s+punon\s+(alba|albi|ocean|jona|asi|cycle)",
        r"is\s+(alba|albi|ocean|jona|asi|cycle)\s+(running|active|online)",
        r"(check|show)\s+(alba|albi|ocean|jona|asi|cycle)",
    ],
    "all_services": [
        r"sa\s+servise?\s+(janë|jane|ka|kemi)",
        r"cilat?\s+servise?\s+(janë|jane)\s+aktive?",
        r"(all|të gjitha)\s+service[s]?\s+(status)?",
        r"list[ao]?\s+service[s]?",
        r"(show|trego)\s+(all|të gjitha)\s+service",
        r"sistemi?\s+(status|aktiv)",
        r"(what|which)\s+services?\s+(are|is)\s+(running|active)",
    ],
    "labs": [
        r"(sa|cilat)\s+laborator[eë]?\s+(ka|kemi)",
        r"list[ao]?\s+lab[s]?",
        r"(show|trego)\s+lab[s]?",
        r"laborator[eë]+",
    ],
    "system_info": [
        r"(cpu|memory|ram|disk)\s*(usage|përdorim)",
        r"(sa|shumë|how much)\s+(cpu|memory|ram)",
        r"sistemi?\s+(info|informacion)",
        r"system\s+(info|status|health)",
    ],
    "models": [
        r"(sa|cilat)\s+model[e]?\s+(ka|kemi|janë)",
        r"(ollama|llm)\s+model[s]?",
        r"(list|trego)\s+model[s]?",
    ],
}


@dataclass
class SmartResponse:
    """Përgjigja nga Smart Router"""
    answered: bool  # True nëse u përgjigjëm pa Ollama
    response: str
    source: str  # "direct_api", "cache", "ollama_needed"
    processing_time_ms: float
    data: Optional[Dict[str, Any]] = None
    services_checked: List[str] = field(default_factory=list)


class SmartAPIRouter:
    """
    Router i zgjuar që thërret API-të direkt pa Ollama.
    
    - Kontrollon pattern-at e query
    - Thërret endpoints direkt me aiohttp
    - Kthen përgjigje të formatuara
    - Përdor Ollama VETËM kur duhet vërtet
    """
    
    def __init__(self):
        self._http_session = None
        self._cache: Dict[str, Any] = {}
        self._cache_ttl = 10  # 10 sekonda cache
        self._last_cache_time: Dict[str, datetime] = {}
        
        # Try to import aiohttp
        try:
            import aiohttp
            self._aiohttp = aiohttp
            logger.info("✅ SmartAPIRouter initialized with aiohttp")
        except ImportError:
            self._aiohttp = None
            logger.warning("⚠️ aiohttp not available, using fallback")
    
    async def _get_session(self):
        """Get or create aiohttp session"""
        if self._aiohttp and self._http_session is None:
            self._http_session = self._aiohttp.ClientSession(
                timeout=self._aiohttp.ClientTimeout(total=5)
            )
        return self._http_session
    
    async def close(self):
        """Close HTTP session"""
        if self._http_session:
            await self._http_session.close()
            self._http_session = None
    
    def _match_query(self, query: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Match query against patterns.
        Returns: (category, matched_service) or (None, None)
        """
        query_lower = query.lower().strip()
        
        for category, patterns in SERVICE_PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, query_lower, re.IGNORECASE)
                if match:
                    # Extract service name if present
                    groups = match.groups()
                    service = None
                    for g in groups:
                        if g and g.lower() in INTERNAL_ENDPOINTS:
                            service = g.lower()
                            break
                    return category, service
        
        return None, None
    
    async def _check_service(self, name: str) -> Dict[str, Any]:
        """Check single service health"""
        if name not in INTERNAL_ENDPOINTS:
            return {"name": name, "status": "unknown", "error": "Service not configured"}
        
        config = INTERNAL_ENDPOINTS[name]
        url = f"http://localhost:{config['port']}{config['health']}"
        
        start = datetime.now()
        
        # Check cache first
        cache_key = f"service_{name}"
        if cache_key in self._cache:
            cache_time = self._last_cache_time.get(cache_key)
            if cache_time and (datetime.now() - cache_time).seconds < self._cache_ttl:
                return self._cache[cache_key]
        
        try:
            session = await self._get_session()
            if session:
                async with session.get(url) as resp:
                    elapsed = (datetime.now() - start).total_seconds() * 1000
                    result = {
                        "name": config['name'],
                        "service": name,
                        "status": "active" if resp.status == 200 else "error",
                        "port": config['port'],
                        "response_time_ms": round(elapsed, 1),
                        "http_status": resp.status
                    }
            else:
                # Fallback without aiohttp
                import urllib.request
                req = urllib.request.urlopen(url, timeout=3)
                elapsed = (datetime.now() - start).total_seconds() * 1000
                result = {
                    "name": config['name'],
                    "service": name,
                    "status": "active" if req.status == 200 else "error",
                    "port": config['port'],
                    "response_time_ms": round(elapsed, 1),
                    "http_status": req.status
                }
        except Exception as e:
            elapsed = (datetime.now() - start).total_seconds() * 1000
            result = {
                "name": config['name'],
                "service": name,
                "status": "offline",
                "port": config['port'],
                "response_time_ms": round(elapsed, 1),
                "error": str(e)[:100]
            }
        
        # Cache result
        self._cache[cache_key] = result
        self._last_cache_time[cache_key] = datetime.now()
        
        return result
    
    async def _check_all_services(self) -> List[Dict[str, Any]]:
        """Check all services in parallel"""
        tasks = [self._check_service(name) for name in INTERNAL_ENDPOINTS.keys()]
        return await asyncio.gather(*tasks)
    
    async def _get_labs_info(self) -> Dict[str, Any]:
        """Get laboratory information"""
        try:
            from laboratories import get_laboratory_network
            labs = get_laboratory_network()
            lab_list = labs.get_all_labs() if labs else []
            return {
                "total": len(lab_list),
                "labs": [{"name": lab.get("name", "Unknown"), "type": lab.get("type", "research")} 
                        for lab in lab_list[:10]]  # Limit to 10
            }
        except Exception as e:
            return {"total": 0, "error": str(e)}
    
    async def _get_system_info(self) -> Dict[str, Any]:
        """Get system metrics"""
        try:
            import psutil
            return {
                "cpu_percent": psutil.cpu_percent(interval=0.1),
                "memory_percent": psutil.virtual_memory().percent,
                "disk_percent": psutil.disk_usage('/').percent,
            }
        except Exception as e:
            return {"error": str(e)}
    
    async def _get_ollama_models(self) -> List[str]:
        """Get available Ollama models"""
        try:
            session = await self._get_session()
            if session:
                async with session.get("http://localhost:11434/api/tags") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return [m.get("name", "unknown") for m in data.get("models", [])]
        except:
            pass
        return []
    
    def _format_service_status(self, services: List[Dict[str, Any]], lang: str = "sq") -> str:
        """Format services status as readable text"""
        active = [s for s in services if s.get("status") == "active"]
        offline = [s for s in services if s.get("status") != "active"]
        
        if lang == "sq":
            lines = [f"📊 **Statusi i Serviseve Clisonix**\n"]
            lines.append(f"✅ **Aktive:** {len(active)}/{len(services)}\n")
            
            for s in active:
                lines.append(f"  • **{s['name']}** (:{s['port']}) - ✅ {s.get('response_time_ms', 0):.0f}ms")
            
            if offline:
                lines.append(f"\n⚠️ **Jo Aktive:** {len(offline)}")
                for s in offline:
                    lines.append(f"  • **{s['name']}** (:{s['port']}) - ❌ {s.get('error', 'offline')[:30]}")
            
            return "\n".join(lines)
        else:
            lines = [f"📊 **Clisonix Services Status**\n"]
            lines.append(f"✅ **Active:** {len(active)}/{len(services)}\n")
            
            for s in active:
                lines.append(f"  • **{s['name']}** (:{s['port']}) - ✅ {s.get('response_time_ms', 0):.0f}ms")
            
            if offline:
                lines.append(f"\n⚠️ **Offline:** {len(offline)}")
                for s in offline:
                    lines.append(f"  • **{s['name']}** (:{s['port']}) - ❌ {s.get('error', 'offline')[:30]}")
            
            return "\n".join(lines)
    
    def _format_single_service(self, service: Dict[str, Any], lang: str = "sq") -> str:
        """Format single service status"""
        name = service.get('name', 'Unknown')
        status = service.get('status', 'unknown')
        port = service.get('port', '?')
        time_ms = service.get('response_time_ms', 0)
        
        if lang == "sq":
            if status == "active":
                return f"✅ **{name}** është aktiv në portin {port}\n⏱️ Koha e përgjigjes: {time_ms:.0f}ms"
            else:
                error = service.get('error', 'nuk dihet')
                return f"❌ **{name}** nuk është aktiv (port {port})\n⚠️ Arsyeja: {error[:50]}"
        else:
            if status == "active":
                return f"✅ **{name}** is active on port {port}\n⏱️ Response time: {time_ms:.0f}ms"
            else:
                error = service.get('error', 'unknown')
                return f"❌ **{name}** is offline (port {port})\n⚠️ Reason: {error[:50]}"
    
    async def route(self, query: str, lang: str = "sq") -> SmartResponse:
        """
        Route query - kthe përgjigje direkt ose lejo Ollama.
        
        Returns:
            SmartResponse with answered=True if handled directly,
            or answered=False if Ollama should be used.
        """
        start = datetime.now()
        
        # Match query to pattern
        category, service = self._match_query(query)
        
        if category is None:
            # No pattern matched - let Ollama handle it
            elapsed = (datetime.now() - start).total_seconds() * 1000
            return SmartResponse(
                answered=False,
                response="",
                source="ollama_needed",
                processing_time_ms=round(elapsed, 2)
            )
        
        # Handle based on category
        try:
            if category == "status" and service:
                # Single service status
                result = await self._check_service(service)
                elapsed = (datetime.now() - start).total_seconds() * 1000
                return SmartResponse(
                    answered=True,
                    response=self._format_single_service(result, lang),
                    source="direct_api",
                    processing_time_ms=round(elapsed, 2),
                    data=result,
                    services_checked=[service]
                )
            
            elif category == "all_services":
                # All services status
                results = await self._check_all_services()
                elapsed = (datetime.now() - start).total_seconds() * 1000
                return SmartResponse(
                    answered=True,
                    response=self._format_service_status(results, lang),
                    source="direct_api",
                    processing_time_ms=round(elapsed, 2),
                    data={"services": results},
                    services_checked=list(INTERNAL_ENDPOINTS.keys())
                )
            
            elif category == "labs":
                # Laboratory info
                labs_data = await self._get_labs_info()
                elapsed = (datetime.now() - start).total_seconds() * 1000
                
                if lang == "sq":
                    response = f"🔬 **Laboratorët Clisonix**\n\nTotali: **{labs_data.get('total', 0)}** laboratorë"
                    if labs_data.get('labs'):
                        response += "\n\n**Lista:**"
                        for lab in labs_data['labs']:
                            response += f"\n  • {lab['name']} ({lab['type']})"
                else:
                    response = f"🔬 **Clisonix Laboratories**\n\nTotal: **{labs_data.get('total', 0)}** labs"
                    if labs_data.get('labs'):
                        response += "\n\n**List:**"
                        for lab in labs_data['labs']:
                            response += f"\n  • {lab['name']} ({lab['type']})"
                
                return SmartResponse(
                    answered=True,
                    response=response,
                    source="direct_api",
                    processing_time_ms=round(elapsed, 2),
                    data=labs_data
                )
            
            elif category == "system_info":
                # System metrics
                sys_info = await self._get_system_info()
                elapsed = (datetime.now() - start).total_seconds() * 1000
                
                if lang == "sq":
                    response = f"💻 **Metrikat e Sistemit**\n\n"
                    response += f"  • CPU: **{sys_info.get('cpu_percent', '?')}%**\n"
                    response += f"  • RAM: **{sys_info.get('memory_percent', '?')}%**\n"
                    response += f"  • Disku: **{sys_info.get('disk_percent', '?')}%**"
                else:
                    response = f"💻 **System Metrics**\n\n"
                    response += f"  • CPU: **{sys_info.get('cpu_percent', '?')}%**\n"
                    response += f"  • Memory: **{sys_info.get('memory_percent', '?')}%**\n"
                    response += f"  • Disk: **{sys_info.get('disk_percent', '?')}%**"
                
                return SmartResponse(
                    answered=True,
                    response=response,
                    source="direct_api",
                    processing_time_ms=round(elapsed, 2),
                    data=sys_info
                )
            
            elif category == "models":
                # Ollama models
                models = await self._get_ollama_models()
                elapsed = (datetime.now() - start).total_seconds() * 1000
                
                if lang == "sq":
                    response = f"🤖 **Modelet LLM në Ollama**\n\nTotali: **{len(models)}** modele"
                    if models:
                        response += "\n\n**Lista:**"
                        for m in models:
                            response += f"\n  • {m}"
                else:
                    response = f"🤖 **LLM Models in Ollama**\n\nTotal: **{len(models)}** models"
                    if models:
                        response += "\n\n**List:**"
                        for m in models:
                            response += f"\n  • {m}"
                
                return SmartResponse(
                    answered=True,
                    response=response,
                    source="direct_api",
                    processing_time_ms=round(elapsed, 2),
                    data={"models": models}
                )
        
        except Exception as e:
            logger.error(f"SmartAPIRouter error: {e}")
            elapsed = (datetime.now() - start).total_seconds() * 1000
            return SmartResponse(
                answered=False,
                response="",
                source="ollama_needed",
                processing_time_ms=round(elapsed, 2)
            )
        
        # Fallback - let Ollama handle
        elapsed = (datetime.now() - start).total_seconds() * 1000
        return SmartResponse(
            answered=False,
            response="",
            source="ollama_needed",
            processing_time_ms=round(elapsed, 2)
        )


# Singleton instance
_smart_router: Optional[SmartAPIRouter] = None

def get_smart_router() -> SmartAPIRouter:
    """Get singleton SmartAPIRouter instance"""
    global _smart_router
    if _smart_router is None:
        _smart_router = SmartAPIRouter()
    return _smart_router
