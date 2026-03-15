"""
preprocessing.py
Berisi fungsi-fungsi untuk preprocessing data input sebelum dikirim ke model ML.
"""

import numpy as np
from typing import Union


# Mapping kategori ke angka
GENDER_MAP = {"Male": 1, "Female": 0, "Laki-laki": 1, "Perempuan": 0}
STRESS_MAP = {"Low": 0, "Medium": 1, "High": 2}


def encode_gender(gender: str) -> int:
    """Encode gender ke integer (0=Female, 1=Male)."""
    return GENDER_MAP.get(gender, 0)


def encode_stress_level(stress: str) -> int:
    """Encode stress_level ke integer (0=Low, 1=Medium, 2=High)."""
    return STRESS_MAP.get(stress, 1)


def preprocess_for_mental_model(data: dict) -> np.ndarray:
    """
    Menyiapkan array fitur untuk model prediksi mental wellness.
    
    Fitur yang digunakan:
    - sleep_hours, study_hours, social_media_hours, physical_activity_minutes
    - anxiety_score, depression_score, social_support_score
    - stress_level (encoded), screen_time_hours, gender (encoded), age
    """
    features = [
        float(data.get("sleep_hours", 7.0)),
        float(data.get("study_hours", 5.0)),
        float(data.get("social_media_hours", 3.0)),
        float(data.get("physical_activity_minutes", 30.0)),
        float(data.get("anxiety_score", 5)),
        float(data.get("depression_score", 4)),
        float(data.get("social_support_score", 6)),
        float(encode_stress_level(data.get("stress_level", "Medium"))),
        float(data.get("screen_time_hours", 6.0)),
        float(encode_gender(data.get("gender", "Male"))),
        float(data.get("age", 20)),
    ]
    return np.array(features).reshape(1, -1)


def preprocess_for_productivity_model(data: dict) -> np.ndarray:
    """
    Menyiapkan array fitur untuk model prediksi produktivitas.
    
    Fitur yang digunakan:
    - study_hours, sleep_hours, phone_usage_hours, social_media_hours
    - gaming_hours, breaks_per_day, assignments_completed
    - physical_activity_minutes, cgpa, age, gender (encoded)
    - screen_time_hours, stress_level (encoded)
    """
    features = [
        float(data.get("study_hours", 5.0)),
        float(data.get("sleep_hours", 7.0)),
        float(data.get("phone_usage_hours", 4.0)),
        float(data.get("social_media_hours", 3.0)),
        float(data.get("gaming_hours", 1.0)),
        float(data.get("breaks_per_day", 3)),
        float(data.get("assignments_completed", 5)),
        float(data.get("physical_activity_minutes", 30.0)),
        float(data.get("cgpa", 3.0)),
        float(data.get("age", 20)),
        float(encode_gender(data.get("gender", "Male"))),
        float(data.get("screen_time_hours", 6.0)),
        float(encode_stress_level(data.get("stress_level", "Medium"))),
    ]
    return np.array(features).reshape(1, -1)


def calculate_burnout_score(data: dict, mental_pred: str, productivity_pred: str) -> float:
    """
    Menghitung burnout score (0.0 - 1.0) berdasarkan kombinasi faktor risiko.
    Semakin mendekati 1.0, semakin tinggi risiko burnout.
    """
    score = 0.0

    # Faktor tidur (kurang tidur → burnout)
    sleep = float(data.get("sleep_hours", 7.0))
    if sleep < 5:
        score += 0.25
    elif sleep < 6.5:
        score += 0.15
    elif sleep >= 8:
        score -= 0.05

    # Faktor stres
    stress = data.get("stress_level", "Medium")
    stress_contrib = {"Low": 0.0, "Medium": 0.15, "High": 0.30}
    score += stress_contrib.get(stress, 0.15)

    # Faktor anxiety & depression
    anxiety = int(data.get("anxiety_score", 5))
    depression = int(data.get("depression_score", 4))
    score += min((anxiety + depression) / 40.0, 0.20)

    # Faktor screen time berlebihan
    screen = float(data.get("screen_time_hours", 6.0))
    if screen > 10:
        score += 0.15
    elif screen > 7:
        score += 0.08

    # Faktor social support (negatif → mengurangi burnout)
    support = int(data.get("social_support_score", 6))
    score -= min(support / 50.0, 0.10)

    # Adjustment dari hasil prediksi
    if mental_pred == "Poor":
        score += 0.10
    if productivity_pred == "Low":
        score += 0.05

    return round(max(0.0, min(score, 1.0)), 3)


def get_burnout_risk_label(burnout_score: float) -> str:
    """Konversi burnout score ke label risiko."""
    if burnout_score < 0.33:
        return "Low"
    elif burnout_score < 0.66:
        return "Medium"
    else:
        return "High"


def generate_recommendation(mental: str, productivity: str, burnout_risk: str) -> str:
    """Buat kalimat rekomendasi berdasarkan hasil prediksi."""
    recommendations = {
        ("Good", "High", "Low"): "Kondisi Anda sangat optimal! Pertahankan pola hidup sehat ini.",
        ("Good", "High", "Medium"): "Kondisi baik namun waspadai potensi kelelahan. Jaga keseimbangan kerja-istirahat.",
        ("Good", "Medium", "Low"): "Kondisi mental baik. Tingkatkan fokus dan manajemen waktu untuk produktivitas lebih tinggi.",
        ("Good", "Low", "Low"): "Kondisi mental baik namun produktivitas rendah. Evaluasi metode belajar dan manajemen distraksi.",
        ("Fair", "High", "Low"): "Produktivitas tinggi namun kondisi mental perlu perhatian. Jangan abaikan kesehatan mental Anda.",
        ("Fair", "Medium", "Medium"): "Kondisi cukup. Fokus pada kualitas tidur, olahraga rutin, dan batasi screen time.",
        ("Fair", "Low", "Medium"): "Perlu perhatian. Kurangi waktu HP/media sosial dan tingkatkan jam belajar berkualitas.",
        ("Poor", "Low", "High"): "⚠️ Risiko tinggi! Segera konsultasi dengan konselor atau psikolog. Prioritaskan istirahat dan dukungan sosial.",
        ("Poor", "Medium", "High"): "⚠️ Kondisi mental buruk dan burnout tinggi. Pertimbangkan untuk berbicara dengan profesional kesehatan mental.",
    }

    key = (mental, productivity, burnout_risk)
    if key in recommendations:
        return recommendations[key]

    # Default recommendations
    if burnout_risk == "High":
        return "⚠️ Risiko burnout tinggi! Kurangi beban, istirahat cukup, dan cari dukungan dari orang terdekat."
    elif mental == "Poor":
        return "Kondisi mental membutuhkan perhatian. Tidur cukup, olahraga, dan batasi media sosial."
    elif productivity == "Low":
        return "Produktivitas dapat ditingkatkan dengan manajemen waktu yang lebih baik dan mengurangi distraksi digital."
    else:
        return "Pertahankan keseimbangan hidup sehat: tidur cukup, olahraga rutin, dan batasi layar."
