"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [merchantCategories, setMerchantCategories] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState("Connecting...");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" | "warn" } | null>(null);

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5050";

  const showToast = (msg: string, type: "ok" | "err" | "warn" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  };

  const pollStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/status`);
      const data = await res.json();
      setModelLoaded(data.model_loaded);
      setIsTraining(data.is_training);
      if (data.merchant_categories) setMerchantCategories(data.merchant_categories);

      if (data.is_training) {
        setStatusMsg("Training...");
      } else if (data.model_loaded) {
        setStatusMsg("Ready");
      } else {
        setStatusMsg("Not loaded");
      }
    } catch {
      setStatusMsg("Offline");
    }
  };

  useEffect(() => {
    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerUpdate = async () => {
    if (isTraining) {
      showToast("Update already running.", "warn");
      return;
    }
    try {
      setIsTraining(true);
      const res = await fetch(`${API_URL}/api/update_features`, { method: "POST" });
      const data = await res.json();
      showToast(data.message || "Update started.", "ok");
    } catch {
      showToast("Failed to trigger update.", "err");
      setIsTraining(false);
    }
  };

  const submitScore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isTraining) {
      showToast("Model is training. Please wait.", "warn");
      return;
    }

    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload: any = {};
    fd.forEach((v, k) => {
      if (k === "phone_number" || k === "merchant_category") {
        payload[k] = String(v);
        return;
      }
      const n = parseFloat(v as string);
      payload[k] = isNaN(n) ? v : n;
    });

    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) {
        showToast(data.error, "err");
      } else {
        setResult(data);
        showToast("Assessment complete.", "ok");
      }
    } catch {
      showToast("Server error. Is the server running?", "err");
    } finally {
      setLoading(false);
    }
  };

  const fmtBDT = (n: number) => {
    if (n === null || n === undefined) return "—";
    if (n >= 100000) return "৳" + (n / 100000).toFixed(2) + "L";
    if (n >= 1000) return "৳" + (n / 1000).toFixed(1) + "K";
    return "৳" + Number(n).toFixed(0);
  };

  const getTierClass = (tier: string) => {
    const m: any = {
      "LOW RISK": "text-green bg-green/10 border-green/20",
      "MODERATE RISK": "text-orange bg-orange/10 border-orange/20",
      "HIGH RISK": "text-red bg-red/10 border-red/20",
      "VERY HIGH RISK": "text-neon bg-neon/10 border-neon/20",
    };
    return m[tier] || "text-red bg-red/10 border-red/20";
  };

  const getSegIndex = (score: number) => {
    if (score < 500) return 0;
    if (score < 600) return 1;
    if (score < 750) return 2;
    return 3;
  };

  const gaugePct = result ? Math.min(100, Math.max(0, ((result.credit_score - 300) / 550) * 100)) : 0;
  const scoreColor = result
    ? result.credit_score >= 750
      ? "text-green"
      : result.credit_score >= 600
      ? "text-orange"
      : result.credit_score >= 500
      ? "text-red"
      : "text-neon"
    : "text-text-primary";

  return (
    <div className="min-h-screen bg-white">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border h-[60px] flex items-center justify-between px-6 lg:px-8">
        <div className="font-bold text-[1.05rem] tracking-tight">
          BNPL <span className="text-neon">Prediction</span> System
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5 text-xs font-semibold text-text-secondary">
            <div
              className={`w-2 h-2 rounded-full ${
                isTraining
                  ? "bg-orange shadow-[0_0_6px_var(--orange)] animate-pulse"
                  : modelLoaded
                  ? "bg-green shadow-[0_0_6px_var(--green)]"
                  : "bg-red shadow-[0_0_6px_var(--red)]"
              }`}
            ></div>
            <span>{statusMsg}</span>
          </div>
          <button
            onClick={triggerUpdate}
            disabled={isTraining}
            className="bg-neon text-white text-xs font-bold tracking-wider px-4 py-2 rounded-lg shadow-neon-glow-sm hover:-translate-y-px hover:shadow-neon-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            UPDATE
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-[100px] pb-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto w-full">
        {isTraining && (
          <div className="flex items-center gap-3 bg-neon-dim border border-neon/20 rounded-xl p-4 mb-8 text-sm font-medium text-text-secondary">
            <div className="w-4 h-4 border-2 border-neon/30 border-t-neon rounded-full animate-spin"></div>
            <span>Model is training on fresh transaction data. This takes approximately 30 to 60 seconds.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Input */}
          <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-xs font-bold tracking-[0.09em] text-text-secondary">CREDIT ASSESSMENT INPUT</h2>
              <span className="text-[0.63rem] font-bold tracking-[0.1em] text-neon bg-neon-dim border border-neon/20 px-2.5 py-1 rounded-full">
                LIVE INFERENCE
              </span>
            </div>
            <div className="p-6">
              <form onSubmit={submitScore} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5">PHONE NUMBER</label>
                  <input
                    type="text"
                    name="phone_number"
                    defaultValue="01712345678"
                    className="w-full bg-white border-1.5 border-border rounded-xl text-sm font-medium px-4 py-3 focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5">TOTAL TRANSACTIONS</label>
                    <input
                      type="number"
                      name="total_transactions"
                      defaultValue={85}
                      className="w-full bg-white border-1.5 border-border rounded-xl text-sm font-medium px-4 py-3 focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5">MONTHLY VOLUME (BDT)</label>
                    <input
                      type="number"
                      name="monthly_volume"
                      defaultValue={45000}
                      className="w-full bg-white border-1.5 border-border rounded-xl text-sm font-medium px-4 py-3 focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5">TRANSACTION SUCCESS RATE</label>
                  <input
                    type="number"
                    step="0.01"
                    name="success_rate"
                    defaultValue={0.92}
                    className="w-full bg-white border-1.5 border-border rounded-xl text-sm font-medium px-4 py-3 focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5">AVG GAP DAYS</label>
                    <input
                      type="number"
                      step="0.1"
                      name="avg_gap_days"
                      defaultValue={3.5}
                      className="w-full bg-white border-1.5 border-border rounded-xl text-sm font-medium px-4 py-3 focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5">MAX GAP DAYS</label>
                    <input
                      type="number"
                      step="0.1"
                      name="max_gap_days"
                      defaultValue={12}
                      className="w-full bg-white border-1.5 border-border rounded-xl text-sm font-medium px-4 py-3 focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5">INSUFFICIENT FUNDS</label>
                    <input
                      type="number"
                      name="insufficient_funds_count"
                      defaultValue={0}
                      className="w-full bg-white border-1.5 border-border rounded-xl text-sm font-medium px-4 py-3 focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5">LATE PAYMENTS</label>
                    <input
                      type="number"
                      name="late_payment_count"
                      defaultValue={0}
                      className="w-full bg-white border-1.5 border-border rounded-xl text-sm font-medium px-4 py-3 focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5">MERCHANT CATEGORY</label>
                  <select
                    name="merchant_category"
                    className="w-full bg-white border-1.5 border-border rounded-xl text-sm font-medium px-4 py-3 focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-all appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23b915ff' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                  >
                    {(merchantCategories.length ? merchantCategories : ["Electronics", "Grocery", "Fashion", "Travel", "Utilities", "Food"]).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || isTraining}
                  className="w-full mt-2 bg-neon text-white text-[0.84rem] font-bold tracking-wider px-6 py-4 rounded-xl shadow-neon-glow-sm hover:-translate-y-px hover:shadow-neon-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "COMPUTING..." : "RUN CREDIT ASSESSMENT"}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Results */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`bg-surface border-1.5 border-border rounded-[16px] p-5 text-center transition-all ${result ? "border-neon bg-neon/5 shadow-[0_0_0_1px_rgba(185,21,255,0.12)] shadow-neon-glow-sm" : ""}`}>
                <div className="text-[0.64rem] font-bold tracking-[0.1em] text-text-muted mb-2">RISK RATIO</div>
                <div className={`text-2xl font-bold tracking-tight leading-none mb-1 ${result ? (result.risk_ratio < 0.2 ? "text-green" : result.risk_ratio < 0.5 ? "text-orange" : "text-red") : "text-text-primary"}`}>
                  {result ? `${(result.risk_ratio * 100).toFixed(2)}%` : "—"}
                </div>
                <div className="text-[0.68rem] text-text-muted">Default probability</div>
              </div>
              
              <div className={`bg-surface border-1.5 border-border rounded-[16px] p-5 text-center transition-all ${result ? "border-neon bg-neon/5 shadow-[0_0_0_1px_rgba(185,21,255,0.12)] shadow-neon-glow-sm" : ""}`}>
                <div className="text-[0.64rem] font-bold tracking-[0.1em] text-text-muted mb-2">CREDIT SCORE</div>
                <div className="text-2xl font-bold tracking-tight leading-none mb-1 text-text-primary">
                  {result ? result.credit_score : "—"}
                </div>
                {result ? (
                  <span className={`inline-block text-[0.62rem] font-bold tracking-[0.09em] px-2.5 py-0.5 rounded-full mt-1 border ${getTierClass(result.risk_tier)}`}>
                    {result.risk_tier}
                  </span>
                ) : (
                  <div className="text-[0.68rem] text-text-muted">Range 300 – 850</div>
                )}
              </div>

              <div className={`bg-surface border-1.5 border-border rounded-[16px] p-5 text-center transition-all ${result ? "border-neon bg-neon/5 shadow-[0_0_0_1px_rgba(185,21,255,0.12)] shadow-neon-glow-sm" : ""}`}>
                <div className="text-[0.64rem] font-bold tracking-[0.1em] text-text-muted mb-2">MAX LIMIT</div>
                <div className="text-2xl font-bold tracking-tight leading-none mb-1 text-text-primary">
                  {result ? fmtBDT(result.max_credit_limit) : "—"}
                </div>
                <div className="text-[0.68rem] text-text-muted">Purchase amount</div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-xs font-bold tracking-[0.09em] text-text-secondary">CREDIT SCORE GAUGE</h2>
                <div className="font-bold text-[0.95rem] text-neon">{result ? result.credit_score : "—"}</div>
              </div>
              <div className="p-6">
                <div className="flex items-baseline gap-2 mb-6">
                  <div className={`text-5xl font-bold tracking-tight leading-none ${scoreColor}`}>
                    {result ? result.credit_score : "—"}
                  </div>
                  <div className="text-xs font-semibold text-text-muted">out of 850</div>
                </div>

                <div className="relative h-2.5 bg-border rounded-full mb-2">
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-red via-orange to-green"
                    style={{ width: `${gaugePct}%`, transition: "width 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                  ></div>
                  <div 
                    className="absolute top-1/2 w-4 h-4 bg-white border-[2.5px] border-neon rounded-full shadow-[0_0_10px_rgba(185,21,255,0.5),_0_2px_6px_rgba(0,0,0,0.15)] -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${gaugePct}%`, transition: "left 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                  ></div>
                </div>

                <div className="flex relative h-7 mt-3">
                  {[300, 500, 600, 750, 850].map((s, i) => (
                    <div key={s} className="absolute flex flex-col items-center -translate-x-1/2" style={{ left: `${i === 0 ? 0 : i === 1 ? 36.4 : i === 2 ? 54.5 : i === 3 ? 81.8 : 100}%` }}>
                      <div className="w-px h-1.5 bg-border mb-1"></div>
                      <div className="text-[0.63rem] font-bold text-text-primary">{s}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-1 mt-6">
                  {[
                    { label: "VERY HIGH RISK", range: "300 – 499", color: "text-neon", bg: "bg-neon/10", active: result && getSegIndex(result.credit_score) === 0 },
                    { label: "HIGH RISK", range: "500 – 599", color: "text-red", bg: "bg-red/10", active: result && getSegIndex(result.credit_score) === 1 },
                    { label: "MODERATE", range: "600 – 749", color: "text-orange", bg: "bg-orange/10", active: result && getSegIndex(result.credit_score) === 2 },
                    { label: "LOW RISK", range: "750 – 850", color: "text-green", bg: "bg-green/10", active: result && getSegIndex(result.credit_score) === 3 },
                  ].map((seg, i) => (
                    <div key={i} className={`flex-1 p-2 border border-transparent rounded-lg text-center transition-all ${seg.active ? `${seg.color} ${seg.bg} border-current` : "text-text-muted"}`}>
                      <div className={`text-[0.58rem] sm:text-[0.62rem] font-bold tracking-[0.06em] mb-0.5 ${seg.active ? seg.color : ""}`}>{seg.label}</div>
                      <div className="text-[0.55rem] sm:text-[0.58rem] font-medium opacity-70">{seg.range}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-[toastIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
          <div className={`bg-white border-1.5 border-border border-l-4 rounded-xl px-5 py-3.5 shadow-[0_6px_24px_rgba(0,0,0,0.1)] text-sm font-medium ${toast.type === "ok" ? "border-l-green" : toast.type === "warn" ? "border-l-orange" : "border-l-red"}`}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
