"""
KNOWLEDGE ENGINE - MINIMAL
==========================
Routes questions to appropriate persona analysts.
"""

from typing import Dict, Any
from persona_router import PersonaRouter
from data_sources import InternalDataSources, ExternalDataSources


class KnowledgeEngine:
    """Routes queries to specialized persona analysts."""
    
    def __init__(self):
        self.internal = InternalDataSources()
        self.external = ExternalDataSources()
        self.router = PersonaRouter()

    def answer(self, question: str) -> str:
        """Answer a question by routing to appropriate persona."""
        persona = self.router.route(question)
        
        if not persona:
            return f"❓ Nuk gjeta analist të dedikuar për: {question}"

        # Prepare internal data
        internal_data: Dict[str, Any] = {
            "lab_status": self.internal.get_lab_status("LAB-ELBASAN-01"),
            "cycle_metrics": self.internal.get_cycle_metrics("CYCLE-001"),
            "ci_status": self.internal.get_ci_status(),
            "api_status": self.internal.get_api_status(),
            "agents": self.internal.get_agents(),
            "kpi": self.internal.get_kpi(),
        }

        # Prepare external data
        external_data: Dict[str, Any] = {
            "wikipedia": self.external.get_wikipedia_summary(question),
            "pubmed": self.external.get_pubmed_insight(question),
            "arxiv": self.external.get_arxiv_papers(question),
            "github": self.external.get_github_repos(question),
        }

        # Route to persona based on domain
        domain = persona.domain
        
        if domain in ["medical_science", "academic", "media", "culture", "entertainment"]:
            # External/knowledge domains
            return persona.answer(question, external_data)
        else:
            # Internal/operational domains
            return persona.answer(question, internal_data)

    @staticmethod
    def get_instance() -> "KnowledgeEngine":
        """Get singleton instance."""
        if not hasattr(KnowledgeEngine, "_instance"):
            KnowledgeEngine._instance = KnowledgeEngine()
        return KnowledgeEngine._instance
