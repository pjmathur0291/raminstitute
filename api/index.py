"""
Vercel serverless entrypoint — re-exports the FastAPI app from backend/server.py.
Vercel looks for a top-level variable named `app` in api/index.py.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from server import app  # noqa: F401, E402
