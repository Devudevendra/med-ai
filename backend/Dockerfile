# ── Base image ────────────────────────────────────────────────
FROM python:3.11-slim

# ── Working directory ─────────────────────────────────────────
WORKDIR /app

# ── Install dependencies ──────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy source code ──────────────────────────────────────────
COPY . .

# ── Create data directory for SQLite ─────────────────────────
RUN mkdir -p /data && chmod 777 /data

# ── Port (Fly.io uses 8080 by default) ───────────────────────
EXPOSE 8080

# ── Start FastAPI — PORT env var injected by Fly.io ──────────
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
