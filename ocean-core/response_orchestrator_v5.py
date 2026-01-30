"""
RESPONSE ORCHESTRATOR V5 - PRODUCTION BRAIN
============================================
Minimal, i shpejtë, 100% lokal, pa API të jashtme me pagesë.

Features:
- Fast-path conversational (RealAnswerEngine direkt)
- Multilingual hooks (pa Google/DeepL - 100% lokal)
- Timeout për ekspertët
- Përdor persona/labs/modules vetëm kur ka kuptim
- Zero external paid APIs
- MEGA LAYER ENGINE: ~2.8 MILIARD KOMBINIME
"""

import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from enum import Enum

# Import Mega Layer Engine
try:
    from mega_layer_engine import get_mega_layer_engine, MegaLayerEngine as MegaLayerEngineClass, LayerActivation
    MEGA_LAYERS_AVAILABLE = True
except ImportError:
    MEGA_LAYERS_AVAILABLE = False
    MegaLayerEngineClass = None
    LayerActivation = None

# Import Knowledge Seeds
try:
    from knowledge_seeds.core_knowledge import find_matching_seed, seed_stats, KnowledgeSeed
    KNOWLEDGE_SEEDS_AVAILABLE = True
except ImportError:
    KNOWLEDGE_SEEDS_AVAILABLE = False
    find_matching_seed = None
    seed_stats = None
    KnowledgeSeed = None

# Import Ollama Engine (Local AI)
try:
    from ollama_engine import get_ollama_engine, OllamaEngine
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    get_ollama_engine = None
    OllamaEngine = None

# Import Albanian Dictionary
try:
    from albanian_dictionary import (
        get_albanian_response, 
        detect_albanian, 
        ALL_ALBANIAN_WORDS,
        CLISONIX_TERMS,
        SENTENCE_PATTERNS
    )
    ALBANIAN_DICT_AVAILABLE = True
except ImportError:
    ALBANIAN_DICT_AVAILABLE = False
    get_albanian_response = None
    detect_albanian = None
    ALL_ALBANIAN_WORDS = {}

logger = logging.getLogger("orchestrator_v5")


# ─────────────────────────────────────────────────────────
#  ENUMS & DATA CLASSES
# ─────────────────────────────────────────────────────────

class QueryCategory(str, Enum):
    FINANCIAL = "financial"
    PHILOSOPHICAL = "philosophical"
    TECHNICAL = "technical"
    OPERATIONAL = "operational"
    SCIENTIFIC = "scientific"
    NARRATIVE = "narrative"
    PERSONAL = "personal"
    ANALYTICAL = "analytical"
    EXPLORATORY = "exploratory"
    BINARY = "binary"
    CONVERSATIONAL = "conversational"  # Për chat normal


@dataclass
class ExpertConsultation:
    expert_type: str
    expert_name: str
    expert_id: str
    query_sent: str
    response: str
    confidence: float
    relevance_score: float
    processing_time_ms: float
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass
class OrchestratedResponse:
    query: str
    query_category: QueryCategory
    understanding: Dict[str, Any]
    consulted_experts: List[ExpertConsultation]
    fused_answer: str
    sources_cited: List[str]
    confidence: float
    narrative_quality: float
    learning_record: Dict[str, Any]
    language: str = "sq"
    mega_layers: Optional[Dict[str, Any]] = None  # Mega Layer results
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ─────────────────────────────────────────────────────────
#  LANGUAGE LAYER - 100% LOKAL (PA API TË JASHTME)
# ─────────────────────────────────────────────────────────

