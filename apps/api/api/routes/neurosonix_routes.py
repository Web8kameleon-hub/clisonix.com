from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import json
from datetime import datetime

router = APIRouter()

# NeuroSonix functionality consolidated from app/neurosonix/routes.py
class EEGData(BaseModel):
    channels: Dict[str, List[float]]
    sample_rate: int = 256
    timestamp: str = None

class AudioConversionRequest(BaseModel):
    eeg_data: EEGData
    conversion_type: str = "binaural"
    frequency_range: List[float] = [20, 20000]

class NeuroacousticResponse(BaseModel):
    audio_url: str
    parameters: Dict[str, Any]
    processing_time: float
    timestamp: str

@router.get("/status")
async def get_neurosonix_status():
    """Get NeuroSonix system status"""
    return {
        "status": "online",
        "version": "1.0.0",
        "modules": {
            "eeg_processor": "active",
            "audio_synthesizer": "active", 
            "neuroacoustic_engine": "active"
        },
        "timestamp": datetime.now().isoformat()
    }

@router.post("/neuroacoustic/convert", response_model=NeuroacousticResponse)
async def convert_eeg_to_audio(request: AudioConversionRequest):
    """Convert EEG data to neuroacoustic audio"""
    try:
        # Simulate EEG to audio conversion
        processing_time = 2.5
        
        return NeuroacousticResponse(
            audio_url="/api/neurosonix/audio/generated_audio.wav",
            parameters={
                "conversion_type": request.conversion_type,
                "frequency_range": request.frequency_range,
                "channels_processed": len(request.eeg_data.channels),
                "sample_rate": request.eeg_data.sample_rate
            },
            processing_time=processing_time,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio conversion failed: {str(e)}")

@router.get("/neuroacoustic/stream")
async def stream_neuroacoustic():
    """Stream real-time neuroacoustic audio"""
    return {
        "stream_url": "ws://localhost:8000/api/neurosonix/neuroacoustic/stream",
        "status": "available",
        "protocols": ["websocket", "sse"]
    }

@router.get("/neuroacoustic/status")
async def get_neuroacoustic_status():
    """Get neuroacoustic engine status"""
    return {
        "engine_status": "active",
        "active_conversions": 0,
        "queue_length": 0,
        "last_conversion": datetime.now().isoformat(),
        "supported_formats": ["wav", "mp3", "flac"],
        "max_channels": 64
    }

@router.get("/eeg/channels")
async def get_eeg_channels():
    """Get available EEG channel configuration"""
    return {
        "standard_10_20": [
            "Fp1", "Fp2", "F3", "F4", "C3", "C4", 
            "P3", "P4", "O1", "O2", "F7", "F8", 
            "T3", "T4", "T5", "T6", "Fz", "Cz", "Pz"
        ],
        "high_density": [f"Ch{i}" for i in range(1, 65)],
        "custom": "Configurable up to 256 channels"
    }

@router.post("/eeg/process")
async def process_eeg_data(eeg_data: EEGData):
    """Process raw EEG data"""
    try:
        # Simulate EEG processing
        processed_channels = {}
        for channel, data in eeg_data.channels.items():
            # Simple processing simulation
            processed_channels[channel] = {
                "raw_data_points": len(data),
                "mean_amplitude": sum(data) / len(data) if data else 0,
                "frequency_bands": {
                    "delta": "0.5-4 Hz",
                    "theta": "4-8 Hz", 
                    "alpha": "8-13 Hz",
                    "beta": "13-30 Hz",
                    "gamma": "30-100 Hz"
                }
            }
        
        return {
            "processed_channels": processed_channels,
            "processing_timestamp": datetime.now().isoformat(),
            "sample_rate": eeg_data.sample_rate,
            "quality_score": 0.92
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EEG processing failed: {str(e)}")

@router.get("/audio/formats")
async def get_supported_audio_formats():
    """Get supported audio formats for neuroacoustic conversion"""
    return {
        "input_formats": ["eeg", "csv", "json"],
        "output_formats": ["wav", "mp3", "flac", "ogg"],
        "streaming_formats": ["websocket", "sse", "webrtc"],
        "quality_options": ["low", "medium", "high", "lossless"]
    }