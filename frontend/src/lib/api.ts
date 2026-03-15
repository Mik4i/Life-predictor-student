import { LifestyleInput, PredictionResponse, HistoryResponse, HealthResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function predict(data: LifestyleInput): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Prediction failed (${res.status})`);
  }
  return res.json();
}

export async function getHistory(userId: string, limit = 20): Promise<HistoryResponse> {
  const res = await fetch(`${API_BASE}/history/${encodeURIComponent(userId)}?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch history (${res.status})`);
  return res.json();
}

export async function healthCheck(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed (${res.status})`);
  return res.json();
}
