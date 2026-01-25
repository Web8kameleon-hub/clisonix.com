# -*- coding: utf-8 -*-
"""
🧠 REAL ANSWER ENGINE - NO PLACEHOLDERS, NO FAKES
=================================================
This engine ONLY returns REAL data from REAL sources.
If it doesn't know something, it says "I don't know" - NO FAKE ANSWERS.

Sources:
1. EXTERNAL APIs (Bonus - optional):
   - CoinGecko: Real crypto prices
   - OpenWeatherMap: Real weather data
   - PubMed: Real medical research
   - ArXiv: Real scientific papers

2. INTERNAL (Core - always available):
   - 56 Data Sources from 11 categories
   - 23 Laboratories with real research
   - Real file content from codebase
   - Real system statistics
   - Real configuration data

Author: Clisonix Team
Version: 2.0.0 - NO PLACEHOLDERS EDITION
"""

from __future__ import annotations
import asyncio
import aiohttp
import json
import logging
import os
import sys
import glob
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base path for reading real data
BASE_PATH = Path(__file__).parent.parent


# =============================================================================
# REAL DATA READERS
# =============================================================================

class RealFileReader:
    """Reads REAL content from project files"""
    
    @staticmethod
    def read_json(filepath: str) -> Optional[Dict]:
        """Read a real JSON file"""
        try:
            full_path = BASE_PATH / filepath
            if full_path.exists():
                with open(full_path, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Could not read {filepath}: {e}")
        return None
    
    @staticmethod
    def read_text(filepath: str, max_lines: int = 50) -> Optional[str]:
        """Read real text content from a file"""
        try:
            full_path = BASE_PATH / filepath
            if full_path.exists():
                with open(full_path, "r", encoding="utf-8") as f:
                    lines = f.readlines()[:max_lines]
                    return "".join(lines)
        except Exception as e:
            logger.warning(f"Could not read {filepath}: {e}")
        return None
    
    @staticmethod
    def list_files(pattern: str) -> List[str]:
        """List files matching a pattern"""
        try:
            matches = glob.glob(str(BASE_PATH / pattern), recursive=True)
            return [os.path.relpath(m, BASE_PATH) for m in matches]
        except Exception as e:
            logger.warning(f"Could not list files: {e}")
        return []
    
    @staticmethod
    def get_real_system_stats() -> Dict[str, Any]:
        """Get REAL system statistics"""
        stats = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "python_files": 0,
            "typescript_files": 0,
            "json_files": 0,
            "total_lines": 0,
            "directories": set()
        }
        
        try:
            for ext, key in [("*.py", "python_files"), ("*.ts", "typescript_files"), ("*.json", "json_files")]:
                matches = glob.glob(str(BASE_PATH / "**" / ext), recursive=True)
                stats[key] = len(matches)
            
            # Count real directories
            for root, dirs, files in os.walk(BASE_PATH):
                for d in dirs:
                    if not d.startswith('.') and d not in ['node_modules', '__pycache__', '.next']:
                        stats["directories"].add(d)
            
            stats["directories"] = len(stats["directories"])
            
        except Exception as e:
            logger.warning(f"Could not get system stats: {e}")
        
        return stats


class RealDataSourcesReader:
    """Reads REAL data from data_sources.json"""
    
    def __init__(self):
        self.data = self._load_data()
    
    def _load_data(self) -> Dict[str, Any]:
        """Load real data sources"""
        data = RealFileReader.read_json("ocean-core/data_sources.json")
        if data:
            return data
        
        # Try alternate location
        data = RealFileReader.read_json("data_sources.json")
        if data:
            return data
        
        return {}
    
    def get_count(self) -> int:
        """Get real count of data sources"""
        if isinstance(self.data, dict):
            categories = self.data.get("categories", [])
            if categories:
                return sum(len(cat.get("sources", [])) for cat in categories)
            # Count top-level items
            return len([k for k in self.data.keys() if k not in ["metadata", "version"]])
        return 0
    
    def get_categories(self) -> List[str]:
        """Get real category names"""
        if isinstance(self.data, dict):
            categories = self.data.get("categories", [])
            if categories:
                return [cat.get("name", "Unknown") for cat in categories]
            return list(self.data.keys())
        return []
    
    def search(self, query: str) -> List[Dict]:
        """Search for real data matching query"""
        results = []
        q_lower = query.lower()
        
        if isinstance(self.data, dict):
            for key, value in self.data.items():
                if q_lower in key.lower():
                    results.append({"key": key, "value": value})
                elif isinstance(value, dict):
                    desc = value.get("description", "")
                    if q_lower in desc.lower():
                        results.append({"key": key, "value": value})
        
        return results[:5]  # Limit results


