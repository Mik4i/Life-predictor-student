"""
train_model.py
Script training model ML untuk AI Life Predictor.
Menggunakan data riil dari PostgreSQL sebagai sumber utama.

Strategi label:
- Mental Wellness  -> dari data_mental: kombinasi Depression + Anxiety + Panic
- Produktivitas    -> dari data_productivity: assignments_completed +
                     study_hours_per_day + attendance_percentage

Jalankan:
    python models/train_model.py
"""

import sys
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import psycopg2
import warnings
warnings.filterwarnings("ignore")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MENTAL_MODEL_PATH       = os.path.join(SCRIPT_DIR, "mental_model.pkl")
PRODUCTIVITY_MODEL_PATH = os.path.join(SCRIPT_DIR, "productivity_model.pkl")


# ─────────────────────────────────────────────────────────────
# KONEKSI DATABASE
# ─────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(
        host="localhost", port=5432,
        user="hamibaru", password="12345",
        database="app AI Life Predictor",
        options="-c client_encoding=UTF8"
    )


def read_table(conn, table):
    try:
        df = pd.read_sql(f'SELECT * FROM "{table}"', conn)
        print(f"  OK {table}: {len(df)} baris")
        return df
    except Exception as e:
        conn.rollback()
        print(f"  ERROR {table}: {e}")
        return pd.DataFrame()


# ─────────────────────────────────────────────────────────────
# MODEL 1: MENTAL WELLNESS
# Sumber: data_mental + data_burnout + data_lifestyle
# Label: "Good" / "Fair" / "Poor"
# ─────────────────────────────────────────────────────────────

