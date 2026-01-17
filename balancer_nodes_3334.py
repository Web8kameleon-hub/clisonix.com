#!/usr/bin/env python3
"""
BALANCER NODES SERVICE (Port 3334)
Python-based node discovery and load distribution
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
import socket

# Initialize FastAPI
app = FastAPI(
    title="Balancer Nodes (Python)",
    description="Node discovery and load distribution",
    version="1.0.0"
)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Node registry
NODE_REGISTRY: Dict[str, Dict[str, Any]] = {}
REQUEST_COUNT = 0
SERVICE_START = datetime.now(timezone.utc).isoformat()


@app.post("/api/nodes/register")
async def register_node(nodeId: str, type: Optional[str] = None, port: Optional[int] = None, 
                       host: Optional[str] = None, metadata: Optional[Dict] = None):
    """Register a new node"""
    global REQUEST_COUNT
    REQUEST_COUNT += 1
    
    if not nodeId:
        raise HTTPException(status_code=400, detail="nodeId required")
    
    node_data = {
        "nodeId": nodeId,
        "type": type or "unknown",
        "port": port,
        "host": host or socket.gethostname(),
        "status": "active",
        "registeredAt": datetime.now(timezone.utc).isoformat(),
        "lastHeartbeat": datetime.now(timezone.utc).isoformat(),
        "metadata": metadata or {},
        "requestCount": 0,
        "loadFactor": 0.0
    }
    
    NODE_REGISTRY[nodeId] = node_data
    print(f"[{datetime.now().isoformat()}] Node registered: {nodeId}")
    
    return {
        "success": True,
        "message": f"Node {nodeId} registered",
        "node": node_data
    }


@app.get("/api/nodes")
async def get_nodes():
    """Get all registered nodes"""
    global REQUEST_COUNT
    REQUEST_COUNT += 1
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "totalNodes": len(NODE_REGISTRY),
        "nodes": list(NODE_REGISTRY.values())
    }


@app.get("/api/nodes/{nodeId}")
async def get_node(nodeId: str):
    """Get specific node"""
    global REQUEST_COUNT
    REQUEST_COUNT += 1
    
    if nodeId not in NODE_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Node {nodeId} not found")
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "node": NODE_REGISTRY[nodeId]
    }


@app.put("/api/nodes/{nodeId}/status")
async def update_node_status(nodeId: str, status: str = "active", load: Optional[float] = None):
    """Update node status and load"""
    global REQUEST_COUNT
    REQUEST_COUNT += 1
    
    if nodeId not in NODE_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Node {nodeId} not found")
    
    node = NODE_REGISTRY[nodeId]
    node["status"] = status
    node["lastHeartbeat"] = datetime.now(timezone.utc).isoformat()
    node["requestCount"] += 1
    if load is not None:
        node["loadFactor"] = load
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "message": f"Node {nodeId} updated",
        "node": node
    }


@app.get("/api/load-balance")
async def get_load_balance():
    """Get load balancing recommendations"""
    global REQUEST_COUNT
    REQUEST_COUNT += 1
    
    if not NODE_REGISTRY:
        return {"timestamp": datetime.now(timezone.utc).isoformat(), "recommendation": "No nodes available"}
    
    sorted_nodes = sorted(
        NODE_REGISTRY.values(),
        key=lambda x: x.get("loadFactor", 0)
    )
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "recommended_node": sorted_nodes[0] if sorted_nodes else None,
        "all_nodes_sorted": sorted_nodes
    }


@app.get("/health")
async def health():
    """Health check"""
    global REQUEST_COUNT
    REQUEST_COUNT += 1
    
    return {
        "status": "healthy",
        "service": "balancer-nodes-3334",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_since": SERVICE_START,
        "requests_served": REQUEST_COUNT,
        "activeNodes": len(NODE_REGISTRY)
    }


@app.get("/info")
async def info():
    """Service information"""
    global REQUEST_COUNT
    REQUEST_COUNT += 1
    
    return {
        "service": "Balancer Nodes (Python)",
        "port": 3334,
        "type": "node-discovery",
        "version": "1.0.0",
        "started_at": SERVICE_START,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "endpoints": {
            "POST /api/nodes/register": "Register new node",
            "GET /api/nodes": "List all nodes",
            "GET /api/nodes/:nodeId": "Get specific node",
            "PUT /api/nodes/:nodeId/status": "Update node status",
            "GET /api/load-balance": "Get load balancing recommendation",
            "GET /health": "Health check",
            "GET /info": "Service info"
        }
    }


if __name__ == "__main__":
    port = int(os.getenv("BALANCER_NODES_PORT", "3334"))
    host = os.getenv("BALANCER_NODES_HOST", "0.0.0.0")
    
    print(f"\n{'='*60}")
    print(f"  BALANCER NODES SERVICE (Python)")
    print(f"  Listening on {host}:{port}")
    print(f"  Node discovery & load distribution")
    print(f"{'='*60}\n")
    
    uvicorn.run(app, host=host, port=port, log_level="info")
