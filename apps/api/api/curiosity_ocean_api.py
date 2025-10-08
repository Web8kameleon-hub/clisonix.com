"""
Curiosity Ocean Backend API
Advanced AI-powered response engine with multilingual support
Integrates Core Response Engine with Multilingual Module
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import asyncio
import logging
from datetime import datetime

# Import our custom modules
try:
    from services.curiosity_core_engine import (
        get_engine, 
        CuriosityLevel, 
        ResponseLanguage, 
        UserContext, 
        KnowledgeResponse
    )
    from services.multilingual_module import (
        get_multilingual_module,
        SupportedLanguage,
        LanguageDetectionResult
    )
except ImportError as e:
    print(f"Import error: {e}")
    # Fallback imports for development
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
    
    from services.curiosity_core_engine import (
        get_engine, 
        CuriosityLevel, 
        ResponseLanguage, 
        UserContext, 
        KnowledgeResponse
    )
    from services.multilingual_module import (
        get_multilingual_module,
        SupportedLanguage,
        LanguageDetectionResult
    )

router = APIRouter()
logger = logging.getLogger(__name__)

# Request/Response Models
class CuriosityRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000, description="The question to explore")
    curiosity_level: str = Field(default="curious", description="Level of curiosity: curious, wild, chaos, genius")
    language: str = Field(default="auto", description="Preferred response language")
    user_context: Optional[Dict[str, Any]] = Field(default=None, description="Additional user context")
    session_id: Optional[str] = Field(default=None, description="Session identifier for context")

class ASIMetricsResponse(BaseModel):
    alba_connections: int
    albi_creativity: float
    jona_coordination: float
    processing_nodes: int
    knowledge_depth: float
    infinite_potential: float

class CuriosityResponse(BaseModel):
    primary_answer: str
    rabbit_holes: List[str]
    next_questions: List[str]
    asi_metrics: ASIMetricsResponse
    confidence_score: float
    processing_time: float
    detected_language: str
    cultural_context: Dict[str, str]
    session_id: Optional[str]
    timestamp: datetime

class LanguageDetectionResponse(BaseModel):
    detected_language: str
    confidence: float
    cultural_context: Dict[str, str]
    regional_variant: Optional[str]
    supported_languages: List[str]

# Global instances
engine = get_engine()
multilingual = get_multilingual_module()

# User session storage (in production, use Redis or database)
user_sessions: Dict[str, Dict[str, Any]] = {}

@router.post("/curiosity-ocean/explore", response_model=CuriosityResponse)
async def explore_question(request: CuriosityRequest, background_tasks: BackgroundTasks):
    """
    Main endpoint for exploring questions with ASI Trinity
    """
    try:
        logger.info(f"Received request: {request}")
        start_time = datetime.now()
        
        # Validate curiosity level
        try:
            curiosity_level = CuriosityLevel(request.curiosity_level.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid curiosity level: {request.curiosity_level}")
        
        # Detect language and cultural context
        try:
            target_language = SupportedLanguage(request.language.lower()) if request.language != "auto" else SupportedLanguage.AUTO
        except ValueError:
            target_language = SupportedLanguage.AUTO
        
        # Language detection
        try:
            detection_result = multilingual.detect_language(request.question, target_language)
        except Exception as lang_err:
            logger.error(f"Language detection error: {lang_err}")
            # Fallback to English
            detection_result = LanguageDetectionResult(
                detected_language=SupportedLanguage.ENGLISH,
                confidence=0.5,
                cultural_context={"style": "neutral", "formality": "medium"}
            )
        
        # Get or create user context - DEBUG: check what we're passing
        logger.info(f"DEBUG: curiosity_level = {curiosity_level}, type = {type(curiosity_level)}")
        try:
            user_context = _get_user_context(request.session_id, request.user_context, curiosity_level)
            logger.info(f"DEBUG: user_context.curiosity_level = {user_context.curiosity_level}, type = {type(user_context.curiosity_level)}")
        except Exception as ctx_err:
            logger.error(f"User context error: {ctx_err}")
            # Fallback context
            user_context = UserContext(
                curiosity_level=curiosity_level,
                language=ResponseLanguage.AUTO,
                previous_questions=[],
                interests=[],
                personality_profile={"creativity": 0.5, "analytical": 0.5, "philosophical": 0.5}
            )
        
        # Update user context with current question
        try:
            if request.session_id:
                _update_user_session(request.session_id, request.question, detection_result)
        except Exception as session_err:
            logger.error(f"Session update error: {session_err}")
        
        # Generate response using core engine
        try:
            logger.info(f"DEBUG: About to call generate_response with question='{request.question}', user_context type={type(user_context)}")
            response = await engine.generate_response(request.question, user_context)
        except Exception as engine_err:
            logger.error(f"Engine response error: {engine_err}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Response generation failed: {str(engine_err)}")
        
        # Apply cultural adaptation
        try:
            culturally_adapted_response = multilingual.adapt_response_culturally(
                response.primary_answer,
                detection_result.detected_language,
                detection_result.cultural_context
            )
        except Exception as cultural_err:
            logger.error(f"Cultural adaptation error: {cultural_err}")
            culturally_adapted_response = response.primary_answer
        
        # Translate rabbit holes and next questions if needed
        try:
            if detection_result.detected_language != SupportedLanguage.ENGLISH:
                response.rabbit_holes = _translate_list(response.rabbit_holes, detection_result.detected_language)
                response.next_questions = _translate_list(response.next_questions, detection_result.detected_language)
        except Exception as trans_err:
            logger.error(f"Translation error: {trans_err}")
        
        # Create response
        try:
            curiosity_response = CuriosityResponse(
                primary_answer=culturally_adapted_response,
                rabbit_holes=response.rabbit_holes,
                next_questions=response.next_questions,
                asi_metrics=ASIMetricsResponse(**response.asi_metrics),
                confidence_score=response.confidence_score,
                processing_time=response.processing_time,
                detected_language=detection_result.detected_language.value,
                cultural_context=detection_result.cultural_context,
                session_id=request.session_id,
                timestamp=start_time
            )
        except Exception as resp_err:
            logger.error(f"Response creation error: {resp_err}")
            raise HTTPException(status_code=500, detail=f"Response formatting failed: {str(resp_err)}")
        
        # Log successful exploration
        try:
            background_tasks.add_task(_log_exploration, request, curiosity_response)
        except Exception as log_err:
            logger.error(f"Logging error: {log_err}")
        
        return curiosity_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in explore_question: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/curiosity-ocean/detect-language", response_model=LanguageDetectionResponse)
async def detect_language(text: str):
    """
    Detect language and cultural context of input text
    """
    try:
        detection_result = multilingual.detect_language(text)
        
        return LanguageDetectionResponse(
            detected_language=detection_result.detected_language.value,
            confidence=detection_result.confidence,
            cultural_context=detection_result.cultural_context,
            regional_variant=detection_result.regional_variant,
            supported_languages=[lang.value for lang in SupportedLanguage if lang != SupportedLanguage.AUTO]
        )
        
    except Exception as e:
        logger.error(f"Error in detect_language: {str(e)}")
        raise HTTPException(status_code=500, detail="Language detection failed")

@router.get("/curiosity-ocean/languages")
async def get_supported_languages():
    """
    Get list of supported languages with their codes
    """
    languages = {}
    for lang in SupportedLanguage:
        if lang != SupportedLanguage.AUTO:
            languages[lang.value] = {
                "code": lang.value,
                "name": _get_language_name(lang),
                "cultural_support": lang in [SupportedLanguage.ALBANIAN, SupportedLanguage.ENGLISH, SupportedLanguage.ITALIAN]
            }
    
    return {
        "supported_languages": languages,
        "default_language": "en",
        "auto_detection": True
    }

@router.get("/curiosity-ocean/asi-status")
async def get_asi_trinity_status():
    """
    Get current status of ASI Trinity nodes
    """
    try:
        return {
            "nodes": {
                "alba": {
                    "name": "Alba Network Intelligence",
                    "status": engine.asi_nodes["alba"].status,
                    "processing_power": engine.asi_nodes["alba"].processing_power,
                    "knowledge_depth": engine.asi_nodes["alba"].knowledge_depth,
                    "specialization": "Network Analysis & Knowledge Domains"
                },
                "albi": {
                    "name": "Albi Neural Processing", 
                    "status": engine.asi_nodes["albi"].status,
                    "processing_power": engine.asi_nodes["albi"].processing_power,
                    "creativity_index": engine.asi_nodes["albi"].creativity_index,
                    "specialization": "Creative Synthesis & Imagination"
                },
                "jona": {
                    "name": "Jona Data Coordination",
                    "status": engine.asi_nodes["jona"].status,
                    "processing_power": engine.asi_nodes["jona"].processing_power,
                    "knowledge_depth": engine.asi_nodes["jona"].knowledge_depth,
                    "specialization": "Data Coordination & Pattern Recognition"
                }
            },
            "system_status": "operational",
            "total_processing_power": sum(node.processing_power for node in engine.asi_nodes.values()),
            "active_nodes": len([node for node in engine.asi_nodes.values() if node.status]),
            "timestamp": datetime.now()
        }
    except Exception as e:
        logger.error(f"Error getting ASI status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get ASI status")

@router.get("/curiosity-ocean/session/{session_id}")
async def get_session_history(session_id: str):
    """
    Get exploration history for a session
    """
    if session_id not in user_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = user_sessions[session_id]
    return {
        "session_id": session_id,
        "questions_explored": len(session.get("questions", [])),
        "languages_used": list(set(session.get("languages", []))),
        "curiosity_levels": session.get("curiosity_levels", {}),
        "last_activity": session.get("last_activity"),
        "cultural_profile": session.get("cultural_profile", {}),
        "recent_questions": session.get("questions", [])[-10:]  # Last 10 questions
    }

# Helper functions
def _get_user_context(session_id: Optional[str], user_context: Optional[Dict], 
                     curiosity_level: CuriosityLevel) -> UserContext:
    """Create or retrieve user context"""
    
    # Default context
    context = UserContext(
        curiosity_level=curiosity_level,
        language=ResponseLanguage.AUTO,
        previous_questions=[],
        interests=[],
        personality_profile={"creativity": 0.5, "analytical": 0.5, "philosophical": 0.5}
    )
    
    # Load session data if available
    if session_id and session_id in user_sessions:
        session = user_sessions[session_id]
        context.previous_questions = session.get("questions", [])[-5:]  # Last 5 questions
        context.interests = session.get("interests", [])
        context.personality_profile = session.get("personality_profile", context.personality_profile)
    
    # Apply user-provided context
    if user_context:
        if "interests" in user_context:
            context.interests.extend(user_context["interests"])
        if "personality" in user_context:
            context.personality_profile.update(user_context["personality"])
    
    return context

def _update_user_session(session_id: str, question: str, detection_result: LanguageDetectionResult):
    """Update user session with new question data"""
    if session_id not in user_sessions:
        user_sessions[session_id] = {
            "questions": [],
            "languages": [],
            "curiosity_levels": {},
            "cultural_profile": {},
            "created_at": datetime.now(),
            "interests": []
        }
    
    session = user_sessions[session_id]
    session["questions"].append({
        "question": question,
        "timestamp": datetime.now(),
        "language": detection_result.detected_language.value
    })
    session["languages"].append(detection_result.detected_language.value)
    session["last_activity"] = datetime.now()
    
    # Update cultural profile
    session["cultural_profile"].update(detection_result.cultural_context)

def _translate_list(items: List[str], target_language: SupportedLanguage) -> List[str]:
    """Simple translation of list items (placeholder for real translation)"""
    # This is a simplified version - in production, use a real translation service
    return items  # For now, return as-is

def _get_language_name(lang: SupportedLanguage) -> str:
    """Get human-readable language name"""
    names = {
        SupportedLanguage.ALBANIAN: "Albanian (Shqip)",
        SupportedLanguage.ENGLISH: "English",
        SupportedLanguage.ITALIAN: "Italian (Italiano)",
        SupportedLanguage.SPANISH: "Spanish (Español)",
        SupportedLanguage.FRENCH: "French (Français)",
        SupportedLanguage.GERMAN: "German (Deutsch)",
        SupportedLanguage.GREEK: "Greek (Ελληνικά)",
        SupportedLanguage.TURKISH: "Turkish (Türkçe)",
        SupportedLanguage.SERBIAN: "Serbian (Српски)",
        SupportedLanguage.CROATIAN: "Croatian (Hrvatski)",
        SupportedLanguage.MACEDONIAN: "Macedonian (Македонски)"
    }
    return names.get(lang, lang.value)

async def _log_exploration(request: CuriosityRequest, response: CuriosityResponse):
    """Background task to log exploration for analytics"""
    try:
        log_data = {
            "timestamp": response.timestamp,
            "question_length": len(request.question),
            "curiosity_level": request.curiosity_level,
            "detected_language": response.detected_language,
            "confidence_score": response.confidence_score,
            "processing_time": response.processing_time,
            "asi_metrics": response.asi_metrics.dict(),
            "cultural_context": response.cultural_context
        }
        
        # In production, send to analytics service
        logger.info(f"Curiosity exploration logged: {log_data}")
        
    except Exception as e:
        logger.error(f"Failed to log exploration: {str(e)}")

# Test endpoint for debugging
@router.post("/curiosity-ocean/test")
async def test_endpoint(data: dict):
    """Simple test endpoint to debug request parsing"""
    try:
        logger.info(f"Received test data: {data}")
        return {
            "status": "received",
            "data": data,
            "timestamp": datetime.now()
        }
    except Exception as e:
        logger.error(f"Test endpoint error: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now()
        }

# Health check endpoint
@router.get("/curiosity-ocean/health")
async def health_check():
    """Health check for the Curiosity Ocean service"""
    try:
        # Simple health check without full test
        return {
            "status": "healthy",
            "core_engine": "operational",
            "multilingual_module": "operational",
            "asi_trinity": "active",
            "timestamp": datetime.now()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now()
        }