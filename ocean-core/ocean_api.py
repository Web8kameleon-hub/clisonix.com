"""
OCEAN CORE 8030 API
===================
Standalone FastAPI application - completely isolated from main.py

Port: 8030
Features:
- Query endpoint (natural language → intelligent response)
- Data sources status
- Knowledge exploration
- Curiosity threads
"""

import os
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import asyncio

# Local imports
from data_sources import get_internal_data_sources as get_all_sources
from query_processor import get_query_processor, QueryIntent
from knowledge_engine import get_knowledge_engine, KnowledgeResponse
from persona_router import PersonaRouter
from laboratories import get_laboratory_network
from real_data_engine import get_real_data_engine
from specialized_chat_engine import get_specialized_chat, initialize_specialized_chat
from response_orchestrator import get_orchestrator
from autolearning_engine import get_autolearning_engine, AutolearningEngine


async def get_knowledge_engine_hybrid(data_sources):
    """Create hybrid knowledge engine that only uses internal data"""
    # For now, use the standard knowledge engine but we'll filter external APIs
    # This is a wrapper that ensures no external data is used
    try:
        from knowledge_engine import KnowledgeEngine
        
        if data_sources is None:
            logger.error("❌ Cannot initialize knowledge engine: data_sources is None!")
            return None
        
        logger.info("🧠 Initializing KnowledgeEngine with internal data sources...")
        ke = KnowledgeEngine(data_sources, None)  # No external_apis_manager
        
        if ke is None:
            logger.error("❌ KnowledgeEngine() returned None!")
            return None
        
        logger.info("⏳ Initializing knowledge engine...")
        await ke.initialize()
        logger.info("✅ Knowledge engine initialized successfully!")
        return ke
    except Exception as e:
        logger.error(f"❌ Error initializing hybrid knowledge engine: {type(e).__name__}: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return None

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ocean_api")

# Initialize FastAPI app
app = FastAPI(
    title="Curiosity Ocean 8030",
    description="Universal Knowledge Aggregation Engine with 14 Expert Personas - Internal Data Only",
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
internal_data_sources = None
persona_router = None
query_processor = None
knowledge_engine = None
laboratory_network = None
real_data_engine = None
specialized_chat = None
orchestrator = None
autolearning_engine = None  # New: Autolearning Engine


@app.on_event("startup")
async def startup_event():
    """Initialize all managers on startup"""
    global internal_data_sources, persona_router, query_processor, knowledge_engine, laboratory_network, real_data_engine, specialized_chat, orchestrator
    
    logger.info("[OCEAN] Ocean Core 8030 starting up with 14 personas...")
    
    try:
        # Initialize all managers in parallel
        logger.info("→ Initializing internal data sources...")
        internal_data_sources = get_all_sources()
        
        if internal_data_sources is None:
            logger.error("❌ CRITICAL: get_all_sources() returned None!")
            raise RuntimeError("Failed to initialize data sources")
        
        logger.info(f"[OK] Data sources initialized")
        
        logger.info("→ Initializing persona router...")
        persona_router = PersonaRouter()
        
        if persona_router is None or not persona_router.mapping:
            logger.error("❌ CRITICAL: Persona router failed to initialize!")
            raise RuntimeError("Failed to initialize persona router")
        
        logger.info(f"[OK] Persona router initialized with {len(persona_router.mapping)} personas")
        
        logger.info("→ Initializing query processor...")
        query_processor = await get_query_processor()
        
        if query_processor is None:
            logger.error("❌ CRITICAL: get_query_processor() returned None!")
            raise RuntimeError("Failed to initialize query processor")
        
        logger.info("[OK] Query processor initialized")
        
        # Initialize laboratory network and real data engine - FOR ULTRA RESPONSES
        logger.info("→ Initializing laboratory network and real data engine...")
        laboratory_network = get_laboratory_network()
        
        if laboratory_network is None:
            logger.error("⚠️  Laboratory network not available!")
        else:
            lab_list = laboratory_network.get_all_labs()
            logger.info(f"[OK] Laboratory network initialized with {len(lab_list)} labs")
            real_data_engine = await get_real_data_engine(laboratory_network)
            logger.info("[OK] Real Data Engine initialized - Will query labs for ULTRA responses!")
        
        # Initialize specialized chat engine - CLEAN EXPERT CHAT
        logger.info("→ Initializing Specialized Chat Engine...")
        specialized_chat = await initialize_specialized_chat()
        logger.info("[OK] Specialized Chat Engine ready - clean, expert-focused interface!")
        
        # Initialize orchestrator - THE BRAIN
        logger.info("→ Initializing Response Orchestrator (The Brain)...")
        orchestrator = get_orchestrator()
        logger.info("🧠 [OK] Response Orchestrator online - Ready to think and decide!")
        
        # Initialize knowledge engine - CRITICAL COMPONENT
        logger.info("→ Initializing knowledge engine with internal data sources...")
        knowledge_engine = await get_knowledge_engine_hybrid(internal_data_sources)
        
        if knowledge_engine is None:
            logger.error("❌ CRITICAL: Knowledge engine failed to initialize!")
            logger.error("⚠️  Ocean Core will operate in degraded mode without knowledge engine!")
            # Don't raise - allow the service to run in degraded mode
            # raise RuntimeError("Failed to initialize knowledge engine")
        else:
            logger.info("✅ Knowledge engine initialized successfully!")
        
        # Initialize Autolearning Engine - CONTINUOUS LEARNING
        logger.info("→ Initializing Autolearning Engine (Learning Loop)...")
        autolearning_engine = get_autolearning_engine()
        stats = autolearning_engine.get_learning_stats()
        logger.info(f"🧠 [OK] Autolearning Engine online!")
        logger.info(f"   - Knowledge entries: {stats['knowledge_base']['total_knowledge_entries']}")
        logger.info(f"   - Custom patterns: {stats['patterns']['custom_patterns']}")
        
        logger.info(f"✅ Ocean Core 8030 initialized successfully!")
        logger.info(f"   - Personas: {len(persona_router.mapping)}")
        logger.info(f"   - Data Sources: {len(internal_data_sources.get_all_data().keys()) if internal_data_sources else 0}")
        logger.info(f"   - Laboratories: {len(laboratory_network.get_all_labs()) if laboratory_network else 0}")
        logger.info(f"   - Real Data Engine: {'✅ Ready' if real_data_engine else '⚠️  Not available'}")
        logger.info(f"   - Knowledge Engine: {'✅ Ready' if knowledge_engine else '⚠️  Degraded'}")
        logger.info(f"   - Autolearning Engine: ✅ Ready")
        logger.info(f"   - Orchestrator (Brain): ✅ Ready")
    except Exception as e:
        logger.error(f"❌ Ocean Core 8030 initialization failed: {type(e).__name__}: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise


@app.get("/")
async def root():
    """Root endpoint"""
    internal_data = internal_data_sources.get_all_data() if internal_data_sources else {}
    
    return {
        "service": "Curiosity Ocean 8030",
        "version": "4.0.0",
        "status": "operational",
        "personas": len(persona_router.mapping) if persona_router else 0,
        "data_sources": len(internal_data) if internal_data else 0,
        "description": "Universal Knowledge Aggregation Engine with 14 Expert Personas",
        "features": [
            "14 specialist personas",
            "Internal data sources only",
            "Query routing via personas",
            "Knowledge exploration",
            "Curiosity threads"
        ],
        "endpoints": [
            "GET /api/personas - List all 14 specialists",
            "POST /api/query - Query with persona routing",
            "GET /api/status - Service status",
            "GET /api/labs - Location lab data",
            "GET /api/agents - Agent telemetry",
            "GET /health - Health check"
        ]
    }


@app.get("/favicon.ico")
async def favicon():
    """Serve favicon - Ocean blue icon"""
    # Return a simple 1x1 pixel transparent GIF to prevent 404
    import base64
    # Minimal valid ICO (1x1 blue pixel)
    favicon_bytes = base64.b64decode(
        "AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        "AAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP//"
        "/wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AAAA"
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    )
    from fastapi.responses import Response
    return Response(content=favicon_bytes, media_type="image/x-icon")


@app.get("/")
async def root():
    """Redirect to chat interface"""
    return FileResponse("specialized_chat.html", media_type="text/html")


@app.get("/chat")
async def chat_ui():
    """Serve the specialized chat interface"""
    import os
    file_path = os.path.join(os.path.dirname(__file__), "specialized_chat.html")
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="text/html")
    else:
        return {"error": "Chat UI not found"}


@app.get("/api/status")
async def get_status():
    """Get service status"""
    if not internal_data_sources:
        return {"status": "initializing"}
    
    try:
        internal_data = internal_data_sources.get_all_data()
        
        return {
            "service": "Curiosity Ocean 8030",
            "version": "4.0.0",
            "status": "operational",
            "initialized": True,
            "personas": len(persona_router.mapping),
            "knowledge_engine": "operational" if knowledge_engine else "degraded",
            "timestamp": datetime.now().isoformat(),
            "data_sources": {
                "timestamp": internal_data.get("timestamp"),
                "source": internal_data.get("source"),
                "central_api_connected": internal_data.get("central_api_connected", False),
                "laboratories": len(internal_data.get("laboratories", {}).get("labs", [])),
                "system_metrics": len(internal_data.get("system_metrics", {})),
                "asi_status": bool(internal_data.get("asi_status")),
                "ocean_labs_list": len(internal_data.get("ocean_labs_list", {}).get("laboratories", [])),
                "ai_agents_status": len(internal_data.get("ai_agents_status", {})),
                "all_keys": list(internal_data.keys())
            },
            "components": {
                "persona_router": "operational",
                "internal_data_sources": "operational",
                "query_processor": "operational",
                "knowledge_engine": "operational" if knowledge_engine else "not_initialized"
            }
        }
    except Exception as e:
        logger.error(f"Status check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/system-full")
async def get_full_system_status():
    """
    Get COMPLETE system status with ALL components:
    - 14 Personas
    - 23 Laboratories
    - 61 Alphabet Layers
    - 12 Backend Layers (0-12)
    - ASI Trinity (Alba/Albi/Jona)
    - Open Data Sources
    - Enforcement Manager
    - ML Manager
    - Cycle Engine
    """
    try:
        status = {
            "service": "Clisonix Ocean Core",
            "version": "4.0.0 - Full Integration",
            "timestamp": datetime.now().isoformat(),
            "components": {}
        }
        
        # Personas
        status["components"]["personas"] = {
            "count": len(persona_router.mapping) if persona_router else 0,
            "status": "active" if persona_router else "unavailable",
            "list": list(persona_router.mapping.keys()) if persona_router else []
        }
        
        # Laboratories
        if laboratory_network:
            labs = laboratory_network.get_all_labs()
            status["components"]["laboratories"] = {
                "count": len(labs),
                "status": "active",
                "locations": [lab.location for lab in labs[:5]]
            }
        else:
            status["components"]["laboratories"] = {"count": 0, "status": "unavailable"}
        
        # Orchestrator with Alphabet Layers & Universal Connector
        if orchestrator:
            status["components"]["orchestrator"] = {
                "status": "active",
                "alphabet_layers": orchestrator.alphabet_layers.alphabet['size'] if orchestrator.alphabet_layers else 0,
                "universal_connector": "connected" if hasattr(orchestrator, 'universal_connector') and orchestrator.universal_connector else "not_connected"
            }
            
            # Get Universal Connector summary
            if hasattr(orchestrator, 'universal_connector') and orchestrator.universal_connector:
                status["components"]["universal_system"] = orchestrator.universal_connector.get_system_summary()
        
        # Real Data Engine
        status["components"]["real_data_engine"] = {
            "status": "active" if real_data_engine else "unavailable"
        }
        
        # Knowledge Engine
        status["components"]["knowledge_engine"] = {
            "status": "active" if knowledge_engine else "degraded"
        }
        
        # Summary
        active_count = sum(1 for c in status["components"].values() if c.get("status") == "active" or c.get("status") == "connected")
        status["summary"] = {
            "total_components": len(status["components"]),
            "active_components": active_count,
            "health": "healthy" if active_count > 4 else "degraded"
        }
        
        return status
        
    except Exception as e:
        logger.error(f"Full system status error: {e}")
        return {"error": str(e), "status": "error"}


@app.get("/api/sources")
async def get_sources():
    """List available data sources (INTERNAL ONLY)"""
    if not internal_data_sources:
        raise HTTPException(status_code=503, detail="Service initializing")
    
    internal_data = internal_data_sources.get_all_data()
    
    # REAL SOURCES from actual data
    return {
        "timestamp": datetime.now().isoformat(),
        "internal_sources_operational": list(internal_data.keys()),
        "central_api": {
            "url": internal_data.get("central_api_url", "http://localhost:8000"),
            "connected": internal_data.get("central_api_connected", False),
            "health": internal_data.get("health", {}),
            "status_code": internal_data.get("status")
        },
        "laboratories_network": {
            "description": "23 Specialized Research Laboratories across EU",
            "total": internal_data.get("laboratories", {}).get("total_labs", 0),
            "list_count": len(internal_data.get("ocean_labs_list", {}).get("laboratories", [])),
            "status": "operational",
            "locations": [
                "Elbasan, Albania (AI)",
                "Tirana, Albania (Medical)", 
                "Prishtina, Kosovo (Security)",
                "Vienna, Austria (Neuroscience)",
                "Zurich, Switzerland (Finance)",
                "Prague, Czech Republic (Robotics)",
                "Budapest, Hungary (Data)",
                "Ljubljana, Slovenia (Quantum)",
                "Zagreb, Croatia (Biotech)",
                "Sofia, Bulgaria (Chemistry)",
                "Beograd, Serbia (Industrial)",
                "Bucharest, Romania (Nanotechnology)",
                "Istanbul, Turkey (Trade)",
                "Cairo, Egypt (Archeology)",
                "Jerusalem, Palestine (Heritage)",
                "Rome, Italy (Architecture)",
                "Athens, Greece (Classical)",
                "Kostur, North Macedonia (Energy)",
                "Durrës, Albania (IoT)",
                "Shkodër, Albania (Marine)",
                "Vlorë, Albania (Environmental)",
                "Korça, Albania (Agricultural)",
                "Sarandë, Albania (Underwater)"
            ]
        },
        "agi_agents": {
            "description": "ASI Trinity - 3 Superintelligences",
            "alba": {
                "role": "Network Monitor",
                "health": internal_data.get("asi_status", {}).get("trinity", {}).get("alba", {}).get("health", 0),
                "operational": internal_data.get("asi_status", {}).get("trinity", {}).get("alba", {}).get("operational", False)
            },
            "albi": {
                "role": "Neural Processor", 
                "health": internal_data.get("asi_status", {}).get("trinity", {}).get("albi", {}).get("health", 0),
                "operational": internal_data.get("asi_status", {}).get("trinity", {}).get("albi", {}).get("operational", False)
            },
            "jona": {
                "role": "Data Coordinator",
                "health": internal_data.get("asi_status", {}).get("trinity", {}).get("jona", {}).get("health", 0),
                "operational": internal_data.get("asi_status", {}).get("trinity", {}).get("jona", {}).get("operational", False)
            },
            "count": len(internal_data.get("ai_agents_status", {})),
            "status": "operational"
        },
        "system_metrics": {
            "description": "Real-time system health monitoring",
            "cpu_percent": internal_data.get("system_metrics", {}).get("cpu_percent"),
            "memory_percent": internal_data.get("system_metrics", {}).get("memory_percent"),
            "disk_percent": internal_data.get("system_metrics", {}).get("disk_percent"),
            "status": "operational"
        },
        "data_quality": {
            "laboratories": len(internal_data.get("laboratories", {}).get("labs", [])),
            "ocean_labs_list": len(internal_data.get("ocean_labs_list", {}).get("laboratories", [])),
            "ai_agents": len(internal_data.get("ai_agents_status", {})),
            "total_data_records": sum([
                len(v) if isinstance(v, list) else (len(v) if isinstance(v, dict) else 1) 
                for v in internal_data.values() if v
            ])
        },
        "note": "✅ ONLY internal Clisonix APIs - NO external data sources (Wikipedia, ArXiv, GitHub disabled)"
    }


def generate_key_findings(question: str, response: str) -> list:
    """Generate key findings from response"""
    findings = []
    
    # Extract sentences that look like findings
    if response:
        sentences = response.split('. ')
        for i, sentence in enumerate(sentences[:5]):  # Top 5 findings
            if len(sentence.strip()) > 20:
                findings.append({
                    "finding": sentence.strip(),
                    "importance": 0.8 - (i * 0.1),
                    "source": "persona_analysis"
                })
    
    return findings


def generate_curiosity_threads(question: str, findings: list) -> list:
    """Generate curiosity threads for deeper exploration"""
    threads = []
    
    # Common curiosity thread patterns
    thread_templates = [
        {
            "title": "Deep Dive",
            "hook": f"Let's explore the underlying mechanisms behind: {question[:50]}...",
            "depth_level": "expert"
        },
        {
            "title": "Historical Context",
            "hook": f"How did our understanding of this topic evolve?",
            "depth_level": "medium"
        },
        {
            "title": "Practical Applications",
            "hook": f"How can we apply this knowledge in real-world scenarios?",
            "depth_level": "beginner"
        },
        {
            "title": "Related Concepts",
            "hook": f"What other topics are connected to this?",
            "depth_level": "medium"
        }
    ]
    
    return thread_templates[:3]  # Return top 3 threads


@app.get("/api/personas")
async def get_personas():
    """List all 14 specialist personas"""
    if not persona_router:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    personas_list = []
    for domain, keywords in persona_router.mapping.items():
        personas_list.append({
            "domain": domain,
            "keywords": keywords,
            "description": f"{domain} specialist analyst"
        })
    
    return {
        "total_personas": len(personas_list),
        "personas": personas_list,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/query")
async def query_ocean(request: Request):
    """
    Query Ocean with 14 Specialist Personas
    
    Accepts JSON body with:
    - query: Natural language question (required)
    - use_personas: Route through specialist personas (default: true)
    - limit_results: Limit results per source (default: 5)
    
    Routes to specialized analysts based on keywords:
    - Medical Science: brain, neuro, health, biology
    - LoRa IoT: lora, iot, sensor, gateway
    - Security: security, vulnerability, encrypted
    - Systems Architecture: api, infrastructure, system
    - Natural Science: physics, chemistry, energy, quantum
    - Industrial Process: cycle, production, factory
    - Business: kpi, revenue, growth, strategy
    - AGI Systems: agi, cognitive, autonomous
    - And 6 more specialized domains...
    """
    
    # Parse JSON body
    try:
        body = await request.json()
    except Exception as e:
        logger.error(f"JSON parse error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid JSON body: {str(e)}")
    
    question = body.get("query") or body.get("question") or ""
    use_personas = body.get("use_personas", True)
    curiosity_level = body.get("curiosity_level", "curious")
    
    if not question or len(question.strip()) == 0:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    if not query_processor or not knowledge_engine or not persona_router or not internal_data_sources:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    try:
        logger.info(f"🧠 Received query: {question}")
        
        # 0. ULTRA MODE: Try to get real data from laboratories first!
        lab_data = None
        if real_data_engine:
            logger.info("🔬 ULTRA MODE: Querying real laboratories for data...")
            try:
                lab_data = await real_data_engine.get_comprehensive_response(question)
                logger.info(f"✅ Real labs returned {lab_data.get('total_labs_queried', 0)} responses")
            except Exception as e:
                logger.warning(f"⚠️  Real data engine error: {e}")
        
        # 1. Get internal data
        internal_data = internal_data_sources.get_all_data()
        
        # 2. Route to specialist persona first (if enabled)
        persona_response = None
        if use_personas:
            persona = persona_router.route(question)
            persona_response = persona.answer(question, internal_data)
            logger.info(f"✅ Persona {persona.__class__.__name__} answered question")
        
        # 3. Process query with full knowledge engine
        processed = await query_processor.process(question)
        
        # 4. Generate comprehensive answer
        response = None
        if knowledge_engine:
            try:
                response = await knowledge_engine.answer_query(question, processed)
            except Exception as ke_error:
                logger.warning(f"Knowledge engine error: {ke_error}, using persona response")
        
        # If knowledge engine not available, create lightweight response
        if not response:
            # Generate enhanced findings - use real lab data if available!
            if lab_data and lab_data.get('lab_responses'):
                # Use REAL lab data instead of generic findings
                key_findings = [
                    {
                        "finding": lab['answer'][:200] + "...",
                        "importance": lab['quality_score'],
                        "source": lab['lab_name'],
                        "lab_domain": lab['domain'],
                        "confidence": lab['confidence']
                    }
                    for lab in lab_data.get('lab_responses', [])[:20]
                ]
            else:
                key_findings = generate_key_findings(question, persona_response)
            
            curiosity_threads = generate_curiosity_threads(question, key_findings)
            
            # Build ULTRA response with real lab data
            ultra_response = persona_response or "Analyzed based on internal data sources"
            if lab_data and lab_data.get('comprehensive_answer'):
                ultra_response = lab_data['comprehensive_answer']
            
            response_dict = {
                "query": question,
                "intent": processed.intent.value if processed else "unknown",
                "response": ultra_response,
                "persona_answer": persona_response if use_personas else None,
                "key_findings": key_findings,
                "sources": {"internal": ["persona_analysis", "real_laboratories"] if lab_data else ["persona_analysis"], "external": []},
                "confidence": lab_data.get('average_confidence', 0.75) if lab_data else (0.75 if persona_response else 0.5),
                "processing_time_ms": 0,
                "curiosity_threads": curiosity_threads,
                "data_sources_used": ["internal_only", "real_labs"] if lab_data else ["internal_only"],
                "labs_queried": lab_data.get('total_labs_queried', 0) if lab_data else 0,
                "real_lab_data": lab_data if lab_data else None,
                "timestamp": datetime.now().isoformat()
            }
        else:
            # Convert dataclass to dict
            response_dict = {
                "query": response.query,
                "intent": response.intent,
                "response": response.main_response,
                "persona_answer": persona_response if use_personas else None,
                "key_findings": response.key_findings,
                "sources": response.sources_cited,
                "confidence": response.confidence_score,
                "processing_time_ms": response.processing_time_ms,
                "curiosity_threads": [
                    {
                        "topic": thread.topic,
                        "question": thread.initial_question,
                        "related_topics": thread.related_topics,
                        "continue_with": thread.continue_suggestions,
                        "sources": thread.sources_used
                    }
                    for thread in response.curiosity_threads
                ],
                "data_sources_used": ["internal_only"],
                "timestamp": response.timestamp
            }
        
        return response_dict
        
    except ValueError as e:
        logger.warning(f"Query validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Query processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def specialized_chat(request: Request):
    """
    Specialized Expert Chat - Clean Interface
    
    Returns real, expert answers in your advanced domains:
    - Neuroscience & Brain Research
    - AI/ML & Deep Learning
    - Quantum Physics & Energy
    - IoT/LoRa & Sensor Networks
    - Cybersecurity & Encryption
    - Bioinformatics & Genetics
    - Data Science & Analytics
    - Marine Biology & Environmental Science
    
    NO system status - JUST expert answers.
    """
    if not specialized_chat:
        raise HTTPException(status_code=503, detail="Specialized Chat Engine not initialized")
    
    try:
        body = await request.json()
        query = body.get("query", "").strip()
        
        if not query:
            raise ValueError("Query cannot be empty")
        
        # Generate expert response
        response = await specialized_chat.generate_expert_response(query)
        
        return {
            "type": "specialized_chat",
            "query": query,
            "domain": response["domain"],
            "domain_expertise": response["domain_expertise"],
            "answer": response["answer"],
            "sources": response["sources"],
            "confidence": response["confidence"],
            "follow_up_topics": response["follow_up_topics"],
            "timestamp": response["timestamp"]
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Chat processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/history")
async def get_chat_history(request: Request):
    """Get chat conversation history"""
    if not specialized_chat:
        raise HTTPException(status_code=503, detail="Specialized Chat Engine not initialized")
    
    try:
        body = await request.json()
        limit = body.get("limit", 20)
        
        history = specialized_chat.get_chat_history(limit)
        stats = specialized_chat.get_statistics()
        
        return {
            "messages": history,
            "statistics": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"History retrieval error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/clear")
async def clear_chat():
    """Clear chat history for new conversation"""
    if not specialized_chat:
        raise HTTPException(status_code=503, detail="Specialized Chat Engine not initialized")
    
    try:
        specialized_chat.clear_history()
        return {"status": "success", "message": "Chat history cleared", "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        logger.error(f"Clear history error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/spontaneous")
async def spontaneous_conversation(request: Request):
    """
    SPONTANEOUS CONVERSATION MODE
    ============================
    
    This is the NEW way to chat - with full context awareness!
    
    Features:
    - Understands references to previous discussion ("what we talked about")
    - Maintains conversation topic coherence
    - Adapts responses based on full conversation history
    - Can handle follow-ups and clarifications naturally
    - Natural multi-turn dialogue
    
    Returns:
    - context_aware: boolean (true if using previous context)
    - conversation_topic: the main topic being discussed
    - turn_number: which turn of conversation this is
    - follow_up_topics: context-aware suggestions
    
    Example flow:
    1. User: "Tell me about quantum computing"
    2. User: "How does error correction work?" → System remembers quantum context
    3. User: "And what about hardware?" → Continues quantum discussion
    """
    if not specialized_chat:
        raise HTTPException(status_code=503, detail="Specialized Chat Engine not initialized")
    
    try:
        body = await request.json()
        query = body.get("query", "").strip()
        use_context = body.get("use_context", True)  # Default: use conversation context
        
        if not query:
            raise ValueError("Query cannot be empty")
        
        # Generate spontaneous response with context awareness
        response = await specialized_chat.generate_spontaneous_response(query, use_context=use_context)
        
        return {
            "type": "spontaneous_chat",
            "query": response["query"],
            "domain": response["domain"],
            "domain_expertise": response["domain_expertise"],
            "answer": response["answer"],
            "sources": response["sources"],
            "confidence": response["confidence"],
            "follow_up_topics": response["follow_up_topics"],
            "context_aware": response["context_aware"],
            "conversation_topic": response["conversation_topic"],
            "turn_number": response["turn_number"],
            "timestamp": response["timestamp"]
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Spontaneous chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def simple_chat(request: Request):
    """
    SIMPLE CHAT ENDPOINT
    ====================
    
    Për përdorim të thjeshtë - thjesht dërgo mesazhin dhe merr përgjigje.
    
    Body:
    {
        "message": "Përshëndetje! Si je?"
    }
    
    Returns:
    {
        "response": "Mirëdita! Jam mirë, faleminderit...",
        "sources": ["coingecko", "internal_knowledge"],
        "confidence": 0.92
    }
    """
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not initialized")
    
    try:
        body = await request.json()
        message = body.get("message", body.get("query", "")).strip()
        
        if not message:
            return {
                "response": "Ju lutem shkruani diçka për të vazhduar bisedën.",
                "sources": [],
                "confidence": 1.0
            }
        
        logger.info(f"💬 Simple chat: {message[:50]}...")
        
        # Use async orchestrator with real knowledge
        try:
            result = await orchestrator.process_query_async(message)
            return {
                "response": result.fused_answer,
                "sources": result.sources_cited,
                "confidence": result.confidence,
                "query_category": result.query_category.value if hasattr(result.query_category, 'value') else str(result.query_category)
            }
        except Exception as e:
            logger.warning(f"Async failed: {e}, using sync")
            result = orchestrator.process_query(message)
            return {
                "response": result.fused_answer,
                "sources": result.sources_cited,
                "confidence": result.confidence
            }
    
    except Exception as e:
        logger.error(f"Simple chat error: {e}")
        return {
            "response": f"Ndodhi një gabim: {str(e)}. Ju lutem provoni përsëri.",
            "sources": [],
            "confidence": 0.0
        }


@app.post("/api/chat/orchestrated")
async def orchestrated_response(request: Request):
    """
    ORCHESTRATED RESPONSE MODE - REAL KNOWLEDGE + AUTOLEARNING
    ===========================================================
    
    The BRAIN is thinking with REAL DATA and LEARNING!
    
    INTERNAL (Independent - No API dependencies):
    - 23 Internal Laboratories
    - 14 Expert Personas
    - 61 Alphabet Layers
    - 12 Backend Layers
    - ASI Trinity (Alba/Albi/Jona)
    - Knowledge Accumulator (learns from every query)
    - Pattern Detector (learns patterns)
    
    EXTERNAL (Bonus - Optional):
    - CoinGecko (Crypto prices)
    - OpenWeatherMap (Weather)
    - PubMed (Medical research)
    - ArXiv (Scientific papers)
    
    Returns natural, conversational responses with real data.
    """
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Response Orchestrator not initialized")
    
    try:
        body = await request.json()
        query = body.get("query", body.get("message", "")).strip()
        conversation_context = body.get("conversation_context", [])
        
        if not query:
            raise ValueError("Query cannot be empty")
        
        logger.info(f"🧠 ORCHESTRATOR processing: {query[:60]}...")
        
        # STEP 1: Check Autolearning Engine for cached/learned responses
        knowledge_id = None
        learning_result = None
        
        if autolearning_engine:
            learning_result = autolearning_engine.process_query(query)
            logger.info(f"   📚 Pattern: {learning_result['pattern_type']}, Cached: {learning_result['cached_knowledge'] is not None}")
            
            # If we have a high-confidence cached response, use it first
            if learning_result.get('cached_knowledge'):
                cached = learning_result['cached_knowledge']
                if cached.get('helpfulness', 0) > 0.7 and cached.get('confidence', 0) > 0.85:
                    logger.info(f"   ✅ Using learned response (helpfulness: {cached['helpfulness']:.0%})")
                    return {
                        "type": "learned_response",
                        "query": query,
                        "query_category": "learned",
                        "understanding": {"from": "autolearning", "times_used": cached['times_used']},
                        "consulted_experts": [],
                        "fused_answer": cached['response'],
                        "sources_cited": ["autolearning_engine"],
                        "confidence": cached['confidence'],
                        "narrative_quality": cached['helpfulness'],
                        "learning_record": {"knowledge_id": cached['knowledge_id']},
                        "timestamp": datetime.utcnow().isoformat()
                    }
            
            # If we have a pattern response (greeting, farewell, etc), use it
            if learning_result.get('pattern_response'):
                logger.info(f"   ✅ Using pattern response for: {learning_result['pattern_type']}")
                return {
                    "type": "pattern_response",
                    "query": query,
                    "query_category": learning_result['pattern_type'],
                    "understanding": {"pattern": learning_result['pattern_type']},
                    "consulted_experts": [],
                    "fused_answer": learning_result['pattern_response'],
                    "sources_cited": ["pattern_detector"],
                    "confidence": 0.95,
                    "narrative_quality": 0.90,
                    "learning_record": {},
                    "timestamp": datetime.utcnow().isoformat()
                }
        
        # STEP 2: Try async processing with orchestrator
        try:
            orchestrated = await orchestrator.process_query_async(query, conversation_context)
        except Exception as async_error:
            logger.warning(f"Async processing failed, falling back to sync: {async_error}")
            orchestrated = orchestrator.process_query(query, conversation_context)
        
        # STEP 3: Learn from this response
        if autolearning_engine and learning_result and learning_result.get('should_learn', True):
            knowledge_id = autolearning_engine.learn_from_response(
                query=query,
                response=orchestrated.fused_answer,
                sources=orchestrated.sources_cited,
                confidence=orchestrated.confidence
            )
            logger.info(f"   📝 Learned as: {knowledge_id}")
        
        # Convert to JSON-serializable format
        return {
            "type": "orchestrated_response",
            "query": orchestrated.query,
            "query_category": orchestrated.query_category.value if hasattr(orchestrated.query_category, 'value') else str(orchestrated.query_category),
            "understanding": orchestrated.understanding if isinstance(orchestrated.understanding, dict) else {"raw": str(orchestrated.understanding)},
            "consulted_experts": [
                {
                    "type": c.expert_type,
                    "name": c.expert_name,
                    "confidence": c.confidence,
                    "relevance": c.relevance_score,
                }
                for c in orchestrated.consulted_experts
            ] if orchestrated.consulted_experts else [],
            "fused_answer": orchestrated.fused_answer,
            "sources_cited": orchestrated.sources_cited,
            "confidence": orchestrated.confidence,
            "narrative_quality": orchestrated.narrative_quality,
            "learning_record": {"knowledge_id": knowledge_id} if knowledge_id else orchestrated.learning_record,
            "timestamp": orchestrated.timestamp if hasattr(orchestrated, 'timestamp') else datetime.utcnow().isoformat()
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Orchestrator error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/orchestrator/learning")
async def get_orchestrator_learning():
    """Get the learning matrix from the orchestrator"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Response Orchestrator not initialized")
    
    try:
        learning_matrix = orchestrator.get_learning_matrix()
        return {
            "type": "learning_matrix",
            "total_queries_processed": learning_matrix["total_queries_processed"],
            "categories_seen": learning_matrix["categories_seen"],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Learning matrix error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/autolearning/stats")
async def get_autolearning_stats():
    """
    Get Autolearning Engine statistics
    
    Shows:
    - Total knowledge entries learned
    - Top queries used
    - Pattern statistics
    - Session learning info
    """
    if not autolearning_engine:
        raise HTTPException(status_code=503, detail="Autolearning Engine not initialized")
    
    try:
        stats = autolearning_engine.get_learning_stats()
        return {
            "type": "autolearning_stats",
            "knowledge_base": stats["knowledge_base"],
            "patterns": stats["patterns"],
            "session": stats["session"],
            "independence": {
                "internal_sources": True,
                "external_api_dependency": False,
                "description": "Sistemi mëson dhe funksionon pa varësi nga API të jashtme"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Autolearning stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/autolearning/feedback")
async def autolearning_feedback(request: Request):
    """
    Record user feedback for a response
    
    Body:
    - knowledge_id: ID of the knowledge entry
    - helpful: true/false
    """
    if not autolearning_engine:
        raise HTTPException(status_code=503, detail="Autolearning Engine not initialized")
    
    try:
        body = await request.json()
        knowledge_id = body.get("knowledge_id")
        helpful = body.get("helpful", True)
        
        if not knowledge_id:
            raise ValueError("knowledge_id is required")
        
        autolearning_engine.record_feedback(knowledge_id, helpful)
        
        return {
            "status": "recorded",
            "knowledge_id": knowledge_id,
            "feedback": "helpful" if helpful else "not_helpful",
            "message": "Faleminderit për feedback-un! Sistemi do të mësojë nga kjo."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Feedback error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/chat/domains")
async def get_domains():
    """Get available expertise domains"""
    if not specialized_chat:
        raise HTTPException(status_code=503, detail="Specialized Chat Engine not initialized")
    
    domains = {}
    for domain_name, domain_info in specialized_chat.EXPERTISE_DOMAINS.items():
        domains[domain_name] = {
            "focus": domain_info["focus"],
            "expertise_level": domain_info["expertise_level"],
            "keywords": domain_info["keywords"][:5],  # Show first 5 keywords
            "labs": domain_info["labs"]
        }
    
    return {
        "domains": domains,
        "total_domains": len(domains),
        "total_labs": len(set(lab for d in domains.values() for lab in d["labs"])),
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/labs")
async def get_labs():
    """Get all location labs data"""
    if not laboratory_network:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    try:
        labs_dicts = laboratory_network.get_all_labs()
        # labs_dicts is already a list of dicts from get_all_labs()
        return {
            "labs": labs_dicts,
            "total": len(labs_dicts),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Labs data error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/agents")
async def get_agents():
    """Get all agent telemetry"""
    if not internal_data_sources:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    try:
        internal_data = internal_data_sources.get_all_data()
        return {
            "agents": internal_data.get("agents", []),
            "total": len(internal_data.get("agents", [])),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Agents data error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/threads/{topic}")
async def get_curiosity_thread(topic: str):
    """Get curiosity threads for exploration"""
    
    if not topic:
        raise HTTPException(status_code=400, detail="Topic required")
    
    # Map common topics to threads
    threads_map = {
        "laboratory": {
            "topic": "Geographic Laboratory Networks",
            "related": ["Elbasan", "Tirana", "Durrës", "Shkodër", "Vlorë", "Korça","Sarandë","Zürich","Roma"],
            "explore": [
                "What domains are most active?",
                "Which locations have highest quality data?",
                "What's the correlation between lab domains?",
                "How are labs interconnected across countries?"
            ]
        },
        "agents": {
            "topic": "Agent Intelligence & Decisions",
            "related": ["ALBA", "ALBI", "Blerina", "AGIEM", "ASI"],
            "explore": [
                "What are the top agent decisions?",
                "Which agent has highest confidence?",
                "What anomalies were detected?",
                "How do agents coordinate?"
            ]
        },
        "system": {
            "topic": "System Infrastructure & Performance",
            "related": ["CPU", "Memory", "Latency", "Uptime"],
            "explore": [
                "What are current metrics?",
                "Are there performance bottlenecks?",
                "How's resource utilization?",
                "What's the trend over time?"
            ]
        }
    }
    
    thread = threads_map.get(topic.lower())
    
    if not thread:
        raise HTTPException(status_code=404, detail=f"Topic '{topic}' not found")
    
    return {
        "topic": thread["topic"],
        "related_entities": thread["related"],
        "explore_further": thread["explore"],
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ocean-core-8030",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/laboratories")
async def get_all_laboratories():
    """Get all 23 specialized laboratories with their functions"""
    try:
        lab_network = get_laboratory_network()
        return {
            "total_laboratories": len(lab_network.labs),
            "laboratories": lab_network.get_all_labs(),
            "network_stats": lab_network.get_network_stats(),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Laboratories data error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/laboratories/summary")
async def get_laboratories_summary():
    """Get summary of all 23 laboratories"""
    try:
        lab_network = get_laboratory_network()
        return lab_network.get_all_labs_summary()
    except Exception as e:
        logger.error(f"Laboratories summary error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/laboratories/types")
async def get_laboratory_types():
    """Get all unique laboratory types"""
    try:
        lab_network = get_laboratory_network()
        return {
            "types": lab_network.get_lab_types(),
            "count": len(lab_network.get_lab_types()),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Laboratory types error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/laboratories/{lab_id}")
async def get_laboratory(lab_id: str):
    """Get specific laboratory by ID"""
    try:
        lab_network = get_laboratory_network()
        lab = lab_network.get_lab_by_id(lab_id)
        
        if not lab:
            raise HTTPException(status_code=404, detail=f"Laboratory '{lab_id}' not found")
        
        return {
            "laboratory": lab.to_dict(),
            "status_summary": lab.get_status_summary(),
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Laboratory lookup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/laboratories/type/{lab_type}")
async def get_laboratories_by_type(lab_type: str):
    """Get laboratories by type"""
    try:
        lab_network = get_laboratory_network()
        labs = lab_network.get_labs_by_type(lab_type)
        
        if not labs:
            raise HTTPException(status_code=404, detail=f"No laboratories of type '{lab_type}' found")
        
        return {
            "type": lab_type,
            "count": len(labs),
            "laboratories": [lab.to_dict() for lab in labs],
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Laboratory type lookup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/laboratories/location/{location}")
async def get_laboratories_by_location(location: str):
    """Get laboratories by location"""
    try:
        lab_network = get_laboratory_network()
        labs = lab_network.get_labs_by_location(location)
        
        if not labs:
            raise HTTPException(status_code=404, detail=f"No laboratories in '{location}' found")
        
        return {
            "location": location,
            "count": len(labs),
            "laboratories": [lab.to_dict() for lab in labs],
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Laboratory location lookup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/laboratories/function/{keyword}")
async def get_laboratories_by_function(keyword: str):
    """Get laboratories by function keyword"""
    try:
        lab_network = get_laboratory_network()
        labs = lab_network.get_labs_by_function_keyword(keyword)
        
        if not labs:
            raise HTTPException(status_code=404, detail=f"No laboratories with function containing '{keyword}' found")
        
        return {
            "keyword": keyword,
            "count": len(labs),
            "laboratories": [lab.to_dict() for lab in labs],
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Laboratory function lookup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# MEGA SIGNAL INTEGRATOR ENDPOINTS
# =============================================================================

@app.get("/api/signals/overview")
async def get_signals_overview():
    """
    🌊 MEGA SIGNAL SYSTEM OVERVIEW
    
    Returns status of all signal managers:
    - Cycles, Alignments, Proposals
    - Kubernetes, CI/CD
    - News, Data Sources (5000+ from 200+ countries)
    """
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        overview = integrator.get_system_overview()
        
        return {
            "type": "mega_signal_overview",
            "status": "connected",
            "overview": overview,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Mega Signal overview error: {e}")
        return {
            "type": "mega_signal_overview",
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@app.post("/api/signals/query")
async def query_signals(request: Request):
    """
    🔍 QUERY MEGA SIGNAL SYSTEM
    
    Ask about cycles, alignments, proposals, kubernetes, 
    data sources, and more!
    """
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        
        body = await request.json()
        query = body.get("query", body.get("message", "")).strip()
        
        if not query:
            raise ValueError("Query cannot be empty")
        
        result = await integrator.process_query(query)
        
        return {
            "type": "mega_signal_query",
            "query": query,
            "response": result.get("response", ""),
            "sources_checked": result.get("sources_checked", []),
            "signals": result.get("signals", []),
            "timestamp": datetime.utcnow().isoformat()
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Mega Signal query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/signals/cycles")
async def get_cycles():
    """Get all active cycles"""
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        cycles = integrator.cycle_manager.get_active_cycles()
        
        return {
            "type": "cycles",
            "count": len(cycles),
            "cycles": cycles,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Cycles error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/signals/cycles")
async def create_cycle(request: Request):
    """Create a new cycle"""
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        
        body = await request.json()
        domain = body.get("domain", "general")
        source = body.get("source", "api")
        interval = body.get("interval_seconds", 300)
        
        signal = integrator.cycle_manager.create_cycle(domain, source, interval)
        
        return {
            "type": "cycle_created",
            "signal": {
                "id": signal.signal_id,
                "message": signal.message,
                "data": signal.data
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Create cycle error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/signals/proposals")
async def create_proposal(request: Request):
    """Create a new proposal"""
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        
        body = await request.json()
        title = body.get("title", "New Proposal")
        domain = body.get("domain", "general")
        description = body.get("description", "")
        
        signal = integrator.proposal_manager.create_proposal(title, domain, description)
        
        return {
            "type": "proposal_created",
            "signal": {
                "id": signal.signal_id,
                "message": signal.message,
                "data": signal.data
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Create proposal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/signals/kubernetes")
async def get_kubernetes_status():
    """Get Kubernetes cluster status"""
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        signal = integrator.devops_manager.get_kubernetes_status()
        
        return {
            "type": "kubernetes_status",
            "message": signal.message,
            "data": signal.data,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Kubernetes status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/signals/data-sources")
async def get_data_sources_summary():
    """
    🌍 GET 5000+ DATA SOURCES FROM 200+ COUNTRIES
    
    Returns summary of all available data sources:
    - EEG/Neuro (OpenNeuro, PhysioNet)
    - Scientific (PubMed, ArXiv, NCBI)
    - Statistics EU (Eurostat, Destatis, INSEE)
    - Statistics Asia (China NBS, Japan, Korea)
    - Finance (ECB, IMF, World Bank, CoinGecko)
    - Environment (Copernicus, NASA, NOAA)
    - Health (WHO, CDC, ECDC)
    - News (NewsAPI, Guardian, NY Times)
    - IoT (FIWARE, Smart Data Models)
    - International (UN Data, WTO, ILO, FAO)
    """
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        signal = integrator.news_data_manager.get_data_sources_summary()
        
        return {
            "type": "data_sources",
            "message": signal.message,
            "total_sources": signal.data.get("total", 0),
            "categories": signal.data.get("categories", {}),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Data sources error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/signals/data-sources/search")
async def search_data_sources(query: str = Query(..., description="Search query for data sources")):
    """Search data sources by keyword"""
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        results = integrator.news_data_manager.search_sources(query)
        
        return {
            "type": "data_sources_search",
            "query": query,
            "count": len(results),
            "results": results,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Data sources search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/signals/lora")
async def get_lora_status():
    """
    📡 GET LORA/LORAWAN NETWORK STATUS
    
    Returns status of LoRa gateways and nodes.
    Low-power wide-area network for IoT.
    """
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        signal = integrator.lora_manager.get_network_status()
        
        return {
            "type": "lora_status",
            "message": signal.message,
            "data": signal.data,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"LoRa status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/signals/lora/nodes")
async def register_lora_node(request: Request):
    """Register a new LoRa node"""
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        
        body = await request.json()
        node_id = body.get("node_id", f"node_{datetime.utcnow().timestamp()}")
        node_type = body.get("node_type", "sensor")
        metadata = body.get("metadata", {})
        
        signal = integrator.lora_manager.register_node(node_id, node_type, metadata)
        
        return {
            "type": "lora_node_registered",
            "signal": {"id": signal.signal_id, "message": signal.message, "data": signal.data},
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"LoRa node registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/signals/nanogrid")
async def get_nanogrid_status():
    """
    🔌 GET NANOGRID GATEWAY STATUS
    
    Returns status of embedded devices:
    - ESP32 (WiFi, BLE, I2C)
    - STM32 (LoRa, UART, DMA)
    - ASIC (LoRa, UART)
    - Raspberry Pi
    """
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        signal = integrator.nanogrid_manager.get_gateway_status()
        
        return {
            "type": "nanogrid_status",
            "message": signal.message,
            "data": signal.data,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Nanogrid status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/signals/nanogrid/devices")
async def register_nanogrid_device(request: Request):
    """Register a new Nanogrid device"""
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        
        body = await request.json()
        device_id = body.get("device_id", f"dev_{datetime.utcnow().timestamp()}")
        model = body.get("model", "CUSTOM_IOT")
        metadata = body.get("metadata", {})
        
        signal = integrator.nanogrid_manager.register_device(device_id, model, metadata)
        
        return {
            "type": "nanogrid_device_registered",
            "signal": {"id": signal.signal_id, "message": signal.message, "data": signal.data},
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Nanogrid device registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/signals/nanogrid/telemetry")
async def receive_telemetry(request: Request):
    """Receive telemetry from Nanogrid device"""
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        
        body = await request.json()
        device_id = body.get("device_id")
        payload = body.get("payload", {})
        
        if not device_id:
            raise ValueError("device_id is required")
        
        signal = integrator.nanogrid_manager.process_telemetry(device_id, payload)
        
        return {
            "type": "telemetry_received",
            "signal": {"id": signal.signal_id, "message": signal.message},
            "timestamp": datetime.utcnow().isoformat()
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Telemetry error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/signals/nodes")
async def get_nodes_status():
    """Get nodes, arrays, and buffers status"""
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        status = integrator.node_array_manager.get_status()
        
        return {
            "type": "node_array_status",
            "data": status,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Nodes status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/signals/formats")
async def get_data_formats():
    """
    📦 GET SUPPORTED DATA FORMATS
    
    Returns info about supported formats:
    - CBOR (39% smaller than JSON)
    - JSON (human readable)
    - YAML (config files)
    - MsgPack (30% smaller than JSON)
    """
    try:
        from mega_signal_integrator import get_mega_signal_integrator
        integrator = get_mega_signal_integrator()
        signal = integrator.format_manager.get_all_formats()
        
        return {
            "type": "data_formats",
            "message": signal.message,
            "formats": signal.data,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Formats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("OCEAN_PORT", 8031))
    logger.info(f"🌊 Starting Curiosity Ocean on port {port}...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
