#!/usr/bin/env python3
"""Cycle Engine API Server"""
from fastapi import FastAPI
from cycle_engine import CycleEngine, CycleDefinition
import uvicorn

app = FastAPI(title="Cycle Engine", version="1.0.0")
engine = CycleEngine()

@app.get("/health")
def health():
    return {"status": "operational", "engine": "Cycle Engine", "active_cycles": engine.metrics.get("active_cycles", 0)}

@app.get("/cycles")
def list_cycles():
    return {"cycles": list(engine.cycles.keys()), "total": len(engine.cycles)}

@app.post("/cycles/create")
def create_cycle(domain: str = "general", task: str = "monitor"):
    cycle_def = engine.create_cycle(domain=domain, task=task)
    return {"created": cycle_def.cycle_id, "status": "registered"}

@app.get("/metrics")
def get_metrics():
    return engine.metrics

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9095)
