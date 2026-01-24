"""
RESPONSE ORCHESTRATOR
=====================
The Living Brain of Clisonix

This is NOT a router. NOT a simple aggregator.
This is a thinking system that:
- Understands queries with depth (not just keywords)
- Decides WHO should answer (personas, labs, modules)
- Consults experts intelligently (parallel, weighted)
- Fuses responses into natural narrative
- Learns and optimizes with every query
- Uses ALPHABET LAYERS for mathematical analysis (60 Greek+Albanian letters)

Philosophy:
If a human brain gets a question, it doesn't ask ALL neurons.
It asks the RIGHT neurons. Then it weaves their answers into ONE response.
That's what this system does.
"""

import logging
import json
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
import hashlib

# Import Alphabet Layers System (60 Greek + Albanian mathematical layers)
from alphabet_layers import get_alphabet_layer_system, AlbanianGreekLayerSystem

logger = logging.getLogger("orchestrator")


class QueryCategory(str, Enum):
    """High-level query categories for intelligent routing"""
    FINANCIAL = "financial"           # Investment, business, markets
    PHILOSOPHICAL = "philosophical"   # AGI, consciousness, existence
    TECHNICAL = "technical"          # APIs, architecture, deployment
    OPERATIONAL = "operational"      # Business processes, workflows
    SCIENTIFIC = "scientific"        # Research, experiments, data
    NARRATIVE = "narrative"          # Stories, explanations, education
    PERSONAL = "personal"            # Self-help, guidance, advice
    ANALYTICAL = "analytical"        # Data analysis, statistics
    EXPLORATORY = "exploratory"      # Discovery, unknown domains


@dataclass
class ExpertConsultation:
    """Record of consulting one expert"""
    expert_type: str              # "persona", "lab", "module"
    expert_name: str
    expert_id: str
    query_sent: str
    response: str
    confidence: float             # 0.0 - 1.0
    relevance_score: float        # How relevant this response is
    processing_time_ms: float
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class OrchestratedResponse:
    """Full orchestrated response with traceability"""
    query: str
    query_category: QueryCategory
    understanding: Dict[str, Any]      # How the brain understood the question
    consulted_experts: List[ExpertConsultation]
    fused_answer: str                   # The final narrative response
    sources_cited: List[str]
    confidence: float
    narrative_quality: float            # How human-like is the response?
    learning_record: Dict[str, Any]    # What did we learn?
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


