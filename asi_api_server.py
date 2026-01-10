#!/usr/bin/env python3
"""ASI Realtime Engine API Server"""
from fastapi import FastAPI
from asi_core import ASICore
import uvicorn

app = FastAPI(title="ASI Engine", version="1.0.0")
asi = ASICore()

@app.get("/health")
def health():
    return {"status": "operational", "engine": "ASI Realtime"}

@app.get("/status")
def status():
    return asi.get_realtime_status()

@app.get("/metrics")
def metrics():
    return asi.realtime_engine.collect_metrics()

@app.get("/nodes")
def nodes():
    return asi.nodes

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9094)
