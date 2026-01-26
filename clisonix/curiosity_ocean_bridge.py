# -*- coding: utf-8 -*-
"""
🌊 CURIOSITY OCEAN BRIDGE
==========================
Lidh Auto-Learning me Curiosity Ocean dhe 61 Alphabet Layers.

Rrjedha e të dhënave:
  User Query → Curiosity Ocean → 61 Layers → Auto-Learning → Knowledge Store
  
Components:
- CuriosityOceanBridge: Koordinon të gjitha
- LayerProcessor: Proceson me 61 layers (incl. Meta Ω+)
- LearningFeeder: Ushqen auto-learning

Business: Ledjan Ahmati - WEB8euroweb GmbH
"""

import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from pathlib import Path
import numpy as np

logger = logging.getLogger("clisonix.curiosity_bridge")

# ═══════════════════════════════════════════════════════════════════
# IMPORTS - Lazy loading për performance
# ═══════════════════════════════════════════════════════════════════

_alphabet_system = None
_auto_learning = None


def get_alphabet_system():
    """Lazy load alphabet layer system"""
    global _alphabet_system
    if _alphabet_system is None:
        try:
            from ocean_core.alphabet_layers import get_alphabet_layer_system  # type: ignore
            _alphabet_system = get_alphabet_layer_system()
        except ImportError:
            try:
                import sys
                sys.path.insert(0, str(Path(__file__).parent.parent / "ocean-core"))
                from alphabet_layers import get_alphabet_layer_system  # type: ignore
                _alphabet_system = get_alphabet_layer_system()
            except ImportError:
                logger.warning("Alphabet layer system not available")
                _alphabet_system = None
    return _alphabet_system


def get_auto_learning():
    """Lazy load auto-learning system"""
    global _auto_learning
    if _auto_learning is None:
        try:
            from ocean_core.auto_learning_optimized import AutoLearningOptimized  # type: ignore
            _auto_learning = AutoLearningOptimized()
        except ImportError:
            try:
                import sys
                sys.path.insert(0, str(Path(__file__).parent.parent / "ocean-core"))
                from auto_learning_optimized import AutoLearningOptimized  # type: ignore
                _auto_learning = AutoLearningOptimized()
            except ImportError:
                logger.warning("Auto-learning system not available")
                _auto_learning = None
    return _auto_learning


# ═══════════════════════════════════════════════════════════════════
# DATA STRUCTURES
# ═══════════════════════════════════════════════════════════════════

@dataclass
class CuriosityQuery:
    """Një pyetje nga përdoruesi"""
    text: str
    language: str = "auto"
    curiosity_level: str = "curious"
    context: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class LayerAnalysis:
    """Rezultati i analizës me 61 layers"""
    query: str
    words_processed: int
    total_complexity: float
    meta_consciousness: float
    word_details: List[Dict[str, Any]]
    layer_61_result: float
    processing_time_ms: float


@dataclass 
class LearningEntry:
    """Një entry për auto-learning"""
    query: str
    response: str
    layer_analysis: LayerAnalysis
    curiosity_level: str
    knowledge_score: float
    source: str = "curiosity_ocean"


@dataclass
class CuriosityResult:
    """Rezultati final i Curiosity Ocean"""
    query: CuriosityQuery
    response: str
    layer_analysis: LayerAnalysis
    rabbit_holes: List[str]
    knowledge_stored: bool
    processing_time_ms: float


# ═══════════════════════════════════════════════════════════════════
# CURIOSITY OCEAN BRIDGE
# ═══════════════════════════════════════════════════════════════════

