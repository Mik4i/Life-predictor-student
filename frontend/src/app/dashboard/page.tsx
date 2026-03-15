"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PredictionResponse, LifestyleInput } from "@/lib/types";

/* ───── helpers ───── */
function mentalLabel(p: string) {
  if (p === "Good") return { text: "Stable", color: "text-emerald-500", bg: "bg-emerald-500", pct: 85 };
  if (p === "Fair") return { text: "Moderate", color: "text-amber-500", bg: "bg-amber-500", pct: 55 };
  return { text: "At Risk", color: "text-red-500", bg: "bg-red-500", pct: 30 };
}

function prodScore(p: string) {
  if (p === "High") return 85;
  if (p === "Medium") return 62;
  return 35;
}

function burnoutPct(score: number) {
  return Math.round(score * 100);
}

export default function DashboardPage() {
  const router = useRouter();
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [input, setInput] = useState<LifestyleInput | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("prediction_result");
    const rawInput = sessionStorage.getItem("prediction_input");
    if (!raw) {
      router.push("/");
      return;
    }
    setResult(JSON.parse(raw));
    if (rawInput) setInput(JSON.parse(rawInput));
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe]">
        <div className="flex items-center gap-3 text-slate-400 text-lg font-medium">
          <span className="material-symbols-outlined animate-spin text-[#0d7ff2]">progress_activity</span>
          Loading dashboard...
        </div>
      </div>
    );
  }

  const mental = mentalLabel(result.mental_prediction);
  const pScore = prodScore(result.productivity_prediction);
  const bPct = burnoutPct(result.burnout_score);
  const strokeDash = (pct: number) => `${(pct / 100) * 100}, 100`;
  const circDash = (pct: number) => `${(pct / 100) * 276} 276`;

  // Simulated weekly data for charts
  const weekBars = [60, 40, 75, 90, 65, 50, 85];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Digital allocation
  const socialPct = input ? Math.round((input.social_media_hours / Math.max(input.social_media_hours + input.gaming_hours + input.phone_usage_hours + 2, 1)) * 100) : 45;
  const gamingPct = input ? Math.round((input.gaming_hours / Math.max(input.social_media_hours + input.gaming_hours + input.phone_usage_hours + 2, 1)) * 100) : 10;
  const phonePct = input ? Math.round((input.phone_usage_hours / Math.max(input.social_media_hours + input.gaming_hours + input.phone_usage_hours + 2, 1)) * 100) : 25;
  const otherPct = 100 - socialPct - gamingPct - phonePct;

  const totalScreenHrs = input
    ? (Number(input.social_media_hours) + Number(input.gaming_hours) + Number(input.phone_usage_hours)).toFixed(1)
    : "6.2";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ══════════ TOP NAV ══════════ */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200/60 px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center bg-[#0d7ff2] rounded-xl shadow-lg shadow-[#0d7ff2]/20">
            <span className="material-symbols-outlined text-white text-xl">insights</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight font-[Plus_Jakarta_Sans]">
            LifePredict<span className="text-[#0d7ff2]">.ai</span>
          </h2>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <nav className="hidden md:flex gap-8 mr-4">
            <a href="#" className="text-sm font-semibold text-[#0d7ff2] relative after:content-[''] after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-[#0d7ff2]">Dashboard</a>
            <a href="#" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Historical Trends</a>
            <a href="#" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Network</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0d7ff2] to-[#0265d2] flex items-center justify-center text-white font-bold text-sm ring-2 ring-[#0d7ff2]/10 ring-offset-2 ring-offset-white">
              {result.user_id?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full p-6 md:p-10 lg:p-12 space-y-12">
        {/* ── Header Section ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 rounded-md bg-[#0d7ff2]/10 text-[#0d7ff2] text-[10px] font-bold uppercase tracking-widest border border-[#0d7ff2]/20">AI Engine V1.2</span>
              <span className="text-slate-400 text-xs">• Analysis synced just now</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-[Plus_Jakarta_Sans]">
              Your Weekly <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0d7ff2] to-[#60a5fa]">Cognitive Blueprint</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl">
              Visualizing the intersection of biometric data and behavioral output for the last 30 days.
            </p>
          </div>
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-lg">file_download</span> Export
          </button>
        </div>

        {/* ══════════ 3 PREDICTION CARDS ══════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Burnout Risk Gauge */}
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center group transition-transform hover:-translate-y-1 animate-fade-in-up">
            <h3 className="text-slate-400 text-[11px] font-bold mb-8 uppercase tracking-[0.2em]">Burnout Probability</h3>
            <div className="relative w-44 h-44 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="44" fill="transparent"
                  stroke={result.burnout_risk === "Low" ? "#22c55e" : result.burnout_risk === "Medium" ? "#f59e0b" : "#ef4444"}
                  strokeWidth="8"
                  strokeDasharray={circDash(bPct)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900">{result.burnout_risk}</span>
                <span className={`text-[10px] font-bold uppercase mt-1 ${result.burnout_risk === "Low" ? "text-emerald-500" : result.burnout_risk === "Medium" ? "text-amber-500" : "text-red-500"}`}>
                  {result.burnout_risk === "Low" ? "Low Risk" : result.burnout_risk === "Medium" ? "Elevated Stress" : "Critical Alert"}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Burnout score: {(result.burnout_score * 100).toFixed(0)}%</p>
              <p className="text-xs text-slate-400">Confidence: {(result.mental_confidence * 100).toFixed(0)}%</p>
            </div>
          </div>

          {/* Mental Health / Resilience */}
          <div className="glass-card p-8 rounded-2xl flex flex-col justify-between group transition-transform hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div>
              <div className="flex justify-between items-start mb-10">
                <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em]">Resilience Index</h3>
                <div className={`w-12 h-12 rounded-2xl ${result.mental_prediction === "Good" ? "bg-emerald-500/10 text-emerald-500" : result.mental_prediction === "Fair" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-2xl">psychology_alt</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-extrabold text-slate-900">{mental.text}</p>
                <p className={`${mental.color} font-bold text-sm inline-flex items-center gap-1`}>
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  Mental: {result.mental_prediction}
                </p>
              </div>
            </div>
            <div className="space-y-3 mt-8">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                <span className="text-slate-400">Emotional Floor</span>
                <span className={mental.color}>{mental.pct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${mental.bg} rounded-full transition-all duration-1000`}
                  style={{ width: `${mental.pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Productivity / Efficiency */}
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center group transition-transform hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-slate-400 text-[11px] font-bold mb-8 uppercase tracking-[0.2em]">Efficiency Rating</h3>
            <div className="relative w-44 h-44">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="16" fill="none"
                  stroke="#0d7ff2" strokeWidth="2.5"
                  strokeDasharray={strokeDash(pScore)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">{pScore}</span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Base Points</span>
              </div>
            </div>
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                <span className="w-1.5 h-1.5 bg-[#0d7ff2] rounded-full" />
                Productivity: {result.productivity_prediction}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ LIFESTYLE INTELLIGENCE ══════════ */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 font-[Plus_Jakarta_Sans]">
            Lifestyle Intelligence
            <span className="h-px flex-1 bg-slate-200" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-red-200 transition-all flex items-start gap-5">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                <span className="material-symbols-outlined text-2xl">timer_off</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">Screen time anomaly detected</p>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  Daily average of {totalScreenHrs}h detected. High screen time between 11 PM and 1 AM correlates with decreased AM focus.
                </p>
              </div>
            </div>
            <div className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-200 transition-all flex items-start gap-5">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">Sleep quality insight</p>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  {input && input.sleep_hours >= 7
                    ? "Consistent deep sleep cycles detected. This directly fuels your high morning productivity score."
                    : "Sleep hours below optimal threshold. Consider targeting 7-9 hours for improved cognitive recovery."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ CHARTS ══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sleep & Stress Bar Chart */}
          <div className="lg:col-span-2 glass-card p-8 rounded-2xl">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-[Plus_Jakarta_Sans]">Sleep &amp; Stress Dynamics</h3>
                <p className="text-sm text-slate-400">Weekly synchronization analysis</p>
              </div>
              <div className="flex gap-4 text-[11px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2 text-[#0d7ff2]">
                  <span className="w-2 h-2 rounded-full bg-[#0d7ff2] ring-4 ring-[#0d7ff2]/10" /> Sleep Quality
                </span>
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-300" /> Stress Level
                </span>
              </div>
            </div>
            <div className="h-64 w-full relative">
              {/* Background Grid */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-full h-px ${i === 4 ? "bg-slate-200" : "bg-slate-100"}`} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-end px-2 pt-4">
                <div className="w-full h-full flex items-end gap-3 lg:gap-5 pb-1">
                  {weekBars.map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 bg-[#0d7ff2]/10 rounded-t-lg relative hover:bg-[#0d7ff2]/20 transition-all cursor-pointer ${h >= 70 ? "chart-bar-glow" : ""}`}
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#0d7ff2] rounded-full ring-4 ring-white" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Stress line overlay */}
              <div className="absolute inset-0 flex items-end justify-between px-2 pb-1 pointer-events-none pt-4">
                <svg className="w-full h-full text-slate-300" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,80 C15,82 25,85 30,70 S40,55 45,60 S55,80 60,82 S70,90 75,88 S90,75 100,72" fill="none" stroke="currentColor" strokeDasharray="4" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
            <div className="flex justify-between mt-6 px-4 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              {days.map((d) => <span key={d}>{d}</span>)}
            </div>
          </div>

          {/* Digital Allocation Donut */}
          <div className="glass-card p-8 rounded-2xl flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 font-[Plus_Jakarta_Sans]">Digital Allocation</h3>
              <p className="text-sm text-slate-400">Application usage hierarchy</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div
                className="w-44 h-44 rounded-full relative"
                style={{
                  background: `conic-gradient(#0d7ff2 0% ${socialPct}%, #60a5fa ${socialPct}% ${socialPct + phonePct}%, #93c5fd ${socialPct + phonePct}% ${socialPct + phonePct + gamingPct}%, #f1f5f9 ${socialPct + phonePct + gamingPct}% 100%)`,
                }}
              >
                <div className="absolute inset-[15%] bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                  <span className="text-2xl font-black text-slate-900">{totalScreenHrs}h</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Daily</span>
                </div>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-3 w-full">
                {[
                  { label: "Social", pct: socialPct, color: "bg-[#0d7ff2]" },
                  { label: "Phone", pct: phonePct, color: "bg-[#60a5fa]" },
                  { label: "Gaming", pct: gamingPct, color: "bg-[#93c5fd]" },
                  { label: "Other", pct: otherPct, color: "bg-slate-200" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="flex items-center gap-2 text-slate-500">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} /> {item.label}
                    </span>
                    <span className="text-slate-900">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ EQUILIBRIUM ANALYSIS ══════════ */}
        <div className="glass-card p-10 rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-[Plus_Jakarta_Sans]">Equilibrium Analysis</h3>
                <p className="text-slate-500 mt-2 leading-relaxed">
                  Mapping your performance across the five core pillars of high-potential living.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="material-symbols-outlined text-emerald-500 mt-0.5">verified</span>
                  <div className="text-sm">
                    <span className="font-bold text-slate-900">Focus Performance:</span>
                    <span className="text-slate-600 ml-1">
                      {result.productivity_prediction === "High"
                        ? "You maintained a deep work state 40% longer than your monthly average."
                        : "Consider implementing the Pomodoro technique to boost focus sessions."}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="material-symbols-outlined text-amber-500 mt-0.5">report_problem</span>
                  <div className="text-sm">
                    <span className="font-bold text-slate-900">Movement Deficit:</span>
                    <span className="text-slate-600 ml-1">
                      {input && input.physical_activity_minutes < 30
                        ? `Physical activity at ${input.physical_activity_minutes} min/day. Recommend a 20min HIIT session to reset cortisol.`
                        : "Physical activity is within optimal range. Maintain current exercise routine."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Radar Chart */}
            <div className="w-72 h-72 relative flex items-center justify-center bg-slate-50/50 rounded-full p-8">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100">
                  <polygon fill="currentColor" points="50,5 93.3,30 93.3,70 50,95 6.7,70 6.7,30" />
                </svg>
              </div>
              <div className="absolute inset-4 flex items-center justify-center opacity-10">
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100">
                  <polygon fill="none" points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" stroke="currentColor" strokeWidth="0.5" />
                  <polygon fill="none" points="50,20 84.6,40 84.6,60 50,80 15.4,60 15.4,40" stroke="currentColor" strokeWidth="0.5" />
                  <polygon fill="none" points="50,40 76,55 76,45 50,60 24,45 24,55" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="50" y1="50" x2="50" y2="0" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="50" y1="50" x2="93.3" y2="25" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="50" y1="50" x2="93.3" y2="75" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="50" y1="50" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="50" y1="50" x2="6.7" y2="75" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="50" y1="50" x2="6.7" y2="25" stroke="currentColor" strokeWidth="0.5" />
                </svg>
              </div>
              <svg className="w-full h-full relative z-10 drop-shadow-xl" viewBox="0 0 100 100">
                <polygon
                  points={`50,${100 - mental.pct} ${50 + pScore * 0.4},${50 - pScore * 0.2} ${50 + bPct * 0.3},${50 + bPct * 0.3} ${50 - bPct * 0.2},${50 + mental.pct * 0.4} ${50 - pScore * 0.35},${50 - pScore * 0.15}`}
                  fill="rgba(13, 127, 242, 0.2)"
                  stroke="#0d7ff2"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Sleep</span>
              <span className="absolute top-[38%] -right-1 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 rotate-90">Focus</span>
              <span className="absolute bottom-2 right-[12%] text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Screen</span>
              <span className="absolute bottom-2 left-[12%] text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Stress</span>
              <span className="absolute top-[38%] -left-4 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 -rotate-90">Exercise</span>
            </div>
          </div>
        </div>

        {/* ══════════ AI RECOMMENDATION ══════════ */}
        <div className="bg-gradient-to-br from-[#0d7ff2]/10 via-blue-50/50 to-[#0d7ff2]/5 border border-[#0d7ff2]/20 rounded-3xl p-10 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#0d7ff2]/5 rounded-full blur-3xl group-hover:bg-[#0d7ff2]/10 transition-colors duration-1000" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0d7ff2]/20 rounded-xl flex items-center justify-center text-[#0d7ff2] ai-status-pulse">
                  <span className="material-symbols-outlined">auto_fix_high</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 font-[Plus_Jakarta_Sans]">AI Intelligence Core</h2>
              </div>
              <p className="text-slate-600 font-medium max-w-xl">{result.recommendation}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Consistency Protocol", "Limit Focus", "Micro-Movements"].map((label, i) => {
                const icons = ["nights_stay", "screen_lock_portrait", "bolt"];
                return (
                  <button key={label} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl hover:border-[#0d7ff2] hover:shadow-lg hover:shadow-[#0d7ff2]/5 hover:-translate-y-0.5 transition-all group/btn">
                    <span className="material-symbols-outlined text-xl text-[#0d7ff2] group-hover/btn:rotate-12 transition-transform">{icons[i]}</span>
                    <span className="text-sm font-bold text-slate-700">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══════════ CTA ══════════ */}
        <div className="flex flex-col items-center justify-center py-6 gap-6">
          <button
            onClick={() => router.push("/")}
            className="px-12 py-5 bg-[#0d7ff2] text-white font-extrabold rounded-2xl shadow-2xl shadow-[#0d7ff2]/40 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
          >
            <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-700">sync</span>
            Trigger Full Recalculation
          </button>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Neural Engine Active
          </div>
        </div>
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-slate-200 px-8 py-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="material-symbols-outlined text-lg">verified_user</span>
            <span className="text-xs font-medium">Enterprise-grade encryption. Your data remains sovereign.</span>
          </div>
          <div className="flex gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            <a href="#" className="hover:text-[#0d7ff2] transition-colors">Legal Policy</a>
            <a href="#" className="hover:text-[#0d7ff2] transition-colors">System Status</a>
            <a href="#" className="hover:text-[#0d7ff2] transition-colors">Advanced Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