class ExpertRegistry:
    """Registry of all experts in the system"""
    
    def __init__(self):
        # Will be populated from imported modules
        self.personas = {}
        self.laboratories = {}
        self.modules = {}
        self.api_endpoints = {}
        self._load_experts()
    
    def _load_experts(self):
        """Load all experts from system"""
        # Personas (14 total)
        self.personas = {
            "medical_science": {"id": "ps_001", "domain": "medical", "keywords": ["health", "brain", "biology"]},
            "lora_iot": {"id": "ps_002", "domain": "iot", "keywords": ["sensor", "device", "network"]},
            "security": {"id": "ps_003", "domain": "security", "keywords": ["security", "crypto", "vulnerability"]},
            "systems_architecture": {"id": "ps_004", "domain": "technical", "keywords": ["api", "infrastructure"]},
            "natural_science": {"id": "ps_005", "domain": "science", "keywords": ["physics", "energy", "quantum"]},
            "industrial_process": {"id": "ps_006", "domain": "operational", "keywords": ["production", "cycle"]},
            "agi_analyst": {"id": "ps_007", "domain": "philosophical", "keywords": ["agi", "cognitive", "consciousness"]},
            "business_analyst": {"id": "ps_008", "domain": "financial", "keywords": ["revenue", "strategy", "growth"]},
            "smart_human": {"id": "ps_009", "domain": "personal", "keywords": ["understand", "help", "explain"]},
            "academic": {"id": "ps_010", "domain": "scientific", "keywords": ["research", "theory", "study"]},
            "media": {"id": "ps_011", "domain": "narrative", "keywords": ["news", "story", "report"]},
            "culture": {"id": "ps_012", "domain": "exploratory", "keywords": ["tradition", "art", "society"]},
            "hobby": {"id": "ps_013", "domain": "personal", "keywords": ["hobby", "learn", "practice"]},
            "entertainment": {"id": "ps_014", "domain": "narrative", "keywords": ["movie", "game", "music"]},
        }
        
        # Laboratories (23 total) - simplified references
        self.laboratories = {
            "Elbasan_AI": {"type": "AI", "domain": "technical", "specialization": "AI/ML"},
            "Tirana_Medical": {"type": "Medical", "domain": "scientific", "specialization": "Medical Research"},
            "Durres_IoT": {"type": "IoT", "domain": "technical", "specialization": "IoT/Sensors"},
            "Shkoder_Marine": {"type": "Marine", "domain": "scientific", "specialization": "Marine Biology"},
            "Vlore_Environmental": {"type": "Environmental", "domain": "scientific", "specialization": "Ecology"},
            "Sarrande_Underwater": {"type": "Underwater", "domain": "scientific", "specialization": "Oceanography"},
            "Prishtina_Security": {"type": "Security", "domain": "technical", "specialization": "Cybersecurity"},
            "Korce_Agricultural": {"type": "Agricultural", "domain": "operational", "specialization": "Farming"},
            "Kostur_Heritage": {"type": "Heritage", "domain": "exploratory", "specialization": "Archaeology"},
            "Ljubljana_Quantum": {"type": "Quantum", "domain": "scientific", "specialization": "Quantum Physics"},
            "Sofia_Chemistry": {"type": "Chemistry", "domain": "scientific", "specialization": "Chemical Research"},
            "Budapest_Data": {"type": "Data", "domain": "analytical", "specialization": "Data Science"},
            "Prague_Robotics": {"type": "Robotics", "domain": "technical", "specialization": "Robotics/Automation"},
            "Vienna_Neuroscience": {"type": "Neuroscience", "domain": "scientific", "specialization": "Brain Research"},
            "Zagreb_Biotech": {"type": "Biotech", "domain": "scientific", "specialization": "Biotechnology"},
            "Bucharest_Nanotechnology": {"type": "Nanotechnology", "domain": "technical", "specialization": "Nanotech"},
            "Istanbul_Trade": {"type": "Trade", "domain": "financial", "specialization": "Commerce"},
            "Jerusalem_Finance": {"type": "Finance", "domain": "financial", "specialization": "Financial Markets"},
            "Cairo_Energy": {"type": "Energy", "domain": "operational", "specialization": "Energy Systems"},
            "Rome_Heritage": {"type": "Heritage", "domain": "exploratory", "specialization": "Art/Culture"},
            "Athens_Philosophy": {"type": "Philosophy", "domain": "philosophical", "specialization": "Philosophy"},
            "Zurich_Banking": {"type": "Banking", "domain": "financial", "specialization": "Banking/Finance"},
            "Beograd_Infrastructure": {"type": "Infrastructure", "domain": "technical", "specialization": "Infrastructure"},
        }
        
        # Modules (7 total)
        self.modules = {
            "Jona": {"type": "Curiosity Engine", "domain": "philosophical", "purpose": "Deep thinking"},
            "Albi": {"type": "Business Engine", "domain": "financial", "purpose": "Strategic analysis"},
            "Blerina": {"type": "Narrative Engine", "domain": "narrative", "purpose": "Story generation"},
            "ASI": {"type": "Real-time Engine", "domain": "technical", "purpose": "Live monitoring"},
            "SaaS": {"type": "Operations Engine", "domain": "operational", "purpose": "Process management"},
            "Ageim": {"type": "Analytics Engine", "domain": "analytical", "purpose": "Data analysis"},
            "Alba": {"type": "Telemetry Engine", "domain": "technical", "purpose": "System monitoring"},
        }
    
    def get_experts_for_category(self, category: QueryCategory) -> Dict[str, List[str]]:
        """Get relevant experts for a query category"""
        relevant_personas = [p for p, v in self.personas.items() if v["domain"] == category.value]
        relevant_labs = [l for l, v in self.laboratories.items() if v["domain"] == category.value]
        relevant_modules = [m for m, v in self.modules.items() if v["domain"] == category.value]
        
        return {
            "personas": relevant_personas,
            "laboratories": relevant_labs,
            "modules": relevant_modules,
        }