class LocalLanguageLayer:
    """
    Multilingual Layer - 100% lokal, pa pagesë, pa cloud.
    
    Përdor langdetect për detektim dhe përgjigje lokale për çdo gjuhë.
    NUK përdor Google Translate, DeepL, apo çdo API të jashtme.
    """
    
    def __init__(self):
        self._langdetect_available = False
        try:
            from langdetect import detect as _detect
            self._detect = _detect
            self._langdetect_available = True
        except ImportError:
            self._detect = None
    
    def detect_language(self, text: str) -> str:
        """Detekto gjuhën - 100% lokal."""
        if not text or len(text.strip()) < 3:
            return "sq"  # Default: Shqip
        
        # Provo langdetect (lokal, pa pagesë)
        if self._langdetect_available and self._detect:
            try:
                return self._detect(text)
            except Exception:
                pass
        
        # Fallback: pattern matching lokal
        text_lower = text.lower()
        
        # Shqip
        sq_markers = ['ë', 'ç', 'sh', 'zh', 'gj', 'nj', 'xh', 'rr', 'th', 'dh',
                      'është', 'jam', 'je', 'jemi', 'janë', 'kam', 'kemi', 'kanë',
                      'përshëndetje', 'mirëdita', 'çfarë', 'pse', 'kush', 'ku', 'kur']
        if any(m in text_lower for m in sq_markers):
            return "sq"
        
        # Gjermanisht
        de_markers = ['ü', 'ö', 'ä', 'ß', 'ich', 'du', 'ist', 'sind', 'haben', 'werden',
                      'nicht', 'und', 'oder', 'aber', 'können', 'möchten', 'bitte']
        if any(m in text_lower for m in de_markers):
            return "de"
        
        # Frëngjisht
        fr_markers = ['é', 'è', 'ê', 'ç', 'je', 'tu', 'vous', 'nous', 'est', 'sont',
                      'avoir', 'être', 'pourquoi', 'comment', 'bonjour', 'merci']
        if any(m in text_lower for m in fr_markers):
            return "fr"
        
        # Spanjisht
        es_markers = ['ñ', '¿', '¡', 'soy', 'eres', 'es', 'somos', 'están', 'hola',
                      'gracias', 'por qué', 'cómo', 'cuándo', 'dónde', 'qué']
        if any(m in text_lower for m in es_markers):
            return "es"
        
        # Italisht
        it_markers = ['sono', 'sei', 'siamo', 'sono', 'ciao', 'grazie', 'perché',
                      'come', 'quando', 'dove', 'cosa', 'buongiorno', 'buonasera']
        if any(m in text_lower for m in it_markers):
            return "it"
        
        # Default: Anglisht
        return "en"
    
    async def to_internal(self, text: str, lang: str) -> str:
        """
        Konverto në gjuhën interne - NUK përkthejmë!
        
        Thjesht e ruajmë query-n origjinale dhe e procesojmë direkt.
        Sistemi ynë kupton shumë gjuhë pa përkthim.
        """
        return text  # Proceso direkt - pa përkthim!
    
    async def from_internal(self, text: str, lang: str) -> str:
        """
        Konverto nga gjuha interne - NUK përkthejmë!
        
        Përgjigjet gjenerohen direkt në gjuhën e kërkuar.
        """
        return text  # Kthu direkt - pa përkthim!
    
    def get_greeting(self, lang: str) -> str:
        """Përshëndetje në gjuhë të ndryshme."""
        greetings = {
            "sq": "Përshëndetje! Jam Curiosity Ocean. Si mund të të ndihmoj?",
            "en": "Hello! I'm Curiosity Ocean. How can I help you?",
            "de": "Hallo! Ich bin Curiosity Ocean. Wie kann ich Ihnen helfen?",
            "fr": "Bonjour! Je suis Curiosity Ocean. Comment puis-je vous aider?",
            "es": "¡Hola! Soy Curiosity Ocean. ¿Cómo puedo ayudarte?",
            "it": "Ciao! Sono Curiosity Ocean. Come posso aiutarti?",
        }
        return greetings.get(lang, greetings["en"])
    
    def get_fallback(self, lang: str, query: str) -> str:
        """Mesazh fallback në gjuhë të ndryshme."""
        fallbacks = {
            "sq": f"Faleminderit për pyetjen! Po e analizoj: \"{query}\"",
            "en": f"Thanks for your question! I'm analyzing: \"{query}\"",
            "de": f"Danke für Ihre Frage! Ich analysiere: \"{query}\"",
            "fr": f"Merci pour votre question! J'analyse: \"{query}\"",
            "es": f"¡Gracias por tu pregunta! Estoy analizando: \"{query}\"",
            "it": f"Grazie per la tua domanda! Sto analizzando: \"{query}\"",
        }
        return fallbacks.get(lang, fallbacks["en"])