class CuriosityOceanBridge:
    """
    🌊 Bridge qendrore që koordinon:
    - Curiosity Ocean (response generation)
    - 61 Alphabet Layers (mathematical analysis)
    - Auto-Learning (knowledge storage)
    """
    
    def __init__(self, enable_learning: bool = True):
        self.enable_learning = enable_learning
        self._alphabet_system = None
        self._auto_learning = None
        self._response_engine = None
        
        # Stats
        self.stats = {
            "queries_processed": 0,
            "total_complexity": 0.0,
            "entries_learned": 0,
            "average_consciousness": 0.0,
            "started_at": datetime.now(timezone.utc).isoformat(),
        }
        
        # Initialize
        self._initialize()
    
    def _initialize(self):
        """Inicializon komponentët"""
        # Alphabet layers
        self._alphabet_system = get_alphabet_system()
        if self._alphabet_system:
            logger.info("✅ Alphabet Layer System (61 layers) connected")
        
        # Auto-learning
        if self.enable_learning:
            self._auto_learning = get_auto_learning()
            if self._auto_learning:
                logger.info("✅ Auto-Learning system connected")
    
    async def process_query(self, query: CuriosityQuery) -> CuriosityResult:
        """
        Proceson një pyetje përmes të gjithë pipeline-it.
        """
        start_time = time.time()
        
        # 1. Analizo me 61 layers
        layer_analysis = self._analyze_with_layers(query.text)
        
        # 2. Gjenero response (mock për tani - do lidhet me CoreResponseEngine)
        response = await self._generate_response(query, layer_analysis)
        
        # 3. Gjenero rabbit holes
        rabbit_holes = self._generate_rabbit_holes(query.text, layer_analysis)
        
        # 4. Ruaj në auto-learning
        knowledge_stored = False
        if self.enable_learning and self._auto_learning:
            knowledge_stored = self._store_learning(query, response, layer_analysis)
        
        # Update stats
        self.stats["queries_processed"] += 1
        self.stats["total_complexity"] += layer_analysis.total_complexity
        
        # Running average of consciousness
        n = self.stats["queries_processed"]
        old_avg = self.stats["average_consciousness"]
        self.stats["average_consciousness"] = old_avg + (layer_analysis.meta_consciousness - old_avg) / n
        
        processing_time = (time.time() - start_time) * 1000
        
        return CuriosityResult(
            query=query,
            response=response,
            layer_analysis=layer_analysis,
            rabbit_holes=rabbit_holes,
            knowledge_stored=knowledge_stored,
            processing_time_ms=round(processing_time, 2),
        )
    
    def _analyze_with_layers(self, text: str) -> LayerAnalysis:
        """Analizon tekstin me 61 alphabet layers"""
        start = time.time()
        
        if not self._alphabet_system:
            # Fallback pa alphabet system
            return LayerAnalysis(
                query=text,
                words_processed=len(text.split()),
                total_complexity=0.0,
                meta_consciousness=0.5,
                word_details=[],
                layer_61_result=0.5,
                processing_time_ms=0.0,
            )
        
        # Proceso me alphabet layers
        result = self._alphabet_system.process_query(text)
        
        # Compute consciousness me Layer 61
        consciousness = self._alphabet_system.compute_consciousness(text)
        
        processing_time = (time.time() - start) * 1000
        
        return LayerAnalysis(
            query=text,
            words_processed=result.get("processed_words", 0),
            total_complexity=result.get("total_complexity", 0.0),
            meta_consciousness=result.get("meta_consciousness", 0.0),
            word_details=result.get("word_analysis", []),
            layer_61_result=consciousness.get("consciousness_level", 0.0),
            processing_time_ms=round(processing_time, 2),
        )
    
    async def _generate_response(self, query: CuriosityQuery, analysis: LayerAnalysis) -> str:
        """
        Gjeneron response bazuar në analizën.
        TODO: Lidhu me CoreResponseEngine.
        """
        # Për tani, response bazuar në consciousness level
        consciousness = analysis.meta_consciousness
        complexity = analysis.total_complexity
        
        if consciousness > 0.7:
            depth = "thellë dhe të menduar"
        elif consciousness > 0.5:
            depth = "të balancuar"
        else:
            depth = "të drejtpërdrejtë"
        
        # Simple template
        response = (
            f"🧠 Pyetja jote u analizua me 61 shtresa matematikore.\n\n"
            f"📊 Kompleksiteti: {complexity:.2f}\n"
            f"🌊 Niveli i vetëdijes (Layer 61): {consciousness:.4f}\n\n"
            f"Kjo pyetje kërkon një përgjigje {depth}.\n\n"
            f"[Response i plotë do gjenerohet nga Curiosity Ocean Engine]"
        )
        
        return response
    
    def _generate_rabbit_holes(self, text: str, analysis: LayerAnalysis) -> List[str]:
        """Gjeneron rabbit holes për eksplorim të mëtejshëm"""
        rabbit_holes = []
        
        # Bazuar në fjalët e analizuara
        for word_data in analysis.word_details[:3]:
            word = word_data.get("word", "")
            complexity = word_data.get("complexity", 0)
            
            if complexity > 1.5:
                rabbit_holes.append(f"Pse '{word}' ka kaq kompleksitet fonetik?")
            elif word:
                rabbit_holes.append(f"Çfarë lidhje ka '{word}' me kozmologjinë?")
        
        # Shtoj rabbit holes universale
        rabbit_holes.extend([
            "Si lidhet kjo me numrin e artë (φ = 1.618)?",
            "Çfarë thotë Layer 61 (Ω+) për këtë?",
        ])
        
        return rabbit_holes[:5]
    
    def _store_learning(self, query: CuriosityQuery, response: str, analysis: LayerAnalysis) -> bool:
        """Ruaj në auto-learning"""
        try:
            if not self._auto_learning:
                return False
            
            # Compute knowledge score
            knowledge_score = (
                0.3 * (analysis.total_complexity / 10) +
                0.4 * analysis.meta_consciousness +
                0.3 * min(1.0, len(query.text) / 100)
            )
            
            # Store
            entry = {
                "query": query.text,
                "response": response[:500],  # Truncate
                "complexity": analysis.total_complexity,
                "consciousness": analysis.meta_consciousness,
                "knowledge_score": round(knowledge_score, 4),
                "curiosity_level": query.curiosity_level,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            
            self._auto_learning.add_entry(entry)
            self.stats["entries_learned"] += 1
            
            return True
            
        except Exception as e:
            logger.warning(f"Learning store error: {e}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Merr statistika"""
        return {
            **self.stats,
            "alphabet_layers": self._alphabet_system.get_layer_stats() if self._alphabet_system else None,
            "auto_learning_active": self._auto_learning is not None,
        }


# ═══════════════════════════════════════════════════════════════════
# SINGLETON & HELPERS
# ═══════════════════════════════════════════════════════════════════

_bridge: Optional[CuriosityOceanBridge] = None


def get_curiosity_bridge(enable_learning: bool = True) -> CuriosityOceanBridge:
    """Merr instancën singleton të bridge"""
    global _bridge
    if _bridge is None:
        _bridge = CuriosityOceanBridge(enable_learning=enable_learning)
    return _bridge


async def process_curiosity_query(
    text: str,
    language: str = "auto",
    curiosity_level: str = "curious"
) -> CuriosityResult:
    """Shortcut për processing"""
    bridge = get_curiosity_bridge()
    query = CuriosityQuery(text=text, language=language, curiosity_level=curiosity_level)
    return await bridge.process_query(query)


# ═══════════════════════════════════════════════════════════════════
# CLI / TEST
# ═══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    async def main():
        print("=" * 60)
        print("🌊 CURIOSITY OCEAN BRIDGE TEST")
        print("=" * 60)
        
        bridge = get_curiosity_bridge()
        
        # Test queries
        queries = [
            "Çfarë është vetëdija e universit?",
            "Si funksionon AI dhe rrjetet neurale?",
            "Dritë e diellit mbi deti",
        ]
        
        for text in queries:
            print(f"\n📝 Query: {text}")
            print("-" * 40)
            
            result = await process_curiosity_query(text, curiosity_level="genius")
            
            print(f"⏱️  Processing: {result.processing_time_ms}ms")
            print(f"📊 Complexity: {result.layer_analysis.total_complexity}")
            print(f"🧠 Consciousness (Ω+): {result.layer_analysis.meta_consciousness:.4f}")
            print(f"💾 Stored: {result.knowledge_stored}")
            print(f"🐰 Rabbit holes: {len(result.rabbit_holes)}")
        
        # Stats
        print("\n" + "=" * 60)
        print("📊 BRIDGE STATS")
        print("=" * 60)
        stats = bridge.get_stats()
        for k, v in stats.items():
            print(f"  {k}: {v}")
    
    asyncio.run(main())
