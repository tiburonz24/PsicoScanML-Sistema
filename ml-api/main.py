from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import clasificacion

app = FastAPI(
    title="PsicoScan ML - API de Clasificacion",
    description="Modelo de Machine Learning para tamizaje psicologico estudiantil (SENA)",
    version="1.0.0",
)

import os

_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
_origins = [o.strip() for o in _raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clasificacion.router, prefix="/api/v1", tags=["clasificacion"])


@app.get("/")
def root():
    return {"status": "ok", "mensaje": "PsicoScan ML API activa"}


@app.get("/health")
def health():
    return {"status": "healthy"}
