"""
Curiosity Ocean Module
======================
Core conversational intelligence for Clisonix Platform.
Version 3.1.0 - 11 Layers Architecture (Stable)
"""

from .curiosity_ocean_prompt import (
    CURIOSITY_OCEAN_SYSTEM_PROMPT,
    DESIRE_LAYER,
    REALISM_LAYER,
    EMOTION_LAYER,
    FEELING_LAYER,
    STABILITY_LAYER,
    FOCUS_LAYER,
    SAFETY_LAYER,
    TECHNICAL_BOUNDARIES_LAYER,  # NEW
    ADAPTIVE_LAYER,
    CONTEXT_CLEANER_LAYER,       # NEW
    IDENTITY_LAYER
)

__all__ = [
    "CURIOSITY_OCEAN_SYSTEM_PROMPT",
    "DESIRE_LAYER",
    "REALISM_LAYER", 
    "EMOTION_LAYER",
    "FEELING_LAYER",
    "STABILITY_LAYER",
    "FOCUS_LAYER",
    "SAFETY_LAYER",
    "TECHNICAL_BOUNDARIES_LAYER",
    "ADAPTIVE_LAYER",
    "CONTEXT_CLEANER_LAYER",
    "IDENTITY_LAYER"
]
