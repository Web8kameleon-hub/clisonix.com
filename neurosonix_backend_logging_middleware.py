# -*- coding: utf-8 -*-
"""
Middleware për logim me ngjyra në çdo kërkesë FastAPI
Business: Ledjan Ahmati - WEB8euroweb GmbH
"""

import time
from typing import Callable, Awaitable

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from neurosonix.colored_logger import setup_logger

logger = setup_logger("NeuroSonixBackend")


class ColoredLoggingMiddleware(BaseHTTPMiddleware):
    """Shfaq kërkesat dhe përgjigjet me ngjyra sipas statusit."""

    def __init__(self, app: ASGIApp, get_response: Callable | None = None) -> None:
        super().__init__(app, dispatch=get_response)

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable]):
        start = time.time()
        method = request.method
        path = request.url.path
        client = request.client.host if request.client else "unknown"

        logger.info("➡️  %s %s (from %s)", method, path, client)
        try:
            response = await call_next(request)
        except Exception as exc:  # pragma: no cover - runtime safety
            logger.error("💥 Exception in %s %s: %s", method, path, exc)
            raise

        duration_ms = (time.time() - start) * 1000
        status = response.status_code

        if 200 <= status < 300:
            logger.info("✅ %s %s %s | %.1fms", status, method, path, duration_ms)
        elif 400 <= status < 500:
            logger.warning("⚠️ %s %s %s | %.1fms", status, method, path, duration_ms)
        else:
            logger.error("❌ %s %s %s | %.1fms", status, method, path, duration_ms)

        return response


__all__ = ["ColoredLoggingMiddleware"]
