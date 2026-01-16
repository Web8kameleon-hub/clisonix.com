"""
CLISONIX EXCEL CORE API
========================
API ekskluzive për Excel Dashboard
Port: 8010
Plotësisht e izoluar - pa konflikt!
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import subprocess
import psutil
import json
import os

app = FastAPI(
    title="Clisonix Excel Core",
    description="API ekskluzive për Excel Dashboard - Isolated",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_docker_cmd(cmd):
    """Run docker command safely"""
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=10
        )
        return result.stdout.strip()
    except:
        return ""

@app.get("/")
async def root():
    return {
        "service": "Clisonix Excel Core",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": [
            "/health",
            "/api/reporting/system-metrics",
            "/api/reporting/docker-containers",
            "/api/reporting/docker-stats"
        ]
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "excel-core",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/reporting/system-metrics")
async def system_metrics():
    """Real system metrics"""
    return {
        "cpu_percent": psutil.cpu_percent(interval=0.1),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage("/").percent,
        "memory_total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
        "disk_total_gb": round(psutil.disk_usage("/").total / (1024**3), 2),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/reporting/docker-containers")
async def docker_containers():
    """Get all Docker containers"""
    output = run_docker_cmd("docker ps -a --format '{{.Names}}|{{.Status}}|{{.Image}}|{{.CreatedAt}}|{{.Ports}}'")
    
    containers = []
    for line in output.split("\n"):
        if "|" in line:
            parts = line.split("|")
            if len(parts) >= 4:
                containers.append({
                    "name": parts[0],
                    "status": parts[1],
                    "image": parts[2],
                    "created": parts[3],
                    "ports": parts[4] if len(parts) > 4 else ""
                })
    
    return {
        "containers": containers,
        "total": len(containers),
        "running": len([c for c in containers if "Up" in c["status"]]),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/reporting/docker-stats")
async def docker_stats():
    """Get Docker container stats"""
    output = run_docker_cmd("docker stats --no-stream --format '{{.Name}}|{{.CPUPerc}}|{{.MemPerc}}|{{.MemUsage}}'")
    
    stats = []
    for line in output.split("\n"):
        if "|" in line:
            parts = line.split("|")
            if len(parts) >= 4:
                stats.append({
                    "name": parts[0],
                    "cpu_percent": parts[1],
                    "memory_percent": parts[2],
                    "memory_usage": parts[3]
                })
    
    return {
        "stats": stats,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
