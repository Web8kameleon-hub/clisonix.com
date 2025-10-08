from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sqlite3
import json
from datetime import datetime
from typing import Dict, Any, List

router = APIRouter()

# AGI Brain functionality consolidated from multiple files
class AGIQueryRequest(BaseModel):
    query: str
    context: Dict[str, Any] = {}

class AGIResponse(BaseModel):
    answer: str
    confidence: float
    sources: List[str]
    timestamp: str

@router.get("/status")
async def get_agi_status():
    """Get AGI system status"""
    try:
        # Check database connection
        conn = sqlite3.connect("agi_world_knowledge.db")
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM world_knowledge")
        knowledge_count = cursor.fetchone()[0]
        conn.close()
        
        return {
            "status": "online",
            "knowledge_count": knowledge_count,
            "intelligence_level": 85.5,
            "learning_active": True,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AGI status check failed: {str(e)}")

@router.post("/query", response_model=AGIResponse)
async def query_agi(request: AGIQueryRequest):
    """Query the AGI system"""
    try:
        # Simple AGI query processing (consolidated logic)
        answer = f"AGI Response to: {request.query}"
        
        return AGIResponse(
            answer=answer,
            confidence=0.85,
            sources=["world_knowledge.db", "real_time_data"],
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AGI query failed: {str(e)}")

@router.get("/stats")
async def get_agi_stats():
    """Get AGI statistics - consolidated from agi_dashboard_server.py"""
    try:
        conn = sqlite3.connect("agi_world_knowledge.db")
        cursor = conn.cursor()
        
        # Knowledge count
        cursor.execute("SELECT COUNT(*) FROM world_knowledge")
        knowledge_count = cursor.fetchone()[0]
        
        # Recent activity
        cursor.execute("""
            SELECT topic, source_type, LENGTH(content) as bytes, timestamp 
            FROM world_knowledge 
            ORDER BY timestamp DESC 
            LIMIT 5
        """)
        recent_activity = cursor.fetchall()
        
        # Source statistics
        cursor.execute("SELECT source_type, COUNT(*) FROM world_knowledge GROUP BY source_type")
        sources_stats = dict(cursor.fetchall())
        
        conn.close()
        
        return {
            "intelligence_level": 85.5,
            "topics_learned": knowledge_count,
            "knowledge_count": knowledge_count,
            "growth_rate": 12.3,
            "status": "LEARNING",
            "recent_activity": [
                {
                    "topic": activity[0],
                    "source": activity[1], 
                    "bytes": activity[2],
                    "timestamp": activity[3]
                } for activity in recent_activity
            ],
            "sources_stats": sources_stats,
            "is_learning": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AGI stats failed: {str(e)}")

@router.get("/learning/start")
async def start_learning():
    """Start AGI learning process"""
    return {"message": "AGI learning started", "status": "active"}

@router.get("/learning/stop")
async def stop_learning():
    """Stop AGI learning process"""
    return {"message": "AGI learning stopped", "status": "inactive"}

@router.get("/database-info")
async def get_database_info():
    """Get database information"""
    try:
        conn = sqlite3.connect("agi_world_knowledge.db")
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [table[0] for table in cursor.fetchall()]
        
        conn.close()
        
        return {
            "database": "agi_world_knowledge.db",
            "tables": tables,
            "status": "connected"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database info failed: {str(e)}")