"""
KNOWLEDGE ENGINE - MINIMAL + 14 PERSONAS
========================================
Routes questions to specialized persona analysts using ONLY internal Clisonix data.
"""

from typing import Dict, Any
from persona_router import PersonaRouter
from data_sources import get_internal_data_sources


class KnowledgeEngine:
    """Routes queries to specialized persona analysts using ONLY internal APIs."""
    
    def __init__(self):
        self.internal = get_internal_data_sources()
        self.router = PersonaRouter()

    def answer(self, question: str) -> str:
        """Answer a question by routing to appropriate persona using ONLY internal data."""
        persona = self.router.route(question)
        
        if not persona:
            return f"❓ Nuk gjeta analist të dedikuar për: {question}"

        # Prepare REAL internal data - NO FAKE DATA
        internal_data: Dict[str, Any] = {
            "labs": self.internal.get_all_labs(),
            "agents": self.internal.get_all_agents(),
            "cycles": self.internal.get_all_cycles(),
            "ci_status": self.internal.get_ci_status(),
            "api_status": self.internal.get_api_status(),
            "kpi": self.internal.get_kpi(),
        }

        # Route to persona - all use internal data ONLY
        return persona.answer(question, internal_data)

    @staticmethod
    def get_instance() -> "KnowledgeEngine":
        """Get singleton instance."""
        if not hasattr(KnowledgeEngine, "_instance"):
            KnowledgeEngine._instance = KnowledgeEngine()
        return KnowledgeEngine._instance
