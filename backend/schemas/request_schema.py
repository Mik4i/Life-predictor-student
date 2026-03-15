from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


# ─────────────────────────────────────────────
# REQUEST BODY
# ─────────────────────────────────────────────

class LifestyleInput(BaseModel):
    """Input data dari user untuk prediksi AI Life Predictor."""
    user_id: str = Field(..., description="ID pengguna", example="user_001")

    # From data_lifestyle / data_burnout
    age: int = Field(..., ge=10, le=100, description="Usia", example=20)
    gender: str = Field(..., description="Jenis kelamin: Male/Female", example="Male")
    cgpa: float = Field(..., ge=0.0, le=4.0, description="IPK / CGPA", example=3.2)
    sleep_hours: float = Field(..., ge=0.0, le=24.0, description="Jam tidur per hari", example=7.0)
    study_hours: float = Field(..., ge=0.0, le=24.0, description="Jam belajar per hari", example=5.0)
    social_media_hours: float = Field(..., ge=0.0, le=24.0, description="Jam media sosial per hari", example=3.0)
    physical_activity_minutes: float = Field(..., ge=0.0, le=600.0, description="Menit olahraga per hari", example=30.0)
    screen_time_hours: float = Field(..., ge=0.0, le=24.0, description="Total screen time per hari", example=6.0)

    # Stress & mental indicators
    stress_level: str = Field(..., description="Tingkat stres: Low/Medium/High", example="Medium")
    anxiety_score: int = Field(..., ge=0, le=10, description="Skor kecemasan (0-10)", example=5)
    depression_score: int = Field(..., ge=0, le=10, description="Skor depresi (0-10)", example=4)
    social_support_score: int = Field(..., ge=0, le=10, description="Dukungan sosial (0-10)", example=6)

    # Productivity indicators
    phone_usage_hours: float = Field(..., ge=0.0, le=24.0, description="Jam pemakaian HP per hari", example=4.0)
    gaming_hours: float = Field(default=0.0, ge=0.0, le=24.0, description="Jam gaming per hari", example=1.0)
    breaks_per_day: int = Field(..., ge=0, le=20, description="Jumlah istirahat per hari", example=3)
    assignments_completed: int = Field(..., ge=0, description="Tugas yang diselesaikan per minggu", example=5)

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v):
        if v.lower() not in ["male", "female", "laki-laki", "perempuan"]:
            raise ValueError("gender harus 'Male' atau 'Female'")
        return v.capitalize()

    @field_validator("stress_level")
    @classmethod
    def validate_stress(cls, v):
        valid = ["low", "medium", "high"]
        if v.lower() not in valid:
            raise ValueError("stress_level harus Low, Medium, atau High")
        return v.capitalize()


# ─────────────────────────────────────────────
# RESPONSE SCHEMAS
# ─────────────────────────────────────────────

class PredictionResponse(BaseModel):
    """Response dari endpoint prediksi."""
    user_id: str
    mental_prediction: str          # "Good" / "Fair" / "Poor"
    productivity_prediction: str    # "High" / "Medium" / "Low"
    burnout_risk: str               # "Low" / "Medium" / "High"
    burnout_score: float            # 0.0 - 1.0
    mental_confidence: float        # probabilitas prediksi mental (0-1)
    productivity_confidence: float  # probabilitas prediksi produktivitas (0-1)
    recommendation: str             # kalimat saran singkat
    predicted_at: str               # ISO timestamp


class HistoryItem(BaseModel):
    """Satu item histori prediksi."""
    id: int
    user_id: str
    mental_prediction: Optional[str]
    productivity_prediction: Optional[str]
    burnout_risk: Optional[str]
    burnout_score: Optional[float]
    predicted_at: Optional[datetime]

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    """Response daftar histori prediksi user."""
    user_id: str
    total_predictions: int
    history: list[HistoryItem]


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    message: str
    version: str
