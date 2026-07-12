from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import dna, health, protein
from app.config import get_settings
from app.db import init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Strand API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST"],
    # X-Client-Id is a custom header; it must be allowed or browser preflight
    # blocks every POST from the frontend.
    allow_headers=["X-Client-Id", "Content-Type"],
)

app.include_router(health.router)
app.include_router(protein.router)
app.include_router(dna.router)

# Serve the built frontend from this same service in production, so the app and
# the API share an origin (no CORS, no API base URL to configure). Must be
# mounted AFTER the routers above — a mount at "/" would otherwise shadow /api.
# html=True makes unknown paths fall back to index.html.
if settings.static_dir:
    static_path = Path(settings.static_dir)
    if static_path.is_dir():
        app.mount("/", StaticFiles(directory=static_path, html=True), name="static")