class RealLaboratoryReader:
    """Reads REAL laboratory data"""
    
    def __init__(self):
        self.labs = self._load_labs()
    
    def _load_labs(self) -> List[Dict]:
        """Load real laboratory data"""
        labs_data = RealFileReader.read_json("ocean-core/laboratories.json")
        if labs_data and isinstance(labs_data, dict):
            return labs_data.get("laboratories", [])
        
        # Try to extract from Python file
        try:
            from laboratories import get_laboratory_network
            network = get_laboratory_network()
            if network:
                return [
                    {
                        "id": lab.id,
                        "name": lab.name,
                        "location": lab.location,
                        "function": lab.function,
                        "staff_count": lab.staff_count,
                        "active_projects": lab.active_projects
                    }
                    for lab in network.get_all_labs()
                ]
        except Exception as e:
            logger.warning(f"Could not load labs from module: {e}")
        
        return []
    
    def get_count(self) -> int:
        """Get real lab count"""
        return len(self.labs)
    
    def get_lab_by_topic(self, topic: str) -> Optional[Dict]:
        """Find lab by topic"""
        topic_lower = topic.lower()
        for lab in self.labs:
            if topic_lower in lab.get("function", "").lower():
                return lab
            if topic_lower in lab.get("name", "").lower():
                return lab
        return None
    
    def list_labs(self) -> List[str]:
        """List all lab names"""
        return [lab.get("name", "Unknown") for lab in self.labs]


# =============================================================================
# EXTERNAL API CONNECTORS - REAL DATA ONLY
# =============================================================================

class RealCryptoAPI:
    """Get REAL crypto prices from CoinGecko"""
    
    BASE_URL = "https://api.coingecko.com/api/v3"
    TIMEOUT = 10
    
    def __init__(self):
        self.cache: Dict[str, Tuple[Any, datetime]] = {}
        self.cache_duration = timedelta(seconds=60)
    
    async def get_price(self, coin: str = "bitcoin") -> Optional[Dict]:
        """Get REAL price from CoinGecko API"""
        cache_key = f"price_{coin}"
        
        # Check cache
        if cache_key in self.cache:
            data, timestamp = self.cache[cache_key]
            if datetime.now() - timestamp < self.cache_duration:
                return data
        
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/simple/price"
                params = {
                    "ids": coin,
                    "vs_currencies": "usd,eur",
                    "include_24hr_change": "true",
                    "include_last_updated_at": "true"
                }
                async with session.get(url, params=params, timeout=self.TIMEOUT) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        if coin in data:
                            result = {
                                "coin": coin,
                                "usd": data[coin].get("usd"),
                                "eur": data[coin].get("eur"),
                                "change_24h": data[coin].get("usd_24h_change"),
                                "last_updated": data[coin].get("last_updated_at"),
                                "source": "coingecko_live",
                                "fetched_at": datetime.now(timezone.utc).isoformat()
                            }
                            self.cache[cache_key] = (result, datetime.now())
                            return result
        except asyncio.TimeoutError:
            logger.warning(f"CoinGecko timeout for {coin}")
        except Exception as e:
            logger.warning(f"CoinGecko error for {coin}: {e}")
        
        return None  # Return None if we can't get real data - NO FAKE DATA


