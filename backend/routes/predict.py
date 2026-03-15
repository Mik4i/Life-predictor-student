"""
predict.py
API routes untuk AI Life Predictor.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.db import get_db
from database.models import PredictionHistory
from schemas.request_schema import (
    LifestyleInput,
    PredictionResponse,
    HistoryResponse,
    HistoryItem,
    HealthResponse,
)
from services.prediction_service import run_prediction

router = APIRouter()


# ─────────────────────────────────────────
# 1. Health Check
# ─────────────────────────────────────────

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Memeriksa apakah backend berjalan normal.",
    tags=["System"],
)
def health_check():
    return {
        "status": "ok",
        "message": "AI Life Predictor Backend berjalan normal.",
        "version": "1.0.0",
    }


# ─────────────────────────────────────────
# 2. Prediksi
# ─────────────────────────────────────────

@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Prediksi Kesejahteraan & Produktivitas",
    description=(
        "Menerima data gaya hidup pengguna dan mengembalikan prediksi:\n"
        "- **mental_prediction**: Good / Fair / Poor\n"
        "- **productivity_prediction**: High / Medium / Low\n"
        "- **burnout_risk**: Low / Medium / High\n"
        "- **burnout_score**: skor 0.0–1.0\n"
        "- **recommendation**: kalimat saran personal"
    ),
    tags=["Prediksi"],
)
def predict_lifestyle(
    input_data: LifestyleInput,
    db: Session = Depends(get_db),
):
    """
    Endpoint utama: POST /predict

    Menerima data lifestyle, menjalankan model ML,
    menyimpan hasil ke database, dan mengembalikan prediksi.
    """
    try:
        result = run_prediction(input_data.model_dump(), db)
        return result
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model ML belum tersedia: {str(e)}. Jalankan train_model.py terlebih dahulu.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kesalahan saat memproses prediksi: {str(e)}",
        )


# ─────────────────────────────────────────
# 3. Histori Prediksi
# ─────────────────────────────────────────

@router.get(
    "/history/{user_id}",
    response_model=HistoryResponse,
    summary="Histori Prediksi User",
    description="Mengambil histori prediksi berdasarkan user_id.",
    tags=["Histori"],
)
def get_history(
    user_id: str,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """
    Endpoint: GET /history/{user_id}

    Mengembalikan daftar prediksi historis untuk user tertentu.
    Query parameter `limit` (default 20) untuk membatasi jumlah record.
    """
    records = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.user_id == user_id)
        .order_by(PredictionHistory.predicted_at.desc())
        .limit(limit)
        .all()
    )

    return {
        "user_id": user_id,
        "total_predictions": len(records),
        "history": records,
    }


# ─────────────────────────────────────────
# 4. Semua Histori (Admin view)
# ─────────────────────────────────────────

@router.get(
    "/history",
    summary="Semua Histori Prediksi",
    description="Mengambil semua histori prediksi (limit default 50).",
    tags=["Histori"],
)
def get_all_history(
    limit: int = 50,
    db: Session = Depends(get_db),
):
    records = (
        db.query(PredictionHistory)
        .order_by(PredictionHistory.predicted_at.desc())
        .limit(limit)
        .all()
    )
    return {
        "total": len(records),
        "data": [
            {
                "id": r.id,
                "user_id": r.user_id,
                "mental_prediction": r.mental_prediction,
                "productivity_prediction": r.productivity_prediction,
                "burnout_risk": r.burnout_risk,
                "burnout_score": r.burnout_score,
                "predicted_at": r.predicted_at,
            }
            for r in records
        ],
    }
