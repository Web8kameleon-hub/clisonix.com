"""
OCEAN CORE 8030 API (REAL DATA + 14 EXPERT PERSONAS)
====================================================
Ultra-minimal + efficient FastAPI application with:
- REAL connections to ALL Clisonix data sources (Location Labs, Agent Telemetry, Cycle Engine, Excel, Metrics)
- 14 specialist analyst personas (Medical, IoT, Security, Architecture, Science, Industrial, AGI, Business, Human, Academic, Media, Culture, Hobby, Entertainment)
- Smart persona routing based on domain keywords
- Knowledge aggregation from ONLY internal Clisonix APIs
- NO fake data, NO external APIs, NO placeholders

Completely isolated from main.py on port 8030
"""

import os
import sys
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add real import paths
sys.path.insert(0, "/app/apps/api" if os.path.exists("/app/apps/api") else "./apps/api" if os.path.exists("./apps/api") else ".")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ocean_api_8030")

# Local imports - using REAL 14 personas and minimal knowledge engine
from knowledge_engine_minimal import KnowledgeEngine
from persona_router import PersonaRouter
from data_sources import get_internal_data_sources

# Type hints
from typing import Optional

# Initialize FastAPI app
app = FastAPI(
    title="Curiosity Ocean 8030",
    description="Universal Knowledge Aggregation Engine - 14 Expert Personas + REAL Internal Data Only",
    version="4.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
knowledge_engine = None
persona_router = None
data_sources = None


class QueryRequest(BaseModel):
    question: str


@app.on_event("startup")
async def startup_event():
    """Initialize all systems on startup"""
    global knowledge_engine, persona_router, data_sources
    
    logger.info("🌊 Ocean Core 8030 starting up with 14 Expert Personas...")
    
    try:
        # Initialize core engines
        knowledge_engine = KnowledgeEngine()
        persona_router = PersonaRouter()
        data_sources = get_internal_data_sources()
        
        logger.info("✅ Ocean Core 8030 fully initialized")
        logger.info("✅ 14 Personas loaded: Medical, IoT, Security, Architecture, Science, Industrial, AGI, Business, Human, Academic, Media, Culture, Hobby, Entertainment")
        logger.info("✅ Data sources connected: Location Labs, Agent Telemetry, Cycle Engine, Excel Dashboard, System Metrics, KPI Engine")
    except Exception as e:
        logger.error(f"❌ Ocean Core 8030 initialization failed: {e}")
        raise


@app.get("/")
async def root():
    """Root endpoint - Service information"""
    return {
        "service": "Curiosity Ocean 8030",
        "version": "4.0.0",
        "status": "operational",
        "personas": 14,
        "personas_list": [
            "Medical Science Analyst",
            "LoRa & IoT Analyst",
            "Security Analyst",
            "Systems Architecture Analyst",
            "Natural Science Analyst",
            "Industrial Process Analyst",
            "AGI Systems Analyst",
            "Business Analyst",
            "Human Analyst",
            "Academic Analyst",
            "Media Analyst",
            "Culture Analyst",
            "Hobby Analyst",
            "Entertainment Analyst"
        ],
        "data_sources": [
            "Location Labs Engine (12 labs)",
            "Agent Telemetry (ALBA, ALBI, Blerina, AGIEM, ASI)",
            "Cycle Engine",
            "Excel Dashboard (port 8001)",
            "System Metrics",
            "KPI Engine"
        ],
        "description": "Universal Knowledge Aggregation Engine with 14 Expert Analysts - REAL DATA ONLY",
        "endpoints": {
            "/api/query": "Route question to appropriate persona",
            "/api/personas": "List all 14 specialist personas",
            "/api/labs": "Location labs data",
            "/api/agents": "Agent telemetry data",
            "/api/status": "System status",
            "/docs": "API documentation"
        }
    }


@app.get("/api/personas")
async def get_personas():
    """List all 14 specialist personas"""
    if not persona_router:
        raise HTTPException(status_code=503, detail="Persona system not initialized")
    
    personas_list = []
    for name, keywords in persona_router.mapping.items():
        personas_list.append({
            "domain": name,
            "keywords": keywords
        })
    
    return {
        "total_personas": len(personas_list),
        "personas": personas_list,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/query")
async def query_ocean(payload: QueryRequest):
    """Main query endpoint - Routes to appropriate persona analyst"""
    if not knowledge_engine:
        raise HTTPException(status_code=503, detail="Knowledge engine not initialized")
    
    try:
        question = payload.question
        logger.info(f"🔍 Query: {question}")
        
        # Route through knowledge engine (which uses PersonaRouter internally)
        answer = knowledge_engine.answer(question)
        
        return {
            "query": question,
            "answer": answer,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/query")
async def query_ocean_get(question: str = Query(..., description="Question to ask")):
    """Query endpoint via GET"""
    payload = QueryRequest(question=question)
    return await query_ocean(payload)


@app.get("/api/labs")
async def get_labs():
    """Get location labs data"""
    if not data_sources:
        raise HTTPException(status_code=503, detail="Data sources not initialized")
    
    try:
        labs = data_sources.get_all_labs()
        return {
            "source": "Location Labs Engine",
            "total_labs": len(labs),
            "labs": labs,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting labs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/agents")
async def get_agents():
    """Get agent telemetry data"""
    if not data_sources:
        raise HTTPException(status_code=503, detail="Data sources not initialized")
    
    try:
        agents = data_sources.get_all_agents()
        return {
            "source": "Agent Telemetry",
            "agents": agents,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting agents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/status")
async def get_status():
    """Get system status"""
    try:
        status_info = {
            "service": "Curiosity Ocean 8030",
            "status": "operational",
            "timestamp": datetime.now().isoformat(),
            "components": {
                "knowledge_engine": "operational" if knowledge_engine else "not_initialized",
                "persona_router": "operational" if persona_router else "not_initialized",
                "data_sources": "operational" if data_sources else "not_initialized"
            },
            "personas_count": 14,
            "data_sources_count": 6
        }
        return status_info
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Curiosity Ocean 8030",
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8030)
