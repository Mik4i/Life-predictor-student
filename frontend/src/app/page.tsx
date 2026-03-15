"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { predict } from "@/lib/api";
import type { LifestyleInput } from "@/lib/types";

/* ─────────────────────────────────────
   Default form values
   ───────────────────────────────────── */
const DEFAULTS: LifestyleInput = {
  user_id: "user_" + Math.random().toString(36).slice(2, 8),
  age: 20,
  gender: "Male",
  cgpa: 3.2,
  sleep_hours: 7,
  study_hours: 5,
  social_media_hours: 2.5,
  physical_activity_minutes: 45,
  screen_time_hours: 6,
  stress_level: "Medium",
  anxiety_score: 5,
  depression_score: 4,
  social_support_score: 6,
  phone_usage_hours: 4,
  gaming_hours: 0.5,
  breaks_per_day: 3,
  assignments_completed: 5,
};

export default function HomePage() {
  const router = useRouter();
  const [form, setForm] = useState<LifestyleInput>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pressureLevel, setPressureLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(70);

  const set = (key: keyof LifestyleInput, v: string | number) =>
    setForm((p) => ({ ...p, [key]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // Derive some fields
      const payload: LifestyleInput = {
        ...form,
        anxiety_score: Math.min(10, Math.round(pressureLevel * 1.0)),
        depression_score: Math.min(10, Math.round((100 - sleepQuality) / 10)),
        screen_time_hours:
          Number(form.social_media_hours) +
          Number(form.gaming_hours) +
          Number(form.phone_usage_hours) * 0.5,
      };
      const result = await predict(payload);
      // Store result in sessionStorage for dashboard
      sessionStorage.setItem("prediction_result", JSON.stringify(result));
      sessionStorage.setItem("prediction_input", JSON.stringify(payload));
      router.push("/dashboard");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe]">
      {/* ══════════ HEADER ══════════ */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/60 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#0d7ff2] to-[#0265d2] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0d7ff2]/20">
              <span className="material-symbols-outlined text-2xl">insights</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight font-[Plus_Jakarta_Sans]">
              Life<span className="text-[#0d7ff2]">AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-[#0d7ff2] transition-colors">How it works</a>
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-[#0d7ff2] transition-colors">Methodology</a>
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-[#0d7ff2] transition-colors">Privacy</a>
          </div>
          <button className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all font-bold text-sm">
            Sign In
          </button>
        </nav>
      </header>

      <main className="pt-20">
        {/* ══════════ HERO ══════════ */}
        <section className="relative py-24 px-6 hero-gradient">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#0d7ff2]/5 border border-[#0d7ff2]/10 text-[#0d7ff2] text-[11px] font-bold mb-8 uppercase tracking-[0.15em]">
              Neural-Engine v4.0 Active
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1] font-[Plus_Jakarta_Sans]">
              Your Life, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0d7ff2] to-[#063063]">
                Quantified and Predicted.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Unlock the data behind your daily habits. Our advanced AI predicts
              burnout risk, productivity peaks, and long-term well-being trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <a
                href="#analysis-form"
                className="px-10 py-5 bg-[#0d7ff2] text-white rounded-2xl font-bold shadow-2xl shadow-[#0d7ff2]/30 hover:bg-[#0265d2] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                Start Analysis
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
              <button className="px-10 py-5 bg-white border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* ══════════ ANALYSIS FORM ══════════ */}
        <section className="py-20 px-6 max-w-7xl mx-auto" id="analysis-form">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium animate-fade-in-up">
              <span className="material-symbols-outlined text-sm align-middle mr-2">error</span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── LEFT COLUMN ── */}
            <div className="space-y-8">
              {/* Profile Card */}
              <div className="p-8 glass rounded-2xl shadow-xl shadow-slate-200/20">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 bg-[#0d7ff2]/10 text-[#0d7ff2] rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">person</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-[Plus_Jakarta_Sans]">Profile</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Demographic Baseline</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Current Age</label>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => set("age", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200/60 rounded-xl focus:ring-4 focus:ring-[#0d7ff2]/10 focus:border-[#0d7ff2] px-5 py-3.5 transition-all outline-none"
                      placeholder="24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Gender</label>
                    <select
                      value={form.gender}
                      onChange={(e) => set("gender", e.target.value)}
                      className="w-full bg-white border border-slate-200/60 rounded-xl focus:ring-4 focus:ring-[#0d7ff2]/10 px-5 py-3.5 transition-all"
                    >
                      <option value="">Select Identity</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={form.cgpa}
                      onChange={(e) => set("cgpa", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200/60 rounded-xl focus:ring-4 focus:ring-[#0d7ff2]/10 focus:border-[#0d7ff2] px-5 py-3.5 transition-all outline-none"
                      placeholder="3.2"
                    />
                  </div>
                </div>
              </div>

              {/* Performance Card */}
              <div className="p-8 glass rounded-2xl shadow-xl shadow-slate-200/20">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 bg-[#0d7ff2]/10 text-[#0d7ff2] rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">school</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-[Plus_Jakarta_Sans]">Performance</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Academic Workload</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2 ml-1">
                      <label className="text-xs font-bold uppercase text-slate-500">Study Hours</label>
                      <span className="text-xs font-bold text-[#0d7ff2]">{form.study_hours} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="16"
                      step="0.5"
                      value={form.study_hours}
                      onChange={(e) => set("study_hours", Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Weekly Tasks Done</label>
                    <input
                      type="number"
                      value={form.assignments_completed}
                      onChange={(e) => set("assignments_completed", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200/60 rounded-xl px-5 py-3.5 transition-all outline-none focus:ring-4 focus:ring-[#0d7ff2]/10 focus:border-[#0d7ff2]"
                      placeholder="12"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-3 ml-1">Pressure Level</label>
                    <div className="grid grid-cols-5 gap-3">
                      {[1, 3, 5, 7, 10].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setPressureLevel(v)}
                          className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${
                            pressureLevel === v
                              ? "border-[#0d7ff2] bg-[#0d7ff2] text-white shadow-lg shadow-[#0d7ff2]/20"
                              : "border-slate-200 hover:bg-[#0d7ff2]/5 hover:border-[#0d7ff2]"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MIDDLE COLUMN ── */}
            <div className="space-y-8">
              {/* Recovery Card */}
              <div className="p-8 glass rounded-2xl shadow-xl shadow-slate-200/20">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 bg-[#0d7ff2]/10 text-[#0d7ff2] rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">bed</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-[Plus_Jakarta_Sans]">Recovery</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Health Fundamentals</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Sleep Window</label>
                    <select
                      value={form.sleep_hours >= 9 ? "9+" : form.sleep_hours >= 7 ? "7-9" : form.sleep_hours >= 5 ? "5-7" : "<5"}
                      onChange={(e) => {
                        const map: Record<string, number> = { "<5": 4, "5-7": 6, "7-9": 7.5, "9+": 9.5 };
                        set("sleep_hours", map[e.target.value] || 7);
                      }}
                      className="w-full bg-white border border-slate-200/60 rounded-xl px-5 py-3.5"
                    >
                      <option value="<5">Under 5 Hours</option>
                      <option value="5-7">5-7 Hours</option>
                      <option value="7-9">7-9 Hours</option>
                      <option value="9+">9+ Hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Sleep Quality</label>
                    <div className="flex justify-between px-2 mb-3">
                      <span className="material-symbols-outlined text-slate-300">sentiment_very_dissatisfied</span>
                      <span className="material-symbols-outlined text-slate-300">sentiment_neutral</span>
                      <span className="material-symbols-outlined text-[#0d7ff2]">sentiment_very_satisfied</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Exercise (Daily Minutes)</label>
                    <input
                      type="number"
                      value={form.physical_activity_minutes}
                      onChange={(e) => set("physical_activity_minutes", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200/60 rounded-xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-[#0d7ff2]/10 focus:border-[#0d7ff2]"
                      placeholder="45"
                    />
                  </div>
                </div>
              </div>

              {/* Digital Presence Card */}
              <div className="p-8 glass rounded-2xl shadow-xl shadow-slate-200/20">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 bg-[#0d7ff2]/10 text-[#0d7ff2] rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">devices</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-[Plus_Jakarta_Sans]">Digital Presence</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Consumption Metrics</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold">Social Media</span>
                      <span className="text-xs font-bold text-[#0d7ff2]">{form.social_media_hours} hrs</span>
                    </div>
                    <input
                      type="range" min="0" max="12" step="0.1"
                      value={form.social_media_hours}
                      onChange={(e) => set("social_media_hours", Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold">Phone Usage</span>
                      <span className="text-xs font-bold text-[#0d7ff2]">{form.phone_usage_hours} hrs</span>
                    </div>
                    <input
                      type="range" min="0" max="12" step="0.1"
                      value={form.phone_usage_hours}
                      onChange={(e) => set("phone_usage_hours", Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold">Gaming</span>
                      <span className="text-xs font-bold text-[#0d7ff2]">{form.gaming_hours} hrs</span>
                    </div>
                    <input
                      type="range" min="0" max="8" step="0.1"
                      value={form.gaming_hours}
                      onChange={(e) => set("gaming_hours", Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-8">
              <div className="p-8 glass rounded-2xl shadow-xl shadow-slate-200/20 flex flex-col h-full border-[#0d7ff2]/20">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 bg-[#0d7ff2]/10 text-[#0d7ff2] rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">psychology</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-[Plus_Jakarta_Sans]">Mental State</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Well-being Trends</p>
                  </div>
                </div>
                <div className="space-y-8 flex-grow">
                  {/* Stress Indicator */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-3 ml-1">Current Stress Indicator</label>
                    <select
                      value={form.stress_level}
                      onChange={(e) => set("stress_level", e.target.value)}
                      className="w-full bg-white border border-slate-200/60 rounded-xl px-5 py-3.5 mb-3"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#0d7ff2] to-[#0265d2] h-full rounded-full transition-all duration-500"
                        style={{ width: form.stress_level === "Low" ? "25%" : form.stress_level === "Medium" ? "55%" : "85%" }}
                      />
                    </div>
                  </div>

                  {/* Social Support */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-3 ml-1">Social Support Matrix</label>
                    <div className="flex gap-2">
                      {(["Low", "Medium", "High"] as const).map((level) => {
                        const val = level === "Low" ? 3 : level === "Medium" ? 6 : 9;
                        const active = form.social_support_score === val;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => set("social_support_score", val)}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                              active
                                ? "bg-[#0d7ff2]/10 border-2 border-[#0d7ff2] text-[#0d7ff2] shadow-lg shadow-[#0d7ff2]/5"
                                : "border border-slate-200 hover:border-[#0d7ff2]"
                            }`}
                          >
                            {level.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Caffeine & Breaks */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Breaks/Day</label>
                      <input
                        type="number"
                        value={form.breaks_per_day}
                        onChange={(e) => set("breaks_per_day", Number(e.target.value))}
                        className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-[#0d7ff2]/10 focus:border-[#0d7ff2]"
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Fiscal Stress</label>
                      <select className="w-full bg-white border border-slate-200/60 rounded-xl px-2 py-3 text-sm">
                        <option>Low</option>
                        <option>Mid</option>
                        <option>High</option>
                      </select>
                    </div>
                  </div>

                  {/* AI insight */}
                  <div className="p-5 bg-[#0d7ff2]/5 border border-[#0d7ff2]/10 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#0d7ff2]/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                    <p className="text-[13px] text-slate-600 italic leading-relaxed relative z-10">
                      &quot;Optimal cognitive performance correlates with structured rest periods.
                      Your current data suggests adding 15min breaks.&quot;
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-12">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-5 bg-[#0d7ff2] text-white rounded-2xl font-extrabold text-lg shadow-2xl shadow-[#0d7ff2]/30 hover:bg-[#0265d2] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Lifestyle <span className="material-symbols-outlined">bolt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ VISUAL BANNER ══════════ */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="relative rounded-[2.5rem] overflow-hidden aspect-[21/9] shadow-2xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/40 to-transparent flex items-center p-12 lg:p-20">
              <div className="text-white max-w-lg">
                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4">
                  Visual Intelligence
                </span>
                <h4 className="text-3xl lg:text-4xl font-extrabold mb-6 leading-tight font-[Plus_Jakarta_Sans]">
                  See your future, <br />scientifically optimized.
                </h4>
                <p className="text-white/70 text-base leading-relaxed">
                  Our visualization engine translates complex lifestyle vectors into
                  actionable health insights and productivity scores.
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 w-64 h-64 bg-[#0d7ff2]/10 rounded-full blur-3xl" />
            <div className="absolute right-24 top-1/2 -translate-y-1/3 w-48 h-48 border border-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center">
              <div className="w-32 h-24 bg-white/5 rounded-xl border border-white/10 flex items-center justify-end gap-1 px-3">
                {[40, 60, 35, 75, 50, 65].map((h, i) => (
                  <div key={i} className="w-3 bg-[#0d7ff2]/40 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-white border-t border-slate-200/50 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#0d7ff2] rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-lg">insights</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight font-[Plus_Jakarta_Sans]">LifeAI</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Pioneering the future of personal optimization through ethical AI and
              predictive data science.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">Resources</h5>
            <ul className="space-y-4 text-sm font-semibold text-slate-500">
              <li><a href="#" className="hover:text-[#0d7ff2] transition-colors">Research Whitepaper</a></li>
              <li><a href="#" className="hover:text-[#0d7ff2] transition-colors">Developer API</a></li>
              <li><a href="#" className="hover:text-[#0d7ff2] transition-colors">Community Insights</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">Legal</h5>
            <ul className="space-y-4 text-sm font-semibold text-slate-500">
              <li><a href="#" className="hover:text-[#0d7ff2] transition-colors">Privacy Protocol</a></li>
              <li><a href="#" className="hover:text-[#0d7ff2] transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-[#0d7ff2] transition-colors">Data Governance</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">Join the Circle</h5>
            <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              <input className="bg-transparent border-none rounded-lg px-3 py-2 text-sm w-full focus:ring-0 outline-none" placeholder="your@email.com" type="email" />
              <button className="w-10 h-10 bg-[#0d7ff2] text-white rounded-lg flex items-center justify-center shadow-lg shadow-[#0d7ff2]/20 hover:scale-105 transition-transform shrink-0">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>© 2024 LifeAI Technologies. All rights reserved.</span>
          <span className="text-slate-300">Not intended as medical diagnosis.</span>
        </div>
      </footer>
    </div>
  );
}