def build_mental_dataset(conn):
    print("\n[MENTAL MODEL] Membangun dataset...")
    df_m = read_table(conn, "data_mental")
    df_b = read_table(conn, "data_burnout")
    df_l = read_table(conn, "data_lifestyle")

    rows = []

    # ── Sumber 1: data_mental (label paling kuat - data riil) ──
    if not df_m.empty:
        df_m.columns = [c.strip().replace("`", "") for c in df_m.columns]
        dep_col   = next((c for c in df_m.columns if "Depression"  in c), None)
        anx_col   = next((c for c in df_m.columns if "Anxiety"     in c), None)
        panic_col = next((c for c in df_m.columns if "Panic"       in c), None)
        cgpa_col  = next((c for c in df_m.columns if "CGPA" in c or "cgpa" in c.lower()), None)

        before = len(rows)
        for _, r in df_m.iterrows():
            issues = sum([
                1 if str(r.get(dep_col,   "No")).strip() == "Yes" else 0,
                1 if str(r.get(anx_col,   "No")).strip() == "Yes" else 0,
                1 if str(r.get(panic_col, "No")).strip() == "Yes" else 0,
            ])
            label = "Good" if issues == 0 else ("Fair" if issues == 1 else "Poor")

            age      = float(r.get("age", 20) or 20)
            gender_e = 0 if str(r.get("gender", "")).strip() == "Female" else 1

            cgpa_str = str(r.get(cgpa_col, "3.00") or "3.00").strip()
            try:
                parts = [p.strip() for p in cgpa_str.replace(" ", "").split("-")]
                cgpa_val = (float(parts[0]) + float(parts[1])) / 2 if len(parts) == 2 else 3.0
            except Exception:
                cgpa_val = 3.0

            rows.append({
                "sleep_hours":              6.5,
                "study_hours":              4.5,
                "social_media_hours":       3.5,
                "physical_activity_minutes":50.0,
                "anxiety_score":            7 if str(r.get(anx_col,  "No")).strip() == "Yes" else 3,
                "depression_score":         7 if str(r.get(dep_col,  "No")).strip() == "Yes" else 3,
                "social_support_score":     5,
                "stress_level_enc":         2 if issues >= 2 else (1 if issues == 1 else 0),
                "screen_time_hours":        6.5,
                "gender_enc":               gender_e,
                "age":                      age,
                "cgpa":                     cgpa_val,
                "label":                    label,
            })
        print(f"    data_mental: {len(rows) - before} baris")

    # ── Sumber 2: data_burnout (anxiety+depression skor riil) ──
    if not df_b.empty:
        stress_map  = {"Low": 0, "Medium": 1, "High": 2}
        sleep_q_map = {"Poor": 0, "Average": 1, "Good": 2}
        gender_map  = {"Female": 0, "Male": 1, "Other": 0}
        before = len(rows)

        for _, r in df_b.iterrows():
            anx  = float(r.get("anxiety_score",    5) or 5)
            dep  = float(r.get("depression_score",  5) or 5)
            supp = float(r.get("social_support_score", 5) or 5)
            slp  = float(r.get("daily_sleep_hours", 6.5) or 6.5)
            phy  = float(r.get("physical_activity_hours", 1.0) or 1.0)
            scr  = float(r.get("screen_time_hours", 6.5) or 6.5)
            stdy = float(r.get("daily_study_hours", 5.0) or 5.0)
            cgpa = float(r.get("cgpa", 6.99) or 6.99) / 2.5   # 10-scale to ~4-scale
            age  = float(r.get("age", 21) or 21)
            stress   = stress_map.get(str(r.get("stress_level", "Medium")).strip(), 1)
            sleep_q  = sleep_q_map.get(str(r.get("sleep_quality","Average")).strip(), 1)
            gender_e = gender_map.get(str(r.get("gender", "Male")).strip(), 0)

            score = 0
            if slp >= 7:     score += 1
            if anx <= 4:     score += 1
            if dep <= 4:     score += 1
            if supp >= 6:    score += 1
            if stress == 0:  score += 1
            if phy >= 0.5:   score += 1
            if sleep_q >= 1: score += 1

            label = "Good" if score >= 5 else ("Fair" if score >= 3 else "Poor")

            rows.append({
                "sleep_hours":              slp,
                "study_hours":              stdy,
                "social_media_hours":       3.5,
                "physical_activity_minutes":phy * 60,
                "anxiety_score":            anx,
                "depression_score":         dep,
                "social_support_score":     supp,
                "stress_level_enc":         stress,
                "screen_time_hours":        scr,
                "gender_enc":               gender_e,
                "age":                      age,
                "cgpa":                     cgpa,
                "label":                    label,
            })
        print(f"    data_burnout: {len(rows) - before} baris")

    # ── Sumber 3: data_lifestyle ──
    if not df_l.empty:
        gender_map = {"Female": 0, "Male": 1, "Other": 0}
        before = len(rows)

        for _, r in df_l.iterrows():
            slp  = float(r.get("sleep_duration",    7.0) or 7.0)
            stdy = float(r.get("study_hours",        4.5) or 4.5)
            soc  = float(r.get("social_media_hours", 3.5) or 3.5)
            phy  = float(r.get("physical_activity",  70.0) or 70.0)
            cgpa = float(r.get("cgpa", 2.9) or 2.9)
            age  = float(r.get("age", 21) or 21)
            gender_e = gender_map.get(str(r.get("gender", "Male")).strip(), 0)

            score = 0
            if slp >= 7:   score += 2
            if soc <= 3:   score += 1
            if phy >= 60:  score += 1
            if cgpa >= 3:  score += 1
            if stdy >= 4:  score += 1
            label = "Good" if score >= 4 else ("Fair" if score >= 2 else "Poor")

            rows.append({
                "sleep_hours":              slp,
                "study_hours":              stdy,
                "social_media_hours":       soc,
                "physical_activity_minutes":phy,
                "anxiety_score":            5.0,
                "depression_score":         5.0,
                "social_support_score":     5.0,
                "stress_level_enc":         1,
                "screen_time_hours":        soc * 1.5,
                "gender_enc":               gender_e,
                "age":                      age,
                "cgpa":                     cgpa,
                "label":                    label,
            })
        print(f"    data_lifestyle: {len(rows) - before} baris")

    df = pd.DataFrame(rows)
    print(f"\n  Total mental dataset: {len(df)} baris")
    print(f"  Label dist: {df['label'].value_counts().to_dict()}")

    feature_cols = [c for c in df.columns if c != "label"]
    X = df[feature_cols].astype(float)
    y = df["label"]
    return X, y, feature_cols


# ─────────────────────────────────────────────────────────────
# MODEL 2: PRODUKTIVITAS
# Sumber: data_productivity + data_burnout
# Label: "High" / "Medium" / "Low"
# ─────────────────────────────────────────────────────────────