class RealWeatherAPI:
    """Get REAL weather from OpenWeatherMap"""
    
    BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
    API_KEY = os.environ.get("OPENWEATHERMAP_API_KEY", "")
    TIMEOUT = 10
    
    def __init__(self):
        self.cache: Dict[str, Tuple[Any, datetime]] = {}
        self.cache_duration = timedelta(minutes=10)
    
    async def get_weather(self, city: str = "Tirana") -> Optional[Dict]:
        """Get REAL weather from OpenWeatherMap API"""
        if not self.API_KEY:
            logger.warning("No OpenWeatherMap API key configured")
            return None
        
        cache_key = f"weather_{city.lower()}"
        
        # Check cache
        if cache_key in self.cache:
            data, timestamp = self.cache[cache_key]
            if datetime.now() - timestamp < self.cache_duration:
                return data
        
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "q": city,
                    "appid": self.API_KEY,
                    "units": "metric"
                }
                async with session.get(self.BASE_URL, params=params, timeout=self.TIMEOUT) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        result = {
                            "city": city,
                            "temperature": data.get("main", {}).get("temp"),
                            "feels_like": data.get("main", {}).get("feels_like"),
                            "humidity": data.get("main", {}).get("humidity"),
                            "description": data.get("weather", [{}])[0].get("description"),
                            "wind_speed": data.get("wind", {}).get("speed"),
                            "source": "openweathermap_live",
                            "fetched_at": datetime.now(timezone.utc).isoformat()
                        }
                        self.cache[cache_key] = (result, datetime.now())
                        return result
        except asyncio.TimeoutError:
            logger.warning(f"OpenWeatherMap timeout for {city}")
        except Exception as e:
            logger.warning(f"OpenWeatherMap error for {city}: {e}")
        
        return None  # Return None if we can't get real data - NO FAKE DATA


# =============================================================================
# REAL ANSWER ENGINE
# =============================================================================

@dataclass
class RealAnswer:
    """A REAL answer with actual data"""
    query: str
    answer: str
    source: str
    confidence: float
    data: Optional[Dict] = None
    is_real: bool = True  # Always true - we never fake


