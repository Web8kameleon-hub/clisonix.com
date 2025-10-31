"""
Legacy entry point for the NeuroSonix audio synthesizer.
This module mirrors `apps.api.neurosonix.audio_synthesizer` so that
historical imports continue to work after the monorepo re-structure.
"""

from apps.api.neurosonix.audio_synthesizer import AudioSynthesizer

__all__ = ["AudioSynthesizer"]

