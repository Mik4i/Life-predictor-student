import psycopg2
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

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

