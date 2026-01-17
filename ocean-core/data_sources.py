"""
DATA SOURCES CONNECTOR LAYER (MINIMAL)
======================================
Provides test/simulated data for Ocean Core 8030 personas
"""

from typing import Dict, List, Any


class InternalDataSources:
    """Provides internal Clisonix data."""
    
    def __init__(self):
        pass

    def get_lab_status(self, lab_id: str) -> Dict[str, Any]:
        return {
            "lab_id": lab_id,
            "status": "online",
            "location": "Elbasan",
            "agents_active": 3,
            "domain": "university",
            "country": "Albania",
        }

    def get_cycle_metrics(self, cycle_id: str) -> Dict[str, Any]:
        return {
            "cycle_id": cycle_id,
            "throughput": 0.93,
            "quality_score": 0.98,
        }

    def get_ci_status(self) -> Dict[str, Any]:
        return {
            "secrets": "protected",
            "vulnerabilities": "none",
        }

    def get_api_status(self) -> str:
        return "operational"

    def get_agents(self) -> List[str]:
        return ["alba", "albi", "blerina", "agiem", "asi"]

    def get_kpi(self) -> Dict[str, Any]:
        return {
            "revenue": "$2.5M",
            "growth": "15% YoY",
        }


class ExternalDataSources:
    """Provides external knowledge from public APIs."""
    
    def __init__(self):
        pass

    def get_wikipedia_summary(self, topic: str) -> str:
        # Placeholder – më vonë lidh Wikipedia API reale
        return f"Summary for '{topic}' from Wikipedia (simulated)."

    def get_pubmed_insight(self, query: str) -> List[str]:
        return [f"PubMed paper related to: '{query}' (simulated)."]

    def get_arxiv_papers(self, query: str) -> List[str]:
        return [f"Arxiv paper: '{query}' (simulated)."]

    def get_github_repos(self, query: str) -> List[str]:
        return [f"GitHub repo: '{query}' (simulated)."]
