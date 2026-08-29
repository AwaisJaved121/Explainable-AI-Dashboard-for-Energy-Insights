"""Vercel Python entrypoint.

Vercel's Python runtime auto-detects an ASGI app named `app` in this file
and serves it directly (no uvicorn needed). All routing for /predict,
/explain, /model/info etc. lives in backend/main.py; vercel.json rewrites
those paths here. See vercel.json for the includeFiles rule that ships
backend/saved_models/*.pkl with this function.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.main import app  # noqa: E402
