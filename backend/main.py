"""
main.py
Entry point aplikasi FastAPI untuk AI Life Predictor Backend.
Jalankan dengan:
    uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import engine
from database.models import Base
from routes.predict import router

# ─────────────────────────────────────────────
# Inisialisasi FastAPI App
# ─────────────────────────────────────────────

app = FastAPI(
    title="AI Life Predictor API",
    description=(
        "Backend API untuk **AI Life Predictor** — sistem machine learning "
        "yang menganalisis pola kebiasaan harian mahasiswa untuk memprediksi "
        "kondisi kesejahteraan mental dan produktivitas.\n\n"
        "## Endpoint Utama\n"
        "- `POST /predict` — Prediksi mental wellness & produktivitas\n"
        "- `GET /history/{user_id}` — Histori prediksi per user\n"
        "- `GET /health` — Status kesehatan sistem"
    ),
    version="1.0.0",
    contact={
        "name": "AI Life Predictor Team",
    },
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────────
# CORS Middleware (izinkan akses dari frontend)
# ─────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Ganti dengan URL frontend saat production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Buat tabel di database saat startup
# ─────────────────────────────────────────────

@app.on_event("startup")
def create_tables():
    """Buat tabel baru (prediction_history) jika belum ada."""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables ready.")


# ─────────────────────────────────────────────
# Register Routes
# ─────────────────────────────────────────────

app.include_router(router, prefix="")


# ─────────────────────────────────────────────
# Root endpoint
# ─────────────────────────────────────────────

@app.get("/", tags=["System"])
def root():
    return {
        "app": "AI Life Predictor API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "predict": "/predict",
    }
