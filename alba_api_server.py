#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ALBA API Server - Live ingestion endpoint for Clisonix Cloud.
Receives frames via HTTP POST and saves them into /data/alba.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="ALBA API Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(r"C:\Clisonix-cloud\data\alba")
DATA_DIR.mkdir(parents=True, exist_ok=True)


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def save_frame(frame: dict[str, object]) -> Path:
    filename = f"frame_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.json"
    target = DATA_DIR / filename
    with target.open("w", encoding="utf-8") as handle:
        json.dump(frame, handle, ensure_ascii=False, indent=2)
    return target


@app.post("/alba/frame", response_model=None)
async def post_frame(request: Request) -> JSONResponse:
    try:
        payload = await request.json()
    except Exception as exc:  # pragma: no cover - input validation
        return JSONResponse({"status": "error", "message": f"Invalid JSON: {exc}"}, status_code=400)

    try:
        saved_path = save_frame(payload)
    except Exception as exc:  # pragma: no cover - filesystem safety
        return JSONResponse({"status": "error", "message": str(exc)}, status_code=500)

    return JSONResponse(
        {
            "status": "ok",
            "message": f"Frame saved at {saved_path}",
            "timestamp": _timestamp(),
        }
    )


@app.get("/alba/latest", response_model=None)
def get_latest() -> JSONResponse:
    try:
        files = sorted(DATA_DIR.glob("frame_*.json"), key=os.path.getmtime, reverse=True)
    except Exception as exc:  # pragma: no cover - glob failure guard
        return JSONResponse({"status": "error", "message": str(exc)}, status_code=500)

    if not files:
        return JSONResponse({"status": "no-data", "message": "No frames found"})

    latest_file = files[0]
    try:
        with latest_file.open("r", encoding="utf-8") as handle:
            frame = json.load(handle)
    except Exception as exc:
        return JSONResponse({"status": "error", "message": f"Failed to read {latest_file.name}: {exc}"}, status_code=500)

    return JSONResponse({"status": "ok", "frame": frame, "file": latest_file.name})


@app.get("/")
def root() -> dict[str, object]:
    return {
        "status": "running",
        "service": "ALBA API Server",
        "endpoint": "/alba/frame",
    }


if __name__ == "__main__":
    port = int(os.getenv("ALBA_API_PORT", 9091))
    uvicorn.run("alba_api_server:app", host="127.0.0.1", port=port, reload=False)
