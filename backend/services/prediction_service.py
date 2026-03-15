"""
prediction_service.py
Service layer yang menghubungkan input user, preprocessing, dan model ML.
"""

import os
import joblib
import numpy as np
from datetime import datetime, timezone
from sqlalchemy.orm import Session
import requests

from utils.preprocessing import (
    preprocess_for_mental_model,
    preprocess_for_productivity_model,
    calculate_burnout_score,
    get_burnout_risk_label,
    generate_recommendation,
)
from database.models import PredictionHistory

# Dapatkan direktori absolut script
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MENTAL_MODEL_PATH = os.path.join(MODELS_DIR, "mental_model.pkl")
PRODUCTIVITY_MODEL_PATH = os.path.join(MODELS_DIR, "productivity_model.pkl")


MENTAL_MODEL_URL = "https://huggingface.co/mik412/Life-Predictor-Models/resolve/main/mental_model.pkl?download=true"
PRODUCTIVITY_MODEL_URL = "https://huggingface.co/mik412/Life-Predictor-Models/resolve/main/productivity_model.pkl?download=true"

# ─────────────────────────────────────────────
# Load Model (Singleton — load sekali saat startup)
# ─────────────────────────────────────────────

_mental_package = None
_productivity_package = None

def download_file(url: str, dest_path: str):
    """Download a file from an URL to a destination path."""
    print(f"Mengunduh model dari {url}...")
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        with open(dest_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Berhasil mengunduh dan menyimpan ke {dest_path}")
    except Exception as e:
        print(f"Gagal mengunduh model: {e}")
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise e


def load_models():
    """Load model ML dari file .pkl. Jika belum ada, download dari cloud (Hugging Face)."""
    global _mental_package, _productivity_package

    if _mental_package is None:
        if not os.path.exists(MENTAL_MODEL_PATH):
            print(f"Model mental tidak ditemukan lokal. Mencoba download...")
            os.makedirs(MODELS_DIR, exist_ok=True)
            download_file(MENTAL_MODEL_URL, MENTAL_MODEL_PATH)
            
        _mental_package = joblib.load(MENTAL_MODEL_PATH)

    if _productivity_package is None:
        if not os.path.exists(PRODUCTIVITY_MODEL_PATH):
            print(f"Model produktivitas tidak ditemukan lokal. Mencoba download...")
            os.makedirs(MODELS_DIR, exist_ok=True)
            download_file(PRODUCTIVITY_MODEL_URL, PRODUCTIVITY_MODEL_PATH)
            
        _productivity_package = joblib.load(PRODUCTIVITY_MODEL_PATH)


def _predict_with_package(package: dict, feature_array: np.ndarray):
    """Jalankan prediksi dan kembalikan label + confidence score."""
    model = package["model"]
    feature_names = package["feature_names"]

    # Pastikan jumlah fitur sesuai
    n_expected = len(feature_names)
    n_given = feature_array.shape[1]

    if n_given != n_expected:
        # Pad atau trim fitur jika ada mismatch (robustness)
        if n_given < n_expected:
            pad = np.zeros((1, n_expected - n_given))
            feature_array = np.hstack([feature_array, pad])
        else:
            feature_array = feature_array[:, :n_expected]

    prediction = model.predict(feature_array)[0]
    probabilities = model.predict_proba(feature_array)[0]
    confidence = float(np.max(probabilities))

    return prediction, confidence


# ─────────────────────────────────────────────
# Main Prediction Function
# ─────────────────────────────────────────────

def run_prediction(input_data: dict, db: Session) -> dict:
    """
    Menjalankan seluruh pipeline prediksi:
    1. Load model
    2. Preprocess input
    3. Prediksi mental wellness & produktivitas
    4. Hitung burnout score
    5. Simpan histori ke database
    6. Return hasil

    Args:
        input_data: dict dari LifestyleInput.model_dump()
        db: SQLAlchemy session

    Returns:
        dict hasil prediksi lengkap
    """
    load_models()

    # ── Preprocess input ──
    X_mental = preprocess_for_mental_model(input_data)
    X_productivity = preprocess_for_productivity_model(input_data)

    # ── Run models ──
    mental_pred, mental_conf = _predict_with_package(_mental_package, X_mental)
    productivity_pred, prod_conf = _predict_with_package(_productivity_package, X_productivity)

    # ── Hitung burnout score ──
    burnout_score = calculate_burnout_score(input_data, mental_pred, productivity_pred)
    burnout_risk = get_burnout_risk_label(burnout_score)

    # ── Generate rekomendasi ──
    recommendation = generate_recommendation(mental_pred, productivity_pred, burnout_risk)

    # ── Simpan ke database ──
    now = datetime.now(timezone.utc)
    history_entry = PredictionHistory(
        user_id=input_data.get("user_id", "anonymous"),
        mental_prediction=mental_pred,
        productivity_prediction=productivity_pred,
        burnout_risk=burnout_risk,
        burnout_score=burnout_score,
        input_snapshot=input_data,
        predicted_at=now,
    )
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)

    return {
        "user_id": input_data.get("user_id"),
        "mental_prediction": mental_pred,
        "productivity_prediction": productivity_pred,
        "burnout_risk": burnout_risk,
        "burnout_score": burnout_score,
        "mental_confidence": round(mental_conf, 3),
        "productivity_confidence": round(prod_conf, 3),
        "recommendation": recommendation,
        "predicted_at": now.isoformat(),
    }