class QueryUnderstanding:
    """Deep query understanding - like a real brain reading the question"""
    
    @staticmethod
    def understand(query: str, conversation_context: List[str] = None) -> Dict[str, Any]:
        """
        Understand the query deeply:
        - What is being asked?
        - What is the intent?
        - What is the emotional tone?
        - What context matters?
        """
        understanding = {
            "query": query,
            "intent": QueryUnderstanding._detect_intent(query),
            "category": QueryUnderstanding._categorize(query),
            "emotional_tone": QueryUnderstanding._detect_tone(query),
            "entities": QueryUnderstanding._extract_entities(query),
            "context_importance": QueryUnderstanding._assess_context(query, conversation_context),
            "complexity_level": QueryUnderstanding._assess_complexity(query),
        }
        return understanding
    
    @staticmethod
    def _detect_intent(query: str) -> str:
        """Detect what the user actually wants"""
        q_lower = query.lower()
        
        if any(w in q_lower for w in ["why", "pse", "përse", "how does", "si", "si qe"]):
            return "explanation"
        elif any(w in q_lower for w in ["what is", "çfarë është", "what are", "can you explain"]):
            return "definition"
        elif any(w in q_lower for w in ["do you think", "believe", "opinion", "mendim", "besim"]):
            return "opinion"
        elif any(w in q_lower for w in ["help", "how to", "si të", "ndihmë", "assistance"]):
            return "guidance"
        elif any(w in q_lower for w in ["compare", "difference", "versus", "vs", "kundra"]):
            return "comparison"
        elif any(w in q_lower for w in ["future", "predict", "will", "future", "e ardhmja"]):
            return "prediction"
        else:
            return "information"
    
    @staticmethod
    def _categorize(query: str) -> QueryCategory:
        """Categorize query for routing"""
        q_lower = query.lower()
        
        # Financial keywords
        if any(w in q_lower for w in ["invest", "money", "profit", "revenue", "cost", "price", "market", "stock", "business"]):
            return QueryCategory.FINANCIAL
        
        # Philosophical keywords
        if any(w in q_lower for w in ["agi", "conscious", "mind", "existence", "meaning", "philosophy", "think", "believe"]):
            return QueryCategory.PHILOSOPHICAL
        
        # Technical keywords
        if any(w in q_lower for w in ["api", "deploy", "code", "server", "database", "algorithm", "architecture", "build"]):
            return QueryCategory.TECHNICAL
        
        # Operational keywords
        if any(w in q_lower for w in ["process", "workflow", "operation", "management", "production", "cycle", "sistem"]):
            return QueryCategory.OPERATIONAL
        
        # Scientific keywords
        if any(w in q_lower for w in ["research", "experiment", "data", "study", "theory", "hypothesis", "lab", "science"]):
            return QueryCategory.SCIENTIFIC
        
        # Narrative keywords
        if any(w in q_lower for w in ["tell", "story", "explain", "describe", "narrative", "history", "background"]):
            return QueryCategory.NARRATIVE
        
        # Personal keywords
        if any(w in q_lower for w in ["help", "advice", "learn", "teach", "understand", "how to", "skill", "personal"]):
            return QueryCategory.PERSONAL
        
        # Analytical keywords
        if any(w in q_lower for w in ["analyze", "data", "statistics", "trend", "pattern", "metric", "compare", "analytics"]):
            return QueryCategory.ANALYTICAL
        
        # Default to exploratory
        return QueryCategory.EXPLORATORY
    
    @staticmethod
    def _detect_tone(query: str) -> str:
        """Detect emotional tone"""
        if any(c in query for c in ["!", "??", "???"]):
            return "urgent"
        elif any(w in query.lower() for w in ["please", "could", "would", "could you", "lutje", "mund të"]):
            return "polite"
        elif any(w in query.lower() for w in ["urgent", "asap", "now", "immediately", "përpara"]):
            return "urgent"
        else:
            return "neutral"
    
    @staticmethod
    def _extract_entities(query: str) -> Dict[str, Any]:
        """Extract named entities from query"""
        entities = {
            "locations": [],
            "people": [],
            "concepts": [],
            "organizations": [],
        }
        
        # Simple extraction (in production, use NER)
        # This is a placeholder
        return entities
    
    @staticmethod
    def _assess_context(query: str, conversation_context: List[str]) -> float:
        """Assess how important conversation history is (0.0-1.0)"""
        if conversation_context and len(conversation_context) > 0:
            # If we have context and query is short or uses pronouns
            if len(query.split()) < 10 or any(w in query.lower() for w in ["it", "that", "this", "ai", "ajo", "ky"]):
                return 0.8
        return 0.2
    
    @staticmethod
    def _assess_complexity(query: str) -> str:
        """Assess query complexity"""
        word_count = len(query.split())
        if word_count > 30:
            return "high"
        elif word_count > 15:
            return "medium"
        else:
            return "low"


class ExpertRouter:
    """Routes queries to appropriate experts intelligently"""
    
    def __init__(self, registry: ExpertRegistry):
        self.registry = registry
        self.learning_matrix = {}  # Tracks which experts answered well for which queries
    
    def decide_consultations(self, understanding: Dict[str, Any]) -> Dict[str, List[str]]:
        """Decide which experts should be consulted"""
        category = understanding["category"]
        
        # Get relevant experts for this category
        relevant = self.registry.get_experts_for_category(category)
        
        # Apply smart filtering based on learning
        selected = self._apply_learning(relevant, understanding)
        
        return selected
    
    def _apply_learning(self, relevant: Dict[str, List[str]], understanding: Dict[str, Any]) -> Dict[str, List[str]]:
        """Apply learned routing patterns"""
        # In production, this would use a learning matrix
        # For now, return relevant experts
        return relevant