# ─────────────────────────────────────────────────────────
#  EXPERT REGISTRY - MINIMAL, PRODUCTION-FRIENDLY
# ─────────────────────────────────────────────────────────

class ExpertRegistryV5:
    """
    Regjistri minimal i ekspertëve.
    Vetëm 1 persona + 1 lab + 1 modul për kategori.
    """
    
    def __init__(self):
        self.personas = {
            "smart_human": {"id": "ps_009", "domain": "personal"},
            "systems_architect": {"id": "ps_004", "domain": "technical"},
            "business_analyst": {"id": "ps_008", "domain": "financial"},
            "agi_analyst": {"id": "ps_007", "domain": "philosophical"},
            "scientist": {"id": "ps_010", "domain": "scientific"},
        }
        self.labs = {
            "Budapest_Data": {"id": "lab_data", "domain": "analytical"},
            "Vienna_Neuroscience": {"id": "lab_neuro", "domain": "scientific"},
            "Pristina_Finance": {"id": "lab_fin", "domain": "financial"},
            "Tirana_Tech": {"id": "lab_tech", "domain": "technical"},
        }
        self.modules = {
            "Albi": {"id": "mod_albi", "domain": "financial"},
            "Jona": {"id": "mod_jona", "domain": "philosophical"},
            "Alba": {"id": "mod_alba", "domain": "technical"},
        }

    def pick_minimal_experts(self, category: QueryCategory) -> Dict[str, List[Dict[str, Any]]]:
        """Zgjidh maksimum 1 persona, 1 lab, 1 modul për kategorinë."""
        res = {"personas": [], "labs": [], "modules": []}
        
        category_value = category.value if hasattr(category, 'value') else str(category)
        
        # Zgjidh 1 persona
        for name, meta in self.personas.items():
            if meta["domain"] == category_value:
                res["personas"].append({"name": name, **meta})
                break
        
        # Zgjidh 1 lab
        for name, meta in self.labs.items():
            if meta["domain"] == category_value:
                res["labs"].append({"name": name, **meta})
                break
        
        # Zgjidh 1 modul
        for name, meta in self.modules.items():
            if meta["domain"] == category_value:
                res["modules"].append({"name": name, **meta})
                break
        
        return res


# ─────────────────────────────────────────────────────────
#  QUERY UNDERSTANDING - LIGHTWEIGHT
# ─────────────────────────────────────────────────────────

