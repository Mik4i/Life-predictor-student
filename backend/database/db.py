import psycopg2
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ─────────────────────────────────────────────────────────────
# Cek lingkungan: apakah berjalan di Render atau Lokal
# Render secara otomatis mengatur environment variable 'RENDER'
# ─────────────────────────────────────────────────────────────
IS_RENDER = os.environ.get("RENDER") is not None

if IS_RENDER:
    # --- RENDER ENVIRONMENT: Gunakan SQLite (File-based) ---
    print("Mendeteksi lingkungan RENDER. Menggunakan SQLite database.")
    # Render Free Tier akan menghapus file ini setiap kali server restart,
    # Namun ini cukup untuk menjalankan aplikasi demo secara online.
    SQLALCHEMY_DATABASE_URL = "sqlite:///./app_life_predictor.db"
    
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

else:
    # --- LOCAL ENVIRONMENT: Gunakan PostgreSQL ---
    # Database connection parameters
    DB_CONFIG = {
        "host": "localhost",
        "port": 5432,
        "user": "hamibaru",
        "password": "12345",
        "dbname": "app AI Life Predictor",
        "client_encoding": "utf8",
    }

    def _get_connection():
        """Membuat koneksi psycopg2 secara langsung (menghindari masalah encoding URL)."""
        return psycopg2.connect(**DB_CONFIG)

    engine = create_engine(
        "postgresql+psycopg2://",
        creator=_get_connection,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
    )

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