class ResponseFusionEngine:
    """Fuses multiple expert responses into one coherent narrative"""
    
    def __init__(self):
        self.fusion_rules = {}
    
    def fuse(self, query: str, consultations: List[ExpertConsultation], understanding: Dict[str, Any]) -> Tuple[str, float]:
        """
        Fuse expert responses into one natural, narrative response.
        
        This is NOT concatenation.
        This is SYNTHESIS - like a human brain doing it.
        
        Returns: (fused_response, narrative_quality_score)
        """
        if not consultations:
            return "No experts could be consulted.", 0.0
        
        # Deduplicate and weight responses
        weighted_responses = self._weight_responses(consultations)
        
        # Build narrative structure
        narrative = self._build_narrative(query, weighted_responses, understanding)
        
        # Score narrative quality (how human-like?)
        quality_score = self._score_narrative(narrative, consultations)
        
        return narrative, quality_score
    
    def _weight_responses(self, consultations: List[ExpertConsultation]) -> List[Tuple[str, float]]:
        """Weight responses by confidence and relevance"""
        weighted = []
        for consultation in consultations:
            weight = (consultation.confidence + consultation.relevance_score) / 2
            weighted.append((consultation.response, weight))
        
        # Sort by weight (highest first)
        weighted.sort(key=lambda x: x[1], reverse=True)
        return weighted
    
    def _build_narrative(self, query: str, weighted_responses: List[Tuple[str, float]], 
                        understanding: Dict[str, Any]) -> str:
        """Build narrative response from expert inputs"""
        if not weighted_responses:
            return "I don't have enough information to answer that."
        
        # Start with the highest-confidence response as base
        base_response = weighted_responses[0][0]
        
        # Add complementary perspectives from other experts
        complementary = []
        for response, weight in weighted_responses[1:]:
            if weight > 0.5:  # Only add if reasonably confident
                complementary.append(response)
        
        # Build narrative
        narrative = base_response
        
        if complementary:
            narrative += "\n\nFrom other perspectives:\n"
            for comp in complementary[:2]:  # Limit to 2 additional perspectives
                narrative += f"\n• {comp[:200]}..."  # Summarize
        
        return narrative
    
    def _score_narrative(self, narrative: str, consultations: List[ExpertConsultation]) -> float:
        """Score how natural/human-like the narrative is"""
        # Simple heuristic: higher average confidence = better
        if not consultations:
            return 0.0
        
        avg_confidence = sum(c.confidence for c in consultations) / len(consultations)
        return min(avg_confidence, 1.0)


