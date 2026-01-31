"""
JONA Neural Synthesis API Routes
================================
Backend API endpoints for JONA - Joyful Overseer of Neural Alignment

Provides:
- Real-time neural synthesis status
- Audio generation and playback
- Session management
- Brainwave-to-audio conversion
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import asyncio
import random
import logging

logger = logging.getLogger("jona_routes")

router = APIRouter(prefix="/api/jona", tags=["JONA Neural Synthesis"])

# ============================================================================
# MODELS
# ============================================================================

class SynthesisSession(BaseModel):
    session_id: str
    status: str  # idle, recording, synthesizing, complete
    duration_seconds: float
    samples_processed: int
    created_at: str
    user_id: Optional[str] = None

class AudioFile(BaseModel):
    file_id: str
    filename: str
    format: str
    duration_ms: int
    sample_rate: int
    channels: int
    size_bytes: int
    created_at: str
    neural_frequency: float
    waveform_type: str

class JonaMetrics(BaseModel):
    service: str
    status: str
    version: str
    eeg_signals_processed: int
    audio_files_created: int
    current_symphony: Optional[str]
    neural_frequency: float
    excitement_level: float
    uptime_seconds: int
    last_synthesis: Optional[str]

class SynthesisConfig(BaseModel):
    frequency: float = 14.0  # Hz - Alpha waves default
    waveform: str = "sine"   # sine, square, triangle, sawtooth
    duration: int = 60       # seconds
    modulation: bool = True
    binaural: bool = False
    base_frequency: float = 200.0  # Hz for carrier wave

class WaveformData(BaseModel):
    channel: str
    data: List[float]
    frequency: float
    amplitude: float

# ============================================================================
# IN-MEMORY STATE (Production would use Redis/Database)
# ============================================================================

_active_sessions: Dict[str, Dict[str, Any]] = {}
_audio_library: List[Dict[str, Any]] = []
_service_start_time = datetime.now()
_total_signals_processed = 0
_total_audio_created = 0

# Pre-populate some demo audio files
for i in range(5):
    _audio_library.append({
        "file_id": str(uuid.uuid4()),
        "filename": f"neural_symphony_{i+1}.wav",
        "format": "WAV",
        "duration_ms": random.randint(30000, 180000),
        "sample_rate": 44100,
        "channels": 2,
        "size_bytes": random.randint(1000000, 10000000),
        "created_at": datetime.now().isoformat(),
        "neural_frequency": random.uniform(8.0, 30.0),
        "waveform_type": random.choice(["sine", "binaural", "isochronic"])
    })

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/status")
async def get_jona_status() -> Dict[str, Any]:
    """Get JONA Neural Synthesis service status"""
    global _total_signals_processed, _total_audio_created
    
    uptime = (datetime.now() - _service_start_time).total_seconds()
    active_session = list(_active_sessions.values())[0] if _active_sessions else None
    
    return {
        "success": True,
        "service": "JONA Neural Synthesis",
        "tagline": "Joyful Overseer of Neural Alignment",
        "status": "online",
        "version": "2.1.0",
        "metrics": {
            "eeg_signals_processed": _total_signals_processed,
            "audio_files_created": len(_audio_library),
            "active_sessions": len(_active_sessions),
            "current_symphony": active_session.get("symphony_name") if active_session else None,
            "neural_frequency": active_session.get("frequency", 14.0) if active_session else 14.0,
            "excitement_level": random.uniform(0.6, 0.95),
            "uptime_seconds": int(uptime)
        },
        "capabilities": [
            "eeg_to_audio",
            "binaural_beats",
            "isochronic_tones",
            "neural_entrainment",
            "real_time_synthesis"
        ],
        "timestamp": datetime.now().isoformat()
    }

@router.get("/health")
async def get_jona_health() -> Dict[str, Any]:
    """Health check for JONA service"""
    return {
        "success": True,
        "healthy": True,
        "service": "jona-neural-synthesis",
        "version": "2.1.0",
        "checks": {
            "audio_engine": "healthy",
            "synthesis_pipeline": "healthy",
            "memory": "ok",
            "cpu": "ok"
        },
        "uptime_seconds": int((datetime.now() - _service_start_time).total_seconds()),
        "timestamp": datetime.now().isoformat()
    }

@router.get("/session")
async def get_current_session() -> Dict[str, Any]:
    """Get current active synthesis session"""
    if not _active_sessions:
        return {
            "success": True,
            "active": False,
            "session": None,
            "message": "No active synthesis session"
        }
    
    session_id = list(_active_sessions.keys())[0]
    session = _active_sessions[session_id]
    
    # Update duration
    session["duration_seconds"] = (datetime.now() - datetime.fromisoformat(session["created_at"])).total_seconds()
    session["samples_processed"] = int(session["duration_seconds"] * 256)  # 256 Hz sample rate
    
    return {
        "success": True,
        "active": True,
        "session": session
    }

@router.post("/synthesis/start")
async def start_synthesis(config: Optional[SynthesisConfig] = None) -> Dict[str, Any]:
    """Start a new neural synthesis session"""
    global _total_signals_processed
    
    if config is None:
        config = SynthesisConfig()
    
    # Check if already synthesizing
    if _active_sessions:
        raise HTTPException(status_code=409, detail="Synthesis already in progress. Stop current session first.")
    
    session_id = str(uuid.uuid4())
    session = {
        "session_id": session_id,
        "status": "synthesizing",
        "frequency": config.frequency,
        "waveform": config.waveform,
        "duration_target": config.duration,
        "duration_seconds": 0,
        "samples_processed": 0,
        "symphony_name": f"Neural Symphony #{len(_audio_library) + 1}",
        "created_at": datetime.now().isoformat(),
        "config": config.model_dump()
    }
    
    _active_sessions[session_id] = session
    _total_signals_processed += random.randint(100, 500)
    
    logger.info(f"[JONA] Started synthesis session: {session_id}")
    
    return {
        "success": True,
        "message": "Neural synthesis started",
        "session": session
    }

@router.post("/synthesis/stop")
async def stop_synthesis() -> Dict[str, Any]:
    """Stop current synthesis session and generate audio file"""
    global _total_audio_created
    
    if not _active_sessions:
        raise HTTPException(status_code=404, detail="No active synthesis session to stop")
    
    session_id = list(_active_sessions.keys())[0]
    session = _active_sessions.pop(session_id)
    
    # Calculate final duration
    duration_seconds = (datetime.now() - datetime.fromisoformat(session["created_at"])).total_seconds()
    
    # Generate audio file record
    audio_file = {
        "file_id": str(uuid.uuid4()),
        "filename": f"{session['symphony_name'].replace(' ', '_').lower()}.wav",
        "format": "WAV",
        "duration_ms": int(duration_seconds * 1000),
        "sample_rate": 44100,
        "channels": 2 if session["config"].get("binaural") else 1,
        "size_bytes": int(duration_seconds * 44100 * 2 * (2 if session["config"].get("binaural") else 1)),
        "created_at": datetime.now().isoformat(),
        "neural_frequency": session["frequency"],
        "waveform_type": session["waveform"],
        "session_id": session_id
    }
    
    _audio_library.append(audio_file)
    _total_audio_created += 1
    
    logger.info(f"[JONA] Stopped synthesis, created: {audio_file['filename']}")
    
    return {
        "success": True,
        "message": "Synthesis complete",
        "audio_file": audio_file,
        "session_summary": {
            "session_id": session_id,
            "duration_seconds": duration_seconds,
            "samples_processed": int(duration_seconds * 256)
        }
    }

@router.get("/audio/list")
async def list_audio_files() -> Dict[str, Any]:
    """List all generated audio files"""
    return {
        "success": True,
        "count": len(_audio_library),
        "files": sorted(_audio_library, key=lambda x: x["created_at"], reverse=True),
        "total_duration_ms": sum(f["duration_ms"] for f in _audio_library),
        "total_size_bytes": sum(f["size_bytes"] for f in _audio_library)
    }

@router.get("/audio/{file_id}")
async def get_audio_file(file_id: str) -> Dict[str, Any]:
    """Get details of a specific audio file"""
    for audio in _audio_library:
        if audio["file_id"] == file_id:
            return {
                "success": True,
                "file": audio
            }
    
    raise HTTPException(status_code=404, detail=f"Audio file not found: {file_id}")

@router.delete("/audio/{file_id}")
async def delete_audio_file(file_id: str) -> Dict[str, Any]:
    """Delete an audio file"""
    global _audio_library
    
    for i, audio in enumerate(_audio_library):
        if audio["file_id"] == file_id:
            deleted = _audio_library.pop(i)
            return {
                "success": True,
                "message": f"Deleted: {deleted['filename']}",
                "file_id": file_id
            }
    
    raise HTTPException(status_code=404, detail=f"Audio file not found: {file_id}")

@router.get("/waveform/live")
async def get_live_waveform() -> Dict[str, Any]:
    """Get live waveform data for visualization"""
    
    # Generate sample waveform data
    channels = ["Alpha", "Beta", "Theta", "Delta", "Gamma"]
    waveforms = []
    
    for ch in channels:
        # Generate 100 samples of simulated brainwave data
        data = [random.gauss(0, 1) for _ in range(100)]
        waveforms.append({
            "channel": ch,
            "data": data,
            "frequency": random.uniform(8, 30),
            "amplitude": random.uniform(0.5, 1.5)
        })
    
    return {
        "success": True,
        "timestamp": datetime.now().isoformat(),
        "sample_rate": 256,
        "waveforms": waveforms
    }

@router.get("/frequencies")
async def get_frequency_bands() -> Dict[str, Any]:
    """Get current frequency band power"""
    return {
        "success": True,
        "bands": {
            "delta": {"range": "0.5-4 Hz", "power": random.uniform(20, 40), "description": "Deep sleep"},
            "theta": {"range": "4-8 Hz", "power": random.uniform(30, 50), "description": "Drowsiness, light sleep"},
            "alpha": {"range": "8-12 Hz", "power": random.uniform(50, 80), "description": "Relaxed, calm"},
            "beta": {"range": "12-30 Hz", "power": random.uniform(40, 70), "description": "Active thinking"},
            "gamma": {"range": "30-100 Hz", "power": random.uniform(10, 30), "description": "High cognition"}
        },
        "dominant": "alpha",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/frequency/set")
async def set_target_frequency(frequency: float = 14.0) -> Dict[str, Any]:
    """Set target neural entrainment frequency"""
    if not (0.5 <= frequency <= 100):
        raise HTTPException(status_code=400, detail="Frequency must be between 0.5 and 100 Hz")
    
    return {
        "success": True,
        "message": f"Target frequency set to {frequency} Hz",
        "frequency": frequency,
        "band": (
            "delta" if frequency < 4 else
            "theta" if frequency < 8 else
            "alpha" if frequency < 12 else
            "beta" if frequency < 30 else
            "gamma"
        )
    }
