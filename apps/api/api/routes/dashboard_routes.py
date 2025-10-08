from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from datetime import datetime

router = APIRouter()

@router.get("/services/status")
async def get_services_status():
    """Get status of all dashboard services"""
    return {
        "services": {
            "backend_api": {
                "name": "Backend API",
                "url": "http://localhost:8000",
                "status": "online",
                "icon": "🔧"
            },
            "agi_dashboard": {
                "name": "AGI Dashboard", 
                "url": "http://localhost:8000/api/agi",
                "status": "online",
                "icon": "🧠"
            },
            "neurosonix": {
                "name": "NeuroSonix Engine",
                "url": "http://localhost:8000/api/neurosonix", 
                "status": "online",
                "icon": "🎵"
            },
            "world_brain": {
                "name": "World Brain",
                "url": "http://localhost:8000/api/world-brain",
                "status": "online", 
                "icon": "🌍"
            }
        },
        "timestamp": datetime.now().isoformat()
    }

@router.get("/overview")
async def get_dashboard_overview():
    """Get dashboard overview data"""
    return {
        "total_services": 4,
        "active_services": 4,
        "system_health": "excellent",
        "uptime": "99.9%",
        "last_update": datetime.now().isoformat()
    }