def build_productivity_dataset(conn):
    print("\n[PRODUCTIVITY MODEL] Membangun dataset...")
    df = read_table(conn, "data_productivity")
    df_b = read_table(conn, "data_burnout")   # akan ditambahkan sebagai augmentasi

    if df.empty:
        return None, None, None

    gender_map = {"Female": 0, "Male": 1, "Other": 0}
    df["gender_enc"] = df["gender"].map(gender_map).fillna(0)

    # ── Hitung Productivity Score berbasis kolom riil (percentile-based) ──
    def norm(series, lo=None, hi=None):
        lo = lo if lo is not None else series.min()
        hi = hi if hi is not None else series.max()
        return ((series - lo) / (hi - lo + 1e-9)).clip(0, 1)

    df["norm_assignments"]  = norm(df["assignments_completed"])   # 0-19
    df["norm_study"]        = norm(df["study_hours_per_day"], 0.5, 10.0)
    df["norm_attendance"]   = norm(df["attendance_percentage"], 40.0, 100.0)
    df["norm_exercise"]     = norm(df["exercise_minutes"], 0, 119)
    df["norm_breaks"]       = norm(df["breaks_per_day"], 1, 14)
    df["norm_sleep"]        = df["sleep_hours"].apply(
                                  lambda x: 1.0 if 6.5 <= float(x) <= 9.0
                                  else (float(x)/6.5 if float(x) < 6.5
                                  else max(0, (10-float(x))/1.5))
                              ).clip(0, 1)
    # Distraktor (semakin tinggi → semakin turun produktivitas)
    df["distraction"] = (
        norm(df["phone_usage_hours"],    0, 12) * 0.15 +
        norm(df["gaming_hours"],         0, 6)  * 0.10 +
        norm(df["youtube_hours"],        0, 6)  * 0.08 +
        norm(df["social_media_hours"],   0, 8)  * 0.07
    )

    # Composite score: assignments & study adalah faktor terpenting
    df["prod_score"] = (
        df["norm_assignments"] * 0.35 +
        df["norm_study"]       * 0.25 +
        df["norm_attendance"]  * 0.20 +
        df["norm_sleep"]       * 0.08 +
        df["norm_exercise"]    * 0.06 +
        df["norm_breaks"]      * 0.06 -
        df["distraction"]
    ).clip(0, 1)

    # Gunakan percentile agar distribusi seimbang
    p33 = df["prod_score"].quantile(0.33)
    p66 = df["prod_score"].quantile(0.66)
    print(f"  Score percentiles: p33={p33:.3f}, p66={p66:.3f}")

    df["label"] = df["prod_score"].apply(
        lambda s: "High" if s >= p66 else ("Medium" if s >= p33 else "Low")
    )
    print(f"  Label dist: {df['label'].value_counts().to_dict()}")

    feature_cols = [
        "study_hours_per_day", "sleep_hours", "phone_usage_hours",
        "social_media_hours",  "youtube_hours", "gaming_hours",
        "breaks_per_day",      "coffee_intake_mg", "exercise_minutes",
        "assignments_completed", "attendance_percentage",
        "gender_enc", "age"
    ]

    X = df[feature_cols].astype(float).fillna(df[feature_cols].median())
    y = df["label"]
    return X, y, feature_cols


# ─────────────────────────────────────────────────────────────
# TRAIN & SAVE
# ─────────────────────────────────────────────────────────────

def train_and_save(X, y, model_path, name, feature_names):
    print(f"\nTraining {name}...")
    print(f"  Samples: {len(X)}, Features: {X.shape[1]}")
    print(f"  Label dist: {y.value_counts().to_dict()}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"  Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred))

    pkg = {
        "model": clf,
        "feature_names": feature_names,
        "classes": clf.classes_.tolist()
    }
    joblib.dump(pkg, model_path)
    print(f"  Saved -> {model_path}")
    return acc


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("AI Life Predictor — Model Training (Data Riil)")
    print("=" * 60)

    try:
        conn = get_conn()
        print("Database connected\n")

        # Mental Model
        X_m, y_m, feat_m = build_mental_dataset(conn)
        train_and_save(X_m, y_m, MENTAL_MODEL_PATH, "Mental Wellness Model", feat_m)

        # Productivity Model
        X_p, y_p, feat_p = build_productivity_dataset(conn)
        if X_p is not None:
            train_and_save(X_p, y_p, PRODUCTIVITY_MODEL_PATH, "Productivity Model", feat_p)

        conn.close()

    except Exception as e:
        print(f"Error: {e}")
        import traceback; traceback.print_exc()
        sys.exit(1)

    print("\n" + "=" * 60)
    print("Training selesai! Model disimpan di folder models/")
    print("=" * 60)