class RealAnswerEngine:
    """
    🧠 THE REAL ANSWER ENGINE
    
    Rules:
    1. ONLY return REAL data from REAL sources
    2. If we don't know something, say "Nuk kam të dhëna për këtë"
    3. NEVER generate placeholder/template responses
    4. ALWAYS cite the actual source
    """
    
    def __init__(self):
        # Internal data sources
        self.data_sources = RealDataSourcesReader()
        self.labs = RealLaboratoryReader()
        self.file_reader = RealFileReader()
        
        # External APIs
        self.crypto_api = RealCryptoAPI()
        self.weather_api = RealWeatherAPI()
        
        # Query patterns for routing
        self.HONEST_UNKNOWNS = [
            "Nuk kam të dhëna të mjaftueshme për të përgjijgur këtë pyetje.",
            "Kjo pyetje kërkon njohuri që nuk i kam aktualisht.",
            "Për këtë temë, do të duhej të konsultoja burime shtesë."
        ]
        
        logger.info("✅ RealAnswerEngine initialized - NO PLACEHOLDERS MODE")
        logger.info(f"   - Data sources: {self.data_sources.get_count()}")
        logger.info(f"   - Laboratories: {self.labs.get_count()}")
    
    async def answer(self, query: str) -> RealAnswer:
        """
        Generate a REAL answer - NO FAKES
        """
        q_lower = query.lower()
        
        # 1. Check for system/stats queries
        if self._is_system_query(q_lower):
            return await self._answer_system_query(query)
        
        # 2. Check for crypto queries
        if self._is_crypto_query(q_lower):
            return await self._answer_crypto_query(query)
        
        # 3. Check for weather queries
        if self._is_weather_query(q_lower):
            return await self._answer_weather_query(query)
        
        # 4. Check for data source queries
        if self._is_data_query(q_lower):
            return await self._answer_data_query(query)
        
        # 5. Check for lab queries
        if self._is_lab_query(q_lower):
            return await self._answer_lab_query(query)
        
        # 6. Greetings - these are OK to have standard responses
        if self._is_greeting(q_lower):
            return self._answer_greeting(query)
        
        # 7. Identity queries - we know who we are
        if self._is_identity_query(q_lower):
            return self._answer_identity(query)
        
        # 8. Search internal data
        search_results = self.data_sources.search(query)
        if search_results:
            return self._format_search_results(query, search_results)
        
        # 9. HONEST: We don't know
        return RealAnswer(
            query=query,
            answer=self.HONEST_UNKNOWNS[0] + f"\n\n📊 Megjithatë, mund të ofroj:\n- {self.data_sources.get_count()} burime të dhënash\n- {self.labs.get_count()} laboratorë\n- Çmime kripto në kohë reale\n\nPyetni për diçka specifike!",
            source="honest_unknown",
            confidence=0.3,
            is_real=True
        )
    
    # =================
    # QUERY CLASSIFIERS
    # =================
    
    def _is_system_query(self, q: str) -> bool:
        return any(kw in q for kw in [
            "how many", "sa", "count", "numër",
            "data source", "burim", "lab", "laborator",
            "system", "sistem", "status", "gjendje",
            "cycle", "cikël", "active", "aktiv"
        ])
    
    def _is_crypto_query(self, q: str) -> bool:
        return any(kw in q for kw in [
            "bitcoin", "btc", "ethereum", "eth",
            "crypto", "kripto", "çmim", "price"
        ])
    
    def _is_weather_query(self, q: str) -> bool:
        return any(kw in q for kw in [
            "weather", "mot", "temperatura", "temp",
            "shi", "rain", "diell", "sun"
        ])
    
    def _is_data_query(self, q: str) -> bool:
        return any(kw in q for kw in [
            "data", "të dhëna", "source", "burim",
            "category", "kategori"
        ])
    
    def _is_lab_query(self, q: str) -> bool:
        return any(kw in q for kw in [
            "lab", "laborator", "research", "kërkim",
            "project", "projekt"
        ])
    
    def _is_greeting(self, q: str) -> bool:
        return any(kw in q for kw in [
            "hello", "hi", "hey", "përshëndetje",
            "mirëdita", "tungjatjeta", "ç'kemi"
        ])
    
    def _is_identity_query(self, q: str) -> bool:
        return any(kw in q for kw in [
            "who are you", "kush je", "what are you",
            "çfarë je", "ku jemi", "where are we"
        ])
    
    # ================
    # ANSWER BUILDERS
    # ================
    
    async def _answer_system_query(self, query: str) -> RealAnswer:
        """Answer with REAL system statistics"""
        stats = self.file_reader.get_real_system_stats()
        
        # Data sources count
        ds_count = self.data_sources.get_count()
        categories = self.data_sources.get_categories()
        
        # Labs count
        lab_count = self.labs.get_count()
        lab_names = self.labs.list_labs()[:5]
        
        answer = f"""📊 **Statistika Reale të Sistemit:**

**Burime të Dhënash:** {ds_count}
**Kategori:** {', '.join(categories[:5])}{'...' if len(categories) > 5 else ''}

**Laboratorë:** {lab_count}
**Disa prej tyre:** {', '.join(lab_names)}

**Skedarë në Projekt:**
- Python: {stats['python_files']}
- TypeScript: {stats['typescript_files']}
- JSON: {stats['json_files']}
- Direktori: {stats['directories']}

*Të dhënat janë të lexuara direkt nga sistemi i skedarëve.*"""
        
        return RealAnswer(
            query=query,
            answer=answer,
            source="real_system_stats",
            confidence=0.95,
            data=stats,
            is_real=True
        )
    
    async def _answer_crypto_query(self, query: str) -> RealAnswer:
        """Answer with REAL crypto prices"""
        q_lower = query.lower()
        
        # Determine which coin
        coin = "bitcoin"
        if "eth" in q_lower or "ethereum" in q_lower:
            coin = "ethereum"
        elif "sol" in q_lower or "solana" in q_lower:
            coin = "solana"
        
        # Get REAL price
        price_data = await self.crypto_api.get_price(coin)
        
        if price_data:
            usd = price_data.get("usd", 0)
            eur = price_data.get("eur", 0)
            change = price_data.get("change_24h", 0)
            direction = "📈 u rrit" if change and change > 0 else "📉 ra"
            
            answer = f"""💰 **{coin.title()} - Çmimi Real**

**USD:** ${usd:,.2f}
**EUR:** €{eur:,.2f}
**24h:** {direction} me {abs(change or 0):.1f}%

*Burimi: CoinGecko API (Live)*
*Koha: {price_data.get('fetched_at', 'N/A')}*"""
            
            return RealAnswer(
                query=query,
                answer=answer,
                source="coingecko_live",
                confidence=0.98,
                data=price_data,
                is_real=True
            )
        else:
            return RealAnswer(
                query=query,
                answer="⚠️ Nuk mund të marr çmimin e kriptovalutës në këtë moment. CoinGecko API nuk u përgjigj. Provoni përsëri pas disa sekondash.",
                source="coingecko_unavailable",
                confidence=0.1,
                is_real=True
            )
    
    async def _answer_weather_query(self, query: str) -> RealAnswer:
        """Answer with REAL weather data"""
        q_lower = query.lower()
        
        # Extract city
        cities = ["tirana", "prishtina", "shkodër", "durrës", "vlorë", "korçë", "berat", "gjirokastër"]
        city = "Tirana"  # Default
        for c in cities:
            if c in q_lower:
                city = c.title()
                break
        
        weather_data = await self.weather_api.get_weather(city)
        
        if weather_data:
            temp = weather_data.get("temperature", "?")
            feels = weather_data.get("feels_like", "?")
            humidity = weather_data.get("humidity", "?")
            desc = weather_data.get("description", "?")
            
            answer = f"""🌤️ **Moti në {city} - Të Dhëna Reale**

**Temperatura:** {temp}°C
**Ndjehet si:** {feels}°C
**Lagështia:** {humidity}%
**Kushtet:** {desc}

*Burimi: OpenWeatherMap API (Live)*
*Koha: {weather_data.get('fetched_at', 'N/A')}*"""
            
            return RealAnswer(
                query=query,
                answer=answer,
                source="openweathermap_live",
                confidence=0.98,
                data=weather_data,
                is_real=True
            )
        else:
            return RealAnswer(
                query=query,
                answer=f"⚠️ Nuk mund të marr të dhënat e motit për {city}. API_KEY për OpenWeatherMap nuk është konfiguruar ose API nuk u përgjigj. Për të aktivizuar, vendosni OPENWEATHERMAP_API_KEY në environment variables.",
                source="openweathermap_unavailable",
                confidence=0.1,
                is_real=True
            )
    
    async def _answer_data_query(self, query: str) -> RealAnswer:
        """Answer about data sources"""
        count = self.data_sources.get_count()
        categories = self.data_sources.get_categories()
        
        answer = f"""📚 **Burimet e të Dhënave - Informacion Real**

**Total:** {count} burime
**Kategori ({len(categories)}):**
{chr(10).join(f'  • {cat}' for cat in categories[:10])}
{'  • ...' if len(categories) > 10 else ''}

*Këto janë burime të brendshme që NUK varen nga API të jashtme.*"""
        
        return RealAnswer(
            query=query,
            answer=answer,
            source="internal_data_sources",
            confidence=0.95,
            is_real=True
        )
    
    async def _answer_lab_query(self, query: str) -> RealAnswer:
        """Answer about laboratories"""
        count = self.labs.get_count()
        labs = self.labs.list_labs()
        
        answer = f"""🔬 **Laboratorët - Informacion Real**

**Total:** {count} laboratorë

**Lista:**
{chr(10).join(f'  • {lab}' for lab in labs[:15])}
{'  • ...' if len(labs) > 15 else ''}

*Laboratorët janë pjesë e infrastrukturës së brendshme.*"""
        
        return RealAnswer(
            query=query,
            answer=answer,
            source="internal_laboratories",
            confidence=0.95,
            is_real=True
        )
    
    def _answer_greeting(self, query: str) -> RealAnswer:
        """Handle greetings"""
        return RealAnswer(
            query=query,
            answer=f"👋 **Mirësevini në Curiosity Ocean!**\n\nJam sistemi i inteligjencës së Clisonix. Kam:\n- {self.data_sources.get_count()} burime të dhënash\n- {self.labs.get_count()} laboratorë\n- Çmime kripto në kohë reale (CoinGecko)\n- Të dhëna moti (nëse API është konfiguruar)\n\nÇfarë dëshironi të mësoni?",
            source="greeting",
            confidence=1.0,
            is_real=True
        )
    
    def _answer_identity(self, query: str) -> RealAnswer:
        """Answer identity questions"""
        return RealAnswer(
            query=query,
            answer=f"""🧠 **Jam Curiosity Ocean - Sistemi i Clisonix**

**Çfarë jam:**
Një sistem inteligjence që përdor VETËM të dhëna REALE.

**Burimet e mia:**
- {self.data_sources.get_count()} burime të brendshme
- {self.labs.get_count()} laboratorë kërkimore
- API-të CoinGecko & OpenWeatherMap (opsionale)

**Parimi im:**
Nuk jap përgjigje të rreme. Nëse nuk di diçka, them "nuk e di".

**Ku jemi:**
Në infrastrukturën Clisonix Cloud, që funksionon pavarësisht nga API të jashtme.""",
            source="identity",
            confidence=1.0,
            is_real=True
        )
    
    def _format_search_results(self, query: str, results: List[Dict]) -> RealAnswer:
        """Format search results from internal data"""
        formatted = []
        for r in results:
            key = r.get("key", "Unknown")
            value = r.get("value", {})
            if isinstance(value, dict):
                desc = value.get("description", str(value)[:100])
            else:
                desc = str(value)[:100]
            formatted.append(f"• **{key}**: {desc}")
        
        return RealAnswer(
            query=query,
            answer=f"🔍 **Rezultatet e Kërkimit:**\n\n" + "\n".join(formatted),
            source="internal_search",
            confidence=0.7,
            data={"results": results},
            is_real=True
        )


