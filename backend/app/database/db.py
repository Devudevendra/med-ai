import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ── Database URL ───────────────────────────────────────────────────────────────
# Priority:
#   1. DATABASE_URL env var  → PostgreSQL on Render/Railway
#   2. /data dir available   → SQLite in HF Spaces persistent storage
#   3. Fallback              → local SQLite for development
if os.environ.get("DATABASE_URL"):
    DATABASE_URL = os.environ["DATABASE_URL"]
    # Render/Railway use "postgres://" but SQLAlchemy needs "postgresql://"
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
elif os.path.isdir("/data"):
    # Hugging Face Spaces — use /data for persistence
    DATABASE_URL = "sqlite:////data/medical.db"
else:
    # Local development
    DATABASE_URL = "sqlite:///./medical.db"

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()