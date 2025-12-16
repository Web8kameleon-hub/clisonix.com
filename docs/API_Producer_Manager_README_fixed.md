# API Producer & Manager (starter)

This folder contains two minimal FastAPI-based stubs:

- `apps/api_producer/producer.py` — a small service to register and publish API metadata.
- `apps/api_manager/manager.py` — a small catalog/manager that pulls published APIs and can apply simple policies.

## Quick start (requires Python 3.8+ and uvicorn)

1. Create a virtual environment and install dependencies:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install fastapi uvicorn requests
```

2.-Run producer:

```powershell
uvicorn apps.api_producer.producer:app --reload --port 8001
```

3.- Run manager:

```powershell
uvicorn apps.api_manager.manager:app --reload --port 8002
```

4.- Use the manager to sync published APIs from the producer:

Use the POST endpoint `http://localhost:8002/sync_from_producer` with JSON body:

```json
{ "producer_url": "http://localhost:8001" }
```

## Notes

- These are in-memory stubs suitable for POC and development. Replace the in-memory stores with a DB (Postgres) for production.
- Add authentication (Keycloak/Ory) and gateway integration (Kong/APISIX) when promoting to production.
