FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy ocean-core and apps/api (for Location Labs Engine)
COPY ocean-core/ /app/
COPY apps/api/ /app/apps/api/

# Create __init__.py for apps package
RUN mkdir -p /app/apps && touch /app/apps/__init__.py && touch /app/apps/api/__init__.py

# Install Python dependencies
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn==0.24.0 \
    httpx==0.25.0 \
    cbor2==5.4.6

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8030/health || exit 1

# Run Ocean Core with 14 Expert Personas
CMD ["python", "-m", "uvicorn", "ocean_api_minimal:app", "--host", "0.0.0.0", "--port", "8030"]
