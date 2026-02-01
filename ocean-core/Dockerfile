FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy Ocean-Core source code only
COPY . /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt 2>/dev/null || \
    pip install --no-cache-dir fastapi uvicorn httpx pydantic redis aiohttp numpy requests

# Environment variable for port
ENV OCEAN_PORT=8030

# Expose port
EXPOSE 8030

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8030/health || exit 1

# Start ASI-Lite API
CMD ["python", "asi_lite_server.py"]
