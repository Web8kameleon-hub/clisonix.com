"""
OCEAN CORE 8030 - FastAPI Application
=====================================
Minimal, clean API with 14 specialized analyst personas.
"""

from fastapi import FastAPI
from pydantic import BaseModel
from knowledge_engine_minimal import KnowledgeEngine

app = FastAPI(
    title="OCEAN CORE 8030",
    version="2.1.0",
    description="Universal Knowledge Aggregation Engine with Expert Personas",
)

engine = KnowledgeEngine()


class QueryRequest(BaseModel):
    question: str


@app.get("/")
def root():
    """Service info."""
    return {
        "service": "Curiosity Ocean 8030",
        "version": "2.1.0",
        "status": "operational",
        "personas": 14,
        "endpoints": [
            "/query - POST: Ask question",
            "/personas - GET: List all analysts",
            "/health - GET: Health check",
            "/docs - OpenAPI documentation",
        ],
    }


@app.post("/query")
def query_ocean(payload: QueryRequest):
    """Route question to appropriate persona analyst."""
    answer = engine.answer(payload.question)
    return {
        "question": payload.question,
        "answer": answer,
    }


@app.get("/query")
def query_ocean_get(question: str):
    """Route question to appropriate persona analyst (GET)."""
    answer = engine.answer(question)
    return {
        "question": question,
        "answer": answer,
    }


@app.get("/personas")
def list_personas():
    """List all 14 specialist personas."""
    personas_list = []
    for p in engine.router.personas:
        personas_list.append({
            "name": p.name,
            "domain": p.domain,
        })
    return {
        "total_personas": len(personas_list),
        "personas": personas_list,
    }


@app.get("/health")
def health_check():
    """Health check."""
    return {
        "status": "ok",
        "service": "Curiosity Ocean 8030",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8030)
