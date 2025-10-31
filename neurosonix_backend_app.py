# -*- coding: utf-8 -*-
"""Shembull përdorimi për ColoredLoggingMiddleware."""

from fastapi import FastAPI

from neurosonix_backend_logging_middleware import ColoredLoggingMiddleware

app = FastAPI(
    title="NeuroSonix Industrial Backend (REAL)",
    version="1.0.0",
)

app.add_middleware(ColoredLoggingMiddleware)


@app.get("/health")
async def health():
    return {"ok": True}


@app.get("/status")
async def status():
    return {"system": "stable"}
