"""
PythonAnywhere WSGI entry point for FastAPI (ASGI→WSGI bridge).
Edit the USERNAME and API key below, then paste this into your
PythonAnywhere WSGI configuration file.
"""
import sys
import os

# ── 1. Set your environment variables here ───────────────────
os.environ["GEMINI_API_KEY"]  = "PASTE_YOUR_GEMINI_KEY_HERE"
os.environ["FRONTEND_URL"]    = "https://med-ai-brown.vercel.app"

# ── 2. Add project root to Python path ───────────────────────
# Replace YOUR_USERNAME with your PythonAnywhere username
PROJECT_PATH = "/home/YOUR_USERNAME/med-ai"
if PROJECT_PATH not in sys.path:
    sys.path.insert(0, PROJECT_PATH)

# ── 3. Wrap FastAPI (ASGI) → WSGI for PythonAnywhere ─────────
from a2wsgi import ASGIMiddleware
from main import app as fastapi_app

application = ASGIMiddleware(fastapi_app)
