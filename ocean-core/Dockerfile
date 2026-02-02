FROM python:3.13-slim

WORKDIR /app

# Minimal system deps
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy only needed files
COPY ocean_super_lite.py requirements-lite.txt ./

# Install minimal deps
RUN pip install --no-cache-dir -r requirements-lite.txt

ENV OCEAN_PORT=8030
EXPOSE 8030

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:8030/health || exit 1

CMD ["python", "ocean_super_lite.py"]