class QueryUnderstandingV5:
    """Kuptimi i shpejtë i query-ve."""
    
    @staticmethod
    def categorize(query: str) -> QueryCategory:
        """Kategorizim i shpejtë bazuar në fjalë kyçe."""
        q = query.lower()
        
        # Përshëndetje/Chat normal
        greetings = ['hello', 'hi', 'hey', 'përshëndetje', 'mirëdita', 'çkemi', 
                     'tungjatjeta', 'si je', 'ciao', 'hola', 'bonjour', 'hallo']
        if any(g in q for g in greetings):
            return QueryCategory.CONVERSATIONAL
        
        # Financiare
        if any(w in q for w in ["invest", "money", "profit", "revenue", "market", 
                                 "stock", "biznes", "para", "fitim", "treg"]):
            return QueryCategory.FINANCIAL
        
        # Filozofike
        if any(w in q for w in ["agi", "conscious", "mind", "meaning", "philosophy",
                                 "ndërgjegje", "vetëdije", "kuptim", "filozofi"]):
            return QueryCategory.PHILOSOPHICAL
        
        # Teknike
        if any(w in q for w in ["api", "deploy", "server", "database", "kubernetes",
                                 "infrastrukturë", "kod", "code", "program"]):
            return QueryCategory.TECHNICAL
        
        # Operacionale
        if any(w in q for w in ["process", "workflow", "operacion", "prodhim", "cycle"]):
            return QueryCategory.OPERATIONAL
        
        # Shkencore
        if any(w in q for w in ["research", "experiment", "data", "study", 
                                 "teori", "shkencë", "science"]):
            return QueryCategory.SCIENTIFIC
        
        # Narrative
        if any(w in q for w in ["story", "tregim", "explain", "shpjego", "histori"]):
            return QueryCategory.NARRATIVE
        
        # Personale
        if any(w in q for w in ["help", "ndihmë", "ndihme", "mendim", "këshillë", "advice"]):
            return QueryCategory.PERSONAL
        
        # Analitike
        if any(w in q for w in ["analyze", "analizo", "statistikë", "trend", "pattern"]):
            return QueryCategory.ANALYTICAL
        
        # Binare
        if any(w in q for w in ["xor", "and", "or", "binary", "bits", "binar"]):
            return QueryCategory.BINARY
        
        return QueryCategory.EXPLORATORY
    
    @staticmethod
    def understand(query: str, context: Optional[List[str]] = None) -> Dict[str, Any]:
        """Kuptimi i plotë i query-t."""
        return {
            "query": query,
            "category": QueryUnderstandingV5.categorize(query),
            "context_len": len(context or []),
            "word_count": len(query.split()),
            "complexity": "simple" if len(query.split()) < 15 else "medium",
        }
    
    @staticmethod
    def needs_experts(category: QueryCategory) -> bool:
        """A duhen ekspertë për këtë kategori?"""
        # Për chat normal dhe eksplorues, NUK duhen ekspertë
        if category in {QueryCategory.CONVERSATIONAL, QueryCategory.EXPLORATORY}:
            return False
        
        # Për pyetje komplekse, mund të duhen
        return category in {
            QueryCategory.FINANCIAL, 
            QueryCategory.TECHNICAL, 
            QueryCategory.SCIENTIFIC,
            QueryCategory.ANALYTICAL
        }


# ─────────────────────────────────────────────────────────
#  RESPONSE FUSION - MINIMAL
# ─────────────────────────────────────────────────────────

class FusionEngineV5:
    """Bashko përgjigjet nga burime të ndryshme."""
    
    def fuse(self, base_answer: str, expert_responses: List[ExpertConsultation]) -> Tuple[str, float]:
        """Bashko përgjigjen bazë me inputet e ekspertëve."""
        if not expert_responses:
            return base_answer, 0.9
        
        # Filtro vetëm përgjigjet me konfidencë të lartë
        valid_extras = []
        for c in expert_responses:
            if c.confidence > 0.6 and c.relevance_score > 0.5:
                valid_extras.append(c.response)
        
        if not valid_extras:
            return base_answer, 0.9
        
        # Bashko (maksimum 2 shtesa)
        fused = base_answer + "\n\n📊 **Shtesë nga sisteme të tjera:**\n"
        for e in valid_extras[:2]:
            fused += f"• {e.strip()}\n"
        
        quality = min(1.0, 0.8 + 0.1 * min(len(valid_extras), 2))
        return fused, quality


# ─────────────────────────────────────────────────────────
#  MAIN ORCHESTRATOR V5
# ─────────────────────────────────────────────────────────