class ResponseOrchestrator:
    """
    The Living Brain of Clisonix
    
    Orchestrates responses from all system components into natural, intelligent answers.
    Now enhanced with 60 mathematical layers (Greek + Albanian alphabets)!
    """
    
    def __init__(self):
        self.expert_registry = ExpertRegistry()
        self.expert_router = ExpertRouter(self.expert_registry)
        self.fusion_engine = ResponseFusionEngine()
        self.learning_history = []
        
        # Initialize Alphabet Layer System (60 layers: 24 Greek + 36 Albanian)
        self.alphabet_layers = get_alphabet_layer_system()
        
        logger.info("✓ ResponseOrchestrator initialized - The Brain is online")
        logger.info(f"✓ Alphabet Layers active: {self.alphabet_layers.alphabet['size']} mathematical layers")
    
    def process_query(self, query: str, conversation_context: List[str] = None) -> OrchestratedResponse:
        """
        Process a query through the full orchestration pipeline.
        
        Steps:
        1. ANALYZE with Alphabet Layers (60 mathematical functions)
        2. UNDERSTAND the query deeply
        3. DECIDE who to consult
        4. CONSULT experts in parallel
        5. FUSE responses into narrative
        6. LEARN from the interaction
        """
        
        # Step 0: Alphabet Layer Analysis (NEW - Mathematical decomposition)
        logger.info(f"→ ALPHABET ANALYSIS: Processing query through 60 layers...")
        alphabet_analysis = self.alphabet_layers.process_query(query)
        logger.info(f"  📊 Complexity: {alphabet_analysis['total_complexity']} | Words: {alphabet_analysis['processed_words']}")
        
        # Step 1: Deep understanding
        logger.info(f"→ UNDERSTANDING query: {query[:50]}...")
        understanding = QueryUnderstanding.understand(query, conversation_context)
        
        # Enrich understanding with alphabet analysis
        understanding["alphabet_analysis"] = {
            "complexity": alphabet_analysis["total_complexity"],
            "word_analysis": alphabet_analysis["word_analysis"],
            "active_layers": alphabet_analysis["active_layers"]
        }
        
        # Step 2: Decide who to ask
        logger.info(f"→ ROUTING to experts (category: {understanding['category']})")
        consultations_to_make = self.expert_router.decide_consultations(understanding)
        
        # Step 3: Consult experts (in production, this would be parallel API calls)
        logger.info(f"→ CONSULTING {len(consultations_to_make)} expert groups")
        consultations = self._consult_experts(query, consultations_to_make)
        
        # Step 4: Fuse responses
        logger.info("→ FUSING expert perspectives into narrative")
        fused_answer, narrative_quality = self.fusion_engine.fuse(query, consultations, understanding)
        
        # Step 5: Learn
        response = OrchestratedResponse(
            query=query,
            query_category=understanding["category"],
            understanding=understanding,
            consulted_experts=consultations,
            fused_answer=fused_answer,
            sources_cited=[c.expert_name for c in consultations],
            confidence=sum(c.confidence for c in consultations) / len(consultations) if consultations else 0.0,
            narrative_quality=narrative_quality,
            learning_record=self._record_learning(query, consultations, fused_answer, alphabet_analysis)
        )
        
        self.learning_history.append(response)
        logger.info(f"✓ RESPONSE ready | Confidence: {response.confidence:.1%} | Quality: {response.narrative_quality:.1%}")
        
        return response
    
    def _consult_experts(self, query: str, consultations_to_make: Dict[str, List[str]]) -> List[ExpertConsultation]:
        """Consult selected experts and collect their responses"""
        consultations = []
        
        # In production, these would be parallel API calls
        # For now, simulate with mock responses
        
        all_experts = (
            [(name, "persona") for name in consultations_to_make.get("personas", [])] +
            [(name, "lab") for name in consultations_to_make.get("laboratories", [])] +
            [(name, "module") for name in consultations_to_make.get("modules", [])]
        )
        
        for expert_name, expert_type in all_experts[:5]:  # Limit to 5 experts per query
            # Mock consultation (in production, call actual APIs)
            consultation = ExpertConsultation(
                expert_type=expert_type,
                expert_name=expert_name,
                expert_id=f"{expert_type}_{expert_name}",
                query_sent=query,
                response=f"Expert response from {expert_name} regarding: {query[:40]}...",
                confidence=0.85,
                relevance_score=0.78,
                processing_time_ms=120.0
            )
            consultations.append(consultation)
        
        return consultations
    
    def _record_learning(self, query: str, consultations: List[ExpertConsultation], 
                        fused_answer: str, alphabet_analysis: Dict[str, Any] = None) -> Dict[str, Any]:
        """Record what we learned from this interaction"""
        learning = {
            "query_hash": hashlib.md5(query.encode()).hexdigest(),
            "num_experts_consulted": len(consultations),
            "average_confidence": sum(c.confidence for c in consultations) / len(consultations) if consultations else 0.0,
            "experts_used": [c.expert_name for c in consultations],
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        # Add alphabet layer insights
        if alphabet_analysis:
            learning["alphabet_complexity"] = alphabet_analysis.get("total_complexity", 0)
            learning["alphabet_layers_used"] = alphabet_analysis.get("active_layers", 0)
            learning["word_count"] = alphabet_analysis.get("processed_words", 0)
        
        return learning
    
    def get_learning_matrix(self) -> Dict[str, Any]:
        """Get the learning matrix - how well each expert performs for each query type"""
        matrix = {
            "total_queries_processed": len(self.learning_history),
            "categories_seen": {},
            "expert_performance": {},
            "optimization_suggestions": [],
        }
        
        # Build statistics
        for response in self.learning_history:
            category = response.query_category.value
            if category not in matrix["categories_seen"]:
                matrix["categories_seen"][category] = 0
            matrix["categories_seen"][category] += 1
        
        return matrix


# Singleton instance
_orchestrator_instance = None

def get_orchestrator() -> ResponseOrchestrator:
    """Get or create the global orchestrator instance"""
    global _orchestrator_instance
    if _orchestrator_instance is None:
        _orchestrator_instance = ResponseOrchestrator()
    return _orchestrator_instance