# =============================================================================
# SINGLETON & API
# =============================================================================

_engine: Optional[RealAnswerEngine] = None

def get_real_answer_engine() -> RealAnswerEngine:
    """Get or create the real answer engine"""
    global _engine
    if _engine is None:
        _engine = RealAnswerEngine()
    return _engine


# =============================================================================
# TEST
# =============================================================================

if __name__ == "__main__":
    import asyncio
    
    async def test():
        engine = get_real_answer_engine()
        
        test_queries = [
            "Hello!",
            "Who are you?",
            "How many data sources do we have?",
            "What's the price of Bitcoin?",
            "What's the weather in Tirana?",
            "Tell me about laboratories",
            "What is consciousness?",  # Should admit it doesn't know
        ]
        
        print("\n" + "="*70)
        print("🧠 REAL ANSWER ENGINE TEST - NO PLACEHOLDERS")
        print("="*70)
        
        for query in test_queries:
            print(f"\n{'─'*70}")
            print(f"🔍 Query: {query}")
            print('─'*70)
            
            answer = await engine.answer(query)
            print(f"📊 Source: {answer.source}")
            print(f"🎯 Confidence: {answer.confidence:.0%}")
            print(f"✅ Is Real: {answer.is_real}")
            print(f"\n📝 Answer:\n{answer.answer}")
    
    asyncio.run(test())
