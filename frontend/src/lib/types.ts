/* ─────────────────────────────────────
   Types matching the FastAPI backend
   ───────────────────────────────────── */

export interface LifestyleInput {
  user_id: string;
  age: number;
  gender: string;
  cgpa: number;
  sleep_hours: number;
  study_hours: number;
  social_media_hours: number;
  physical_activity_minutes: number;
  screen_time_hours: number;
  stress_level: string;          // "Low" | "Medium" | "High"
  anxiety_score: number;         // 0-10
  depression_score: number;      // 0-10
  social_support_score: number;  // 0-10
  phone_usage_hours: number;
  gaming_hours: number;
  breaks_per_day: number;
  assignments_completed: number;
}

export interface PredictionResponse {
  user_id: string;
  mental_prediction: string;          // "Good" | "Fair" | "Poor"
  productivity_prediction: string;    // "High" | "Medium" | "Low"
  burnout_risk: string;               // "Low" | "Medium" | "High"
  burnout_score: number;              // 0.0 - 1.0
  mental_confidence: number;
  productivity_confidence: number;
  recommendation: string;
  predicted_at: string;
}

export interface HistoryItem {
  id: number;
  user_id: string;
  mental_prediction: string | null;
  productivity_prediction: string | null;
  burnout_risk: string | null;
  burnout_score: number | null;
  predicted_at: string | null;
}

export interface HistoryResponse {
  user_id: string;
  total_predictions: number;
  history: HistoryItem[];
}

export interface HealthResponse {
  status: string;
  message: string;
  version: string;
}
