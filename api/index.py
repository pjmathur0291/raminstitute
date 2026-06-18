"""
Vercel serverless entrypoint — exports FastAPI app from backend/server.py.
"""
import sys
import traceback
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Ensure backend/ is importable
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

try:
    from server import app  # noqa: F401
except Exception as exc:  # pragma: no cover — surfaces import errors in Vercel logs
    traceback.print_exc()
    app = FastAPI(title="RIHM API (startup error)")

    @app.get("/api/")
    @app.get("/api")
    async def startup_error():
        return JSONResponse(
            status_code=503,
            content={
                "service": "RIHM API",
                "status": "error",
                "detail": str(exc),
                "hint": "Check Vercel env vars: MONGO_URL, DB_NAME, and function logs.",
            },
        )