class ResponseOrchestratorV5:
    """
    Curiosity Ocean v5 – Production Brain
    
    100% LOKAL - PA API TË JASHTME ME PAGESË
    
    Features:
    - Fast conversational path (RealAnswerEngine)
    - Minimal experts (1 persona, 1 lab, 1 module) - vetëm kur duhen
    - Multilingual hooks (pa Google/DeepL)
    - Timeouts për ekspertët
    - Zero external paid APIs
    - MEGA LAYER ENGINE: ~2.8 MILIARD KOMBINIME UNIKE
    """

    def __init__(
        self,
        real_answer_engine=None,
        language_layer: LocalLanguageLayer = None,
        expert_registry: ExpertRegistryV5 = None,
        fusion_engine: FusionEngineV5 = None,
        expert_timeout_ms: int = 500,
    ):
        self.real_answer_engine = real_answer_engine
        self.language_layer = language_layer or LocalLanguageLayer()
        self.registry = expert_registry or ExpertRegistryV5()
        self.fusion = fusion_engine or FusionEngineV5()
        self.expert_timeout_ms = expert_timeout_ms
        self.learning_history: List[Dict[str, Any]] = []
        
        # Initialize Mega Layer Engine
        self.mega_layer_engine: Optional[Any] = None
        if MEGA_LAYERS_AVAILABLE:
            try:
                self.mega_layer_engine = get_mega_layer_engine()
                logger.info(f"✅ MegaLayerEngine initialized - {self.mega_layer_engine.total_combinations:,} kombinime")
            except Exception as e:
                logger.warning(f"⚠️ MegaLayerEngine not available: {e}")
        
        # Initialize Ollama Engine (Local AI)
        self.ollama_engine: Optional[Any] = None
        if OLLAMA_AVAILABLE:
            try:
                self.ollama_engine = get_ollama_engine("clisonix-ocean:v2")
                logger.info("🦙 OllamaEngine initialized (clisonix-ocean:v2)")
            except Exception as e:
                logger.warning(f"⚠️ OllamaEngine not available: {e}")
        
        # Lazy load RealAnswerEngine nëse nuk u dha
        if self.real_answer_engine is None:
            self._lazy_load_engine()
    
    def _lazy_load_engine(self):
        """Ngarko RealAnswerEngine lazy."""
        try:
            from real_answer_engine import get_real_answer_engine
            self.real_answer_engine = get_real_answer_engine()
            # Sigurohu që është në mode conversational
            self.real_answer_engine.RESPONSE_MODE = "conversational"
            logger.info("✅ RealAnswerEngine loaded (conversational mode)")
        except ImportError as e:
            logger.warning(f"⚠️ RealAnswerEngine not available: {e}")
            self.real_answer_engine = None

    async def orchestrate(
        self,
        query: str,
        conversation_context: Optional[List[str]] = None,
        mode: str = "conversational",
    ) -> OrchestratedResponse:
        """
        Orkestro përgjigjen.
        
        mode:
          - "conversational": fast path - RealAnswerEngine direkt (DEFAULT)
          - "deep": përdor edhe ekspertë aktivikisht
        """
        conversation_context = conversation_context or []
        
        # 1) Language detection (100% lokal)
        lang = self.language_layer.detect_language(query)
        
        # 2) Query understanding
        understanding = QueryUnderstandingV5.understand(query, conversation_context)
        category: QueryCategory = understanding["category"]
        
        # 3) FAST PATH - RealAnswerEngine direkt
        base_text = ""
        sources = []
        base_confidence = 0.9
        used_knowledge_seed = False
        used_ollama = False
        
        # 3.1) OLLAMA FIRST - Local AI gets priority for real answers!
        if self.ollama_engine:
            try:
                ollama_available = await self.ollama_engine.is_available()
                if ollama_available:
                    ollama_response = await self.ollama_engine.generate(query)
                    if ollama_response.content and not ollama_response.content.startswith("⚠️"):
                        base_text = ollama_response.content
                        sources = ["ollama:clisonix-ocean:v2"]
                        base_confidence = 0.92
                        used_ollama = True
                        logger.info(f"🦙 Ollama generated response ({ollama_response.total_duration_ms:.0f}ms)")
            except Exception as e:
                logger.warning(f"Ollama error: {e}")
        
        # 3.2) Knowledge Seeds FALLBACK (if Ollama fails or unavailable)
        if not used_ollama and KNOWLEDGE_SEEDS_AVAILABLE and find_matching_seed:
            seed = find_matching_seed(query)
            if seed:
                base_text = seed.answer_template.strip()
                sources = [f"knowledge_seed:{seed.category}"]
                base_confidence = seed.confidence
                used_knowledge_seed = True
                logger.info(f"📚 Knowledge Seed matched: {seed.category}")
        
        # 3.3) Albanian Dictionary për pyetje shqip (if nothing else matched)
        used_albanian_dict = False
        if not used_ollama and not used_knowledge_seed and ALBANIAN_DICT_AVAILABLE and lang == "sq":
            try:
                albanian_response = get_albanian_response(query)
                if albanian_response:
                    base_text = albanian_response
                    sources = ["albanian_dictionary"]
                    base_confidence = 0.92
                    used_albanian_dict = True
                    logger.info("🇦🇱 Albanian Dictionary matched")
            except Exception as e:
                logger.warning(f"Albanian Dictionary error: {e}")
        
        # 3.4) Fallback to RealAnswerEngine if nothing else worked
        if not used_ollama and not used_knowledge_seed and not used_albanian_dict and self.real_answer_engine:
            try:
                base_result = await self.real_answer_engine.answer(query)
                base_text = base_result.answer
                sources = [base_result.source]
                base_confidence = base_result.confidence
            except Exception as e:
                logger.error(f"RealAnswerEngine error: {e}")
                base_text = self.language_layer.get_fallback(lang, query)
                sources = ["fallback"]
        elif not used_knowledge_seed and not used_albanian_dict and not used_ollama:
            base_text = self.language_layer.get_fallback(lang, query)
            sources = ["no_engine"]
        
        # 4) Ekspertë - VETËM kur ka sens dhe mode == "deep"
        consulted: List[ExpertConsultation] = []
        
        if mode == "deep" and QueryUnderstandingV5.needs_experts(category):
            experts = self.registry.pick_minimal_experts(category)
            consulted = await self._consult_experts_parallel(query, experts)
        
        # 5) Fusion (vetëm nëse kemi rezultate nga ekspertë)
        fused_answer, quality = self.fusion.fuse(base_text, consulted)
        
        # 5.5) MEGA LAYER PROCESSING - DISABLED by default (too complex for users)
        # Mega layers add "science theater" complexity without practical value
        # Enable only for specific deep analysis requests
        mega_layer_results = None
        layer_summary = ""
        # DISABLED: This adds confusion, not value
        # if self.mega_layer_engine:
        #     try:
        #         activation, mega_results = self.mega_layer_engine.process_query(query)
        #         mega_layer_results = mega_results
        #         layer_summary = self.mega_layer_engine.get_layer_summary(activation, mega_results)
        #         fused_answer = fused_answer + layer_summary
        #         sources.append("mega_layers_engine")
        #     except Exception as e:
        #         logger.warning(f"MegaLayerEngine processing error: {e}")
        
        # 6) Ndërto përgjigjen finale
        response = OrchestratedResponse(
            query=query,
            query_category=category,
            understanding=understanding,
            consulted_experts=consulted,
            fused_answer=fused_answer,
            sources_cited=sources,
            confidence=base_confidence,
            narrative_quality=quality,
            language=lang,
            mega_layers=mega_layer_results,
            learning_record={
                "mode": mode, 
                "lang": lang,
                "experts_used": len(consulted),
                "mega_layers_active": mega_layer_results is not None,
                "combinations_used": mega_layer_results.get("combinations_used", 0) if mega_layer_results else 0,
            },
        )
        
        # 7) Learning history
        self.learning_history.append({
            "query": query,
            "category": category.value,
            "mode": mode,
            "lang": lang,
            "timestamp": response.timestamp,
        })
        
        return response

    async def _consult_experts_parallel(
        self,
        query: str,
        experts: Dict[str, List[Dict[str, Any]]],
    ) -> List[ExpertConsultation]:
        """Konsulto ekspertët në paralel me timeout."""
        tasks = []
        
        for p in experts.get("personas", []):
            tasks.append(self._call_expert("persona", p["name"], p["id"], query))
        
        for l in experts.get("labs", []):
            tasks.append(self._call_expert("lab", l["name"], l["id"], query))
        
        for m in experts.get("modules", []):
            tasks.append(self._call_expert("module", m["name"], m["id"], query))
        
        if not tasks:
            return []
        
        # Timeout
        timeout = self.expert_timeout_ms / 1000.0
        try:
            done, pending = await asyncio.wait(tasks, timeout=timeout)
            
            # Anulo tasks që nuk përfunduan
            for p in pending:
                p.cancel()
            
            # Mblidh rezultatet
            results: List[ExpertConsultation] = []
            for d in done:
                try:
                    c = d.result()
                    if c is not None:
                        results.append(c)
                except Exception as e:
                    logger.warning(f"Expert call failed: {e}")
            
            return results
        except Exception as e:
            logger.error(f"Expert consultation error: {e}")
            return []

    async def _call_expert(
        self,
        expert_type: str,
        name: str,
        expert_id: str,
        query: str,
    ) -> Optional[ExpertConsultation]:
        """
        Thirr një ekspert.
        
        TODO: Lidhe me persona/lab/module të vërtetë.
        Për tani: stub bazë.
        """
        start = datetime.now(timezone.utc)
        try:
            # Simulim i shkurtër (do të zëvendësohet me lidhje reale)
            await asyncio.sleep(0.02)
            
            # Stub response - zëvendëso me logjikë reale
            response = f"[{expert_type}:{name}] Në zhvillim - struktura gati për lidhje."
            confidence = 0.5
            relevance = 0.4
            
            elapsed_ms = (datetime.now(timezone.utc) - start).total_seconds() * 1000.0
            
            return ExpertConsultation(
                expert_type=expert_type,
                expert_name=name,
                expert_id=expert_id,
                query_sent=query,
                response=response,
                confidence=confidence,
                relevance_score=relevance,
                processing_time_ms=elapsed_ms,
            )
        except Exception as e:
            logger.warning(f"Error calling expert {expert_type}:{name}: {e}")
            return None
    
    async def quick_answer(self, query: str) -> str:
        """
        Përgjigje e shpejtë - pa ekspertë, pa overhead.
        Ideal për chat normal.
        """
        if self.real_answer_engine:
            try:
                result = await self.real_answer_engine.answer(query)
                return result.answer
            except Exception as e:
                logger.error(f"Quick answer error: {e}")
        
        lang = self.language_layer.detect_language(query)
        return self.language_layer.get_fallback(lang, query)
    
    def get_stats(self) -> Dict[str, Any]:
        """Statistika të orchestrator-it."""
        return {
            "engine_active": self.real_answer_engine is not None,
            "learning_history_count": len(self.learning_history),
            "expert_timeout_ms": self.expert_timeout_ms,
            "version": "v5_production",
        }


