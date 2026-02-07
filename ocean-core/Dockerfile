FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl ffmpeg && rm -rf /var/lib/apt/lists/*

# Kopjo nanogrid + prompts + identity loader + documents
COPY ocean_nanogrid.py prompts.py requirements-lite.txt identity_loader.py ./
COPY documents/ ./documents/

# Krijo folder për config (do të montohet si volume)
RUN mkdir -p /app/config

RUN pip install --no-cache-dir -r requirements-lite.txt

ENV OCEAN_PORT=8030
EXPOSE 8030

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:8030/health || exit 1

CMD ["python", "ocean_nanogrid.py"]
