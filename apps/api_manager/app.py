from fastapi import FastAPI

app = FastAPI(title="api_manager")


@app.get("/status")
def status():
    return {"app": "api_manager", "status": "ok"}


if __name__ == "__main__":
    # simple local runner
    import uvicorn
    uvicorn.run("apps.api_manager.app:app", host="0.0.0.0", port=8101, log_level="info")