# ─────────────────────────────────────────────────────────
#  SINGLETON & FACTORY
# ─────────────────────────────────────────────────────────

_orchestrator: Optional[ResponseOrchestratorV5] = None


def get_orchestrator_v5() -> ResponseOrchestratorV5:
    """Merr instancën singleton të Orchestrator v5."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = ResponseOrchestratorV5()
    return _orchestrator


# ─────────────────────────────────────────────────────────
#  TEST
# ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO)
    
    async def test():
        print("\n" + "="*60)
        print("🧪 ORCHESTRATOR V5 TEST - PRODUCTION BRAIN")
        print("="*60)
        
        orch = get_orchestrator_v5()
        
        tests = [
            "Përshëndetje!",
            "Hello, how are you?",
            "Sa bëjnë 15 + 27?",
            "What is the date today?",
            "Çfarë është Curiosity Ocean?",
            "Hola, ¿cómo estás?",
            "Bonjour, comment ça va?",
        ]
        
        for query in tests:
            print(f"\n📝 Query: {query}")
            response = await orch.orchestrate(query)
            print(f"🌐 Language: {response.language}")
            print(f"📊 Category: {response.query_category.value}")
            print(f"📄 Answer: {response.fused_answer[:200]}...")
            print(f"📈 Confidence: {response.confidence:.0%}")
        
        print("\n" + "="*60)
        print("📊 Stats:", orch.get_stats())
    
    asyncio.run(test())
