from sqlalchemy import Column, Integer, String, Numeric, Float, DateTime, Text, JSON
from sqlalchemy.sql import func
from database.db import Base


class DataBurnout(Base):
    """
    Tabel data_burnout — data burnout mahasiswa
    Kolom asli dari database.
    """
    __tablename__ = "data_burnout"

    id = Column(Integer, primary_key=True, autoincrement=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    daily_study_hours = Column(Numeric(4, 2), nullable=True)
    daily_sleep_hours = Column(Numeric(4, 2), nullable=True)
    screen_time_hours = Column(Numeric(4, 2), nullable=True)
    stress_level = Column(String(20), nullable=True)        # e.g. "Low", "Medium", "High"
    anxiety_score = Column(Integer, nullable=True)
    depression_score = Column(Integer, nullable=True)
    academic_pressure_score = Column(Integer, nullable=True)
    financial_stress_score = Column(Integer, nullable=True)
    social_support_score = Column(Integer, nullable=True)
    physical_activity_hours = Column(Numeric(4, 2), nullable=True)
    sleep_quality = Column(String(20), nullable=True)        # e.g. "Good", "Poor"
    attendance_percentage = Column(Numeric(5, 2), nullable=True)
    cgpa = Column(Numeric(4, 2), nullable=True)
    internet_quality = Column(String(20), nullable=True)
    burnout_level = Column(String(20), nullable=True)        # Target: "Low", "Medium", "High"


class DataLifestyle(Base):
    """
    Tabel data_lifestyle — data gaya hidup mahasiswa
    """
    __tablename__ = "data_lifestyle"

    id = Column(Integer, primary_key=True, autoincrement=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)
    cgpa = Column(Numeric(3, 2), nullable=True)
    sleep_duration = Column(Numeric(4, 2), nullable=True)
    study_hours = Column(Numeric(4, 2), nullable=True)
    social_media_hours = Column(Numeric(4, 2), nullable=True)
    physical_activity = Column(Integer, nullable=True)       # minutes/week or times/week


class DataMental(Base):
    """
    Tabel data_mental — data kesehatan mental mahasiswa
    """
    __tablename__ = "data_mental"

    id = Column(Integer, primary_key=True, autoincrement=True)
    gender = Column(String(10), nullable=True)
    age = Column(Integer, nullable=True)
    cgpa = Column(String(20), nullable=True)                 # stored as range e.g. "3.00-3.49"
    marital_status = Column(String(5), nullable=True)        # "Yes"/"No"
    do_you_have_depression = Column(String(5), nullable=True)
    do_you_have_anxiety = Column(String(5), nullable=True)
    do_you_have_panic_attack = Column(String(5), nullable=True)
    did_you_seek_any_specialist_for_a_treatment = Column(String(5), nullable=True)

    __table_args__ = {"extend_existing": True}


class DataProductivity(Base):
    """
    Tabel data_productivity — data produktivitas mahasiswa
    """
    __tablename__ = "data_productivity"

    id = Column(Integer, primary_key=True, autoincrement=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)
    study_hours_per_day = Column(Numeric(4, 2), nullable=True)
    sleep_hours = Column(Numeric(4, 2), nullable=True)
    phone_usage_hours = Column(Numeric(4, 2), nullable=True)
    social_media_hours = Column(Numeric(4, 2), nullable=True)
    youtube_hours = Column(Numeric(4, 2), nullable=True)
    gaming_hours = Column(Numeric(4, 2), nullable=True)
    breaks_per_day = Column(Integer, nullable=True)
    coffee_intake_mg = Column(Integer, nullable=True)
    exercise_minutes = Column(Integer, nullable=True)
    assignments_completed = Column(Integer, nullable=True)
    attendance_percentage = Column(Numeric(5, 2), nullable=True)


class PredictionHistory(Base):
    """
    Tabel histori prediksi — dibuat baru oleh backend
    """
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, index=True)
    mental_prediction = Column(String(20), nullable=True)         # "Good" / "Fair" / "Poor"
    productivity_prediction = Column(String(20), nullable=True)   # "High" / "Medium" / "Low"
    burnout_risk = Column(String(20), nullable=True)              # "Low" / "Medium" / "High"
    burnout_score = Column(Float, nullable=True)                  # 0.0 - 1.0
    input_snapshot = Column(JSON, nullable=True)                  # raw input JSON
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())
