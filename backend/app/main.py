from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
