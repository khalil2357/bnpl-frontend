"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [merchantCategories, setMerchantCategories] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState("Connecting...");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mobile App State
  const [activeTab, setActiveTab] = useState<"input" | "results">("input");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5050";

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
    setIsMenuOpen(false); 
    if (isTraining) return;
    try {
      setIsTraining(true);
      await fetch(`${API_URL}/api/update_features`, { method: "POST" });
    } catch {
      setIsTraining(false);
    }
  };

  const submitScore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isTraining) return;

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
      // Simulate slight network delay for premium feel
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.error) {
        setResult(data);
        setActiveTab("results");
      }
    } catch {
      // Fail silently as requested (no toasts)
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
    <div className="bg-surface md:bg-white h-[100dvh] md:min-h-screen w-full overflow-hidden md:overflow-visible flex flex-col relative">
      
      {/* Topbar (Desktop Only) */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border h-[60px] justify-center">
        <div className="w-full max-w-[1280px] px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="font-bold text-[1.05rem] tracking-tight">
            BNPL <span className="text-neon">Prediction</span> System
          </div>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-[0.78rem] font-bold tracking-wider text-text-secondary hover:text-neon transition-colors" style={{ textDecoration: 'none' }}>
              VIEW DOCUMENTATION
            </Link>
            <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5 text-xs font-semibold text-text-secondary">
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
              className="bg-neon text-white text-[0.78rem] font-bold tracking-wider px-5 py-2 rounded-[100px] shadow-neon-glow-sm hover:-translate-y-px hover:shadow-neon-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              UPDATE
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:pt-[100px] md:pb-24 px-0 md:px-6 lg:px-8 max-w-[1280px] mx-auto w-full h-full md:h-auto overflow-hidden md:overflow-visible relative z-10">
        
        {/* Desktop Training Indicator */}
        <AnimatePresence>
          {isTraining && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="hidden md:block w-full overflow-hidden"
            >
              <div className="flex flex-col p-6 bg-surface border border-neon/30 rounded-[20px] shadow-[0_0_30px_rgba(185,21,255,0.06)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-neon/10">
                  <motion.div 
                    className="h-full bg-neon shadow-[0_0_10px_rgba(185,21,255,0.8)]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 45, ease: "linear" }}
                  />
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-neon/5 rounded-full blur-[40px]"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="relative w-12 h-12 shrink-0">
                    <motion.div className="absolute inset-0 border-[3px] border-neon/20 rounded-full"></motion.div>
                    <motion.div 
                      className="absolute inset-0 border-[3px] border-neon border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    ></motion.div>
                    <motion.div 
                      className="absolute inset-2 bg-neon/10 rounded-full flex items-center justify-center"
                      animate={{ scale: [0.8, 1.1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="w-1.5 h-1.5 bg-neon rounded-full"></div>
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="text-[1.05rem] font-bold text-text-primary tracking-tight mb-0.5">Synthesizing Intelligence...</h3>
                    <p className="text-[0.85rem] font-medium text-text-secondary">
                      The XGBoost model is currently training on a fresh matrix of 50,000 synthetic transactions. <br/>
                      <span className="text-text-muted">This background process takes approximately 30 to 60 seconds without downtime.</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 items-start h-full md:h-auto overflow-hidden md:overflow-visible relative">
          
          {/* Left: Input Form (Tab 1 on Mobile) */}
          <div className={`absolute inset-0 md:relative h-full md:h-auto flex-col md:block ${activeTab === 'input' ? 'flex' : 'hidden'} md:flex z-10 bg-surface md:bg-transparent`}>
            
            {/* Mobile Beautiful Curved Header */}
            <div className="md:hidden relative pb-10 pt-12 px-6 shrink-0 bg-neon overflow-hidden rounded-b-[40px] shadow-neon-glow-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-[30px] translate-y-1/2 -translate-x-1/3"></div>
              <div className="relative z-10 text-white">
                <h1 className="text-3xl font-bold tracking-tight mb-1">New Assessment</h1>
                <p className="text-[0.85rem] text-white/80 font-medium">AI-powered credit intelligence</p>
              </div>
            </div>

            <div className="md:bg-white md:border border-border md:rounded-[18px] flex-1 overflow-y-auto md:overflow-visible scrollbar-hide pb-28 md:pb-0 relative z-20 -mt-6 md:mt-0 px-4 md:px-0">
              <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-xs font-bold tracking-[0.09em] text-text-secondary">CREDIT ASSESSMENT INPUT</h2>
                <span className="text-[0.63rem] font-bold tracking-[0.1em] text-neon bg-neon-dim border border-neon/20 px-2.5 py-1 rounded-full">
                  LIVE INFERENCE
                </span>
              </div>
              
              <div className="bg-white md:bg-transparent rounded-[24px] md:rounded-none shadow-sm md:shadow-none p-5 md:p-6 mb-8 md:mb-0">
                <form onSubmit={submitScore} className="flex flex-col gap-5 md:gap-4">
                  <div>
                    <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5 ml-1">PHONE NUMBER</label>
                    <input
                      type="text"
                      name="phone_number"
                      defaultValue="01712345678"
                      className="w-full bg-surface/80 md:bg-white border-1.5 border-border rounded-[16px] text-sm font-semibold px-4 py-3.5 md:py-3 focus:outline-none focus:border-neon focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:gap-3">
                    <div>
                      <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5 ml-1">TOTAL TRANS.</label>
                      <input
                        type="number"
                        name="total_transactions"
                        defaultValue={85}
                        className="w-full bg-surface/80 md:bg-white border-1.5 border-border rounded-[16px] text-sm font-semibold px-4 py-3.5 md:py-3 focus:outline-none focus:border-neon focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5 ml-1">MONTHLY VOL</label>
                      <input
                        type="number"
                        name="monthly_volume"
                        defaultValue={45000}
                        className="w-full bg-surface/80 md:bg-white border-1.5 border-border rounded-[16px] text-sm font-semibold px-4 py-3.5 md:py-3 focus:outline-none focus:border-neon focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5 ml-1">SUCCESS RATE (0-1)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="success_rate"
                      defaultValue={0.92}
                      className="w-full bg-surface/80 md:bg-white border-1.5 border-border rounded-[16px] text-sm font-semibold px-4 py-3.5 md:py-3 focus:outline-none focus:border-neon focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:gap-3">
                    <div>
                      <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5 ml-1">AVG GAP DAYS</label>
                      <input
                        type="number"
                        step="0.1"
                        name="avg_gap_days"
                        defaultValue={3.5}
                        className="w-full bg-surface/80 md:bg-white border-1.5 border-border rounded-[16px] text-sm font-semibold px-4 py-3.5 md:py-3 focus:outline-none focus:border-neon focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5 ml-1">MAX GAP DAYS</label>
                      <input
                        type="number"
                        step="0.1"
                        name="max_gap_days"
                        defaultValue={12}
                        className="w-full bg-surface/80 md:bg-white border-1.5 border-border rounded-[16px] text-sm font-semibold px-4 py-3.5 md:py-3 focus:outline-none focus:border-neon focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:gap-3">
                    <div>
                      <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5 ml-1">NO FUNDS CNT</label>
                      <input
                        type="number"
                        name="insufficient_funds_count"
                        defaultValue={0}
                        className="w-full bg-surface/80 md:bg-white border-1.5 border-border rounded-[16px] text-sm font-semibold px-4 py-3.5 md:py-3 focus:outline-none focus:border-neon focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5 ml-1">LATE PAYMENTS</label>
                      <input
                        type="number"
                        name="late_payment_count"
                        defaultValue={0}
                        className="w-full bg-surface/80 md:bg-white border-1.5 border-border rounded-[16px] text-sm font-semibold px-4 py-3.5 md:py-3 focus:outline-none focus:border-neon focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.68rem] font-bold tracking-wider text-text-muted mb-1.5 ml-1">MERCHANT CATEGORY</label>
                    <div className="relative">
                      <select
                        name="merchant_category"
                        className="w-full bg-surface/80 md:bg-white border-1.5 border-border rounded-[16px] text-sm font-semibold px-4 py-3.5 md:py-3 focus:outline-none focus:border-neon focus:bg-white transition-all shadow-sm appearance-none"
                      >
                        {(merchantCategories.length ? merchantCategories : ["Electronics", "Grocery", "Fashion", "Travel", "Utilities", "Food"]).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isTraining}
                    className="w-full mt-4 bg-neon text-white text-[0.9rem] font-bold tracking-wider px-6 py-4 rounded-[100px] shadow-neon-glow-sm hover:scale-[1.02] hover:shadow-neon-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    RUN ASSESSMENT
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right: Results (Tab 2 on Mobile) */}
          <div className={`absolute inset-0 md:relative h-full md:h-auto flex-col md:flex ${activeTab === 'results' ? 'flex' : 'hidden'} md:flex z-10 bg-surface md:bg-transparent`}>
            
            {/* Mobile Beautiful Curved Header for Results */}
            <div className="md:hidden relative pb-10 pt-12 px-6 shrink-0 bg-[#12141d] overflow-hidden rounded-b-[40px] shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon/30 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-[40px] translate-y-1/3 -translate-x-1/3"></div>
              <div className="relative z-10 text-white">
                <h1 className="text-3xl font-bold tracking-tight mb-1">Intelligence</h1>
                <p className="text-[0.85rem] text-white/70 font-medium">Model output & risk metrics</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto md:overflow-visible scrollbar-hide pb-28 md:pb-0 px-4 md:px-0 relative z-20 -mt-6 md:mt-0">
              <div className="flex flex-col gap-4 md:gap-6">
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <div className={`bg-white md:bg-surface border-1.5 border-border rounded-[20px] md:rounded-[16px] py-5 px-2 md:p-5 text-center transition-all shadow-sm md:shadow-none ${result ? "border-neon bg-neon/5 shadow-neon-glow-sm" : ""}`}>
                    <div className="text-[0.55rem] md:text-[0.64rem] font-bold tracking-[0.1em] text-text-muted mb-1 md:mb-2">RISK RATIO</div>
                    <div className={`text-xl md:text-2xl font-bold tracking-tight leading-none mb-1 ${result ? (result.risk_ratio < 0.2 ? "text-green" : result.risk_ratio < 0.5 ? "text-orange" : "text-red") : "text-text-primary"}`}>
                      {result ? `${(result.risk_ratio * 100).toFixed(1)}%` : "—"}
                    </div>
                  </div>
                  
                  <div className={`bg-white md:bg-surface border-1.5 border-border rounded-[20px] md:rounded-[16px] py-5 px-2 md:p-5 text-center transition-all shadow-sm md:shadow-none ${result ? "border-neon bg-neon/5 shadow-neon-glow-sm" : ""}`}>
                    <div className="text-[0.55rem] md:text-[0.64rem] font-bold tracking-[0.1em] text-text-muted mb-1 md:mb-2">SCORE</div>
                    <div className="text-xl md:text-2xl font-bold tracking-tight leading-none mb-1 text-text-primary">
                      {result ? result.credit_score : "—"}
                    </div>
                  </div>

                  <div className={`bg-white md:bg-surface border-1.5 border-border rounded-[20px] md:rounded-[16px] py-5 px-2 md:p-5 text-center transition-all shadow-sm md:shadow-none ${result ? "border-neon bg-neon/5 shadow-neon-glow-sm" : ""}`}>
                    <div className="text-[0.55rem] md:text-[0.64rem] font-bold tracking-[0.1em] text-text-muted mb-1 md:mb-2">LIMIT</div>
                    <div className="text-xl md:text-2xl font-bold tracking-tight leading-none mb-1 text-text-primary">
                      {result ? fmtBDT(result.max_credit_limit) : "—"}
                    </div>
                  </div>
                </div>

                {/* Gauge Card */}
                <div className="bg-white md:bg-surface border-1.5 border-border rounded-[24px] md:rounded-[18px] overflow-hidden shadow-sm md:shadow-none">
                  <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xs font-bold tracking-[0.09em] text-text-secondary">CREDIT SCORE GAUGE</h2>
                    <div className="font-bold text-[0.95rem] text-neon">{result ? result.credit_score : "—"}</div>
                  </div>
                  <div className="p-6 md:p-6">
                    <div className="flex items-center justify-between md:justify-start gap-2 mb-8">
                      <div className="flex items-baseline gap-2">
                        <div className={`text-5xl font-bold tracking-tight leading-none ${scoreColor}`}>
                          {result ? result.credit_score : "—"}
                        </div>
                        <div className="text-[0.7rem] md:text-xs font-bold text-text-muted">/ 850</div>
                      </div>
                      {result && (
                        <div className="md:hidden">
                          <span className={`inline-block text-[0.65rem] font-bold tracking-[0.1em] px-3 py-1.5 rounded-full border ${getTierClass(result.risk_tier)}`}>
                            {result.risk_tier}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative h-3 md:h-2.5 bg-surface md:bg-border rounded-full mb-2 border border-border md:border-0 shadow-inner">
                      <div 
                        className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-red via-orange to-green"
                        style={{ width: `${gaugePct}%`, transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
                      ></div>
                      <div 
                        className="absolute top-1/2 w-5 h-5 md:w-4 md:h-4 bg-white border-[3px] border-neon rounded-full shadow-[0_0_12px_rgba(185,21,255,0.6),_0_2px_8px_rgba(0,0,0,0.15)] -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${gaugePct}%`, transition: "left 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
                      ></div>
                    </div>

                    <div className="flex relative h-7 mt-4">
                      {[300, 500, 600, 750, 850].map((s, i) => (
                        <div key={s} className="absolute flex flex-col items-center -translate-x-1/2" style={{ left: `${i === 0 ? 0 : i === 1 ? 36.4 : i === 2 ? 54.5 : i === 3 ? 81.8 : 100}%` }}>
                          <div className="w-px h-1.5 bg-border mb-1.5"></div>
                          <div className="text-[0.6rem] md:text-[0.63rem] font-bold text-text-secondary">{s}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-1 mt-8">
                      {[
                        { label: "VERY HIGH", range: "300–499", color: "text-neon", bg: "bg-neon/10", active: result && getSegIndex(result.credit_score) === 0 },
                        { label: "HIGH RISK", range: "500–599", color: "text-red", bg: "bg-red/10", active: result && getSegIndex(result.credit_score) === 1 },
                        { label: "MODERATE", range: "600–749", color: "text-orange", bg: "bg-orange/10", active: result && getSegIndex(result.credit_score) === 2 },
                        { label: "LOW RISK", range: "750–850", color: "text-green", bg: "bg-green/10", active: result && getSegIndex(result.credit_score) === 3 },
                      ].map((seg, i) => (
                        <div key={i} className={`flex-1 min-w-[45%] md:min-w-0 p-3 md:p-2 border border-transparent rounded-[12px] md:rounded-lg text-center transition-all ${seg.active ? `${seg.color} ${seg.bg} border-current shadow-sm` : "bg-surface md:bg-transparent text-text-muted"}`}>
                          <div className={`text-[0.6rem] md:text-[0.62rem] font-bold tracking-[0.08em] mb-1 md:mb-0.5 ${seg.active ? seg.color : ""}`}>{seg.label}</div>
                          <div className="text-[0.55rem] md:text-[0.58rem] font-semibold opacity-70">{seg.range}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {!result && !loading && (
                  <div className="md:hidden flex flex-col items-center justify-center text-center p-10 bg-white border-1.5 border-border rounded-[24px] opacity-80 mt-2 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-neon/10 flex items-center justify-center mb-4">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neon">
                        <path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                    </div>
                    <p className="text-[0.95rem] font-bold text-text-primary mb-1.5">No Assessment Yet</p>
                    <p className="text-[0.78rem] text-text-secondary leading-relaxed max-w-[200px]">Run a credit assessment from the input tab to see results here.</p>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Full Screen Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="relative w-20 h-20 mb-6">
              <motion.div 
                className="absolute inset-0 border-4 border-neon/20 rounded-full"
              ></motion.div>
              <motion.div 
                className="absolute inset-0 border-4 border-neon border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
              <motion.div 
                className="absolute inset-2 bg-neon/10 rounded-full flex items-center justify-center"
                animate={{ scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-2 h-2 bg-neon rounded-full"></div>
              </motion.div>
            </div>
            <motion.h3 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-text-primary tracking-tight mb-2"
            >
              Computing Intelligence
            </motion.h3>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-medium text-text-muted"
            >
              Running XGBoost Inference...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[75px] bg-white border-t border-border flex justify-around items-center px-4 pb-[env(safe-area-inset-bottom)] z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <button 
          onClick={() => setActiveTab("input")}
          className="relative flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors"
        >
          {activeTab === 'input' && (
            <motion.div layoutId="navIndicator" className="absolute top-0 w-10 h-0.5 bg-neon rounded-b-full shadow-neon-glow-sm" />
          )}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={activeTab === 'input' ? 'text-neon' : 'text-text-muted'}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span className={`text-[0.65rem] font-bold tracking-wide ${activeTab === 'input' ? 'text-neon' : 'text-text-muted'}`}>Input</span>
        </button>
        <button 
          onClick={() => setActiveTab("results")}
          className="relative flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors"
        >
          {activeTab === 'results' && (
            <motion.div layoutId="navIndicator" className="absolute top-0 w-10 h-0.5 bg-neon rounded-b-full shadow-neon-glow-sm" />
          )}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={activeTab === 'results' ? 'text-neon' : 'text-text-muted'}>
            <path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path>
          </svg>
          <span className={`text-[0.65rem] font-bold tracking-wide ${activeTab === 'results' ? 'text-neon' : 'text-text-muted'}`}>Results</span>
        </button>
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full gap-1.5 text-text-muted hover:text-text-secondary transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>
          </svg>
          <span className="text-[0.65rem] font-bold tracking-wide">Menu</span>
        </button>
      </nav>

      {/* Animated Bottom Sheet Menu (Mobile Only) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-[#12141d]/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 border-t border-border shadow-[0_-20px_40px_rgba(0,0,0,0.15)] overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              <div className="w-full flex justify-center py-4">
                <div className="w-12 h-1.5 bg-border rounded-full"></div>
              </div>
              <div className="p-6 pt-2 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xl text-text-primary tracking-tight">BNPL Core</h3>
                    <p className="text-[0.8rem] font-semibold text-text-muted mt-0.5">App Configuration</p>
                  </div>
                  <div className="flex items-center gap-2 bg-surface border-1.5 border-border rounded-[100px] px-3.5 py-1.5 text-[0.65rem] font-bold text-text-secondary shadow-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isTraining
                          ? "bg-orange shadow-[0_0_8px_var(--orange)] animate-pulse"
                          : modelLoaded
                          ? "bg-green shadow-[0_0_8px_var(--green)]"
                          : "bg-red shadow-[0_0_8px_var(--red)]"
                      }`}
                    ></div>
                    <span>{statusMsg}</span>
                  </div>
                </div>

                <div className="w-full h-px bg-border my-0"></div>

                <Link 
                  href="/docs" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between bg-surface border-1.5 border-border rounded-[20px] p-4 text-text-primary active:scale-[0.98] transition-all shadow-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-border shadow-sm">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <div>
                      <div className="text-[0.9rem] font-bold tracking-wide">System Docs</div>
                      <div className="text-[0.7rem] font-semibold text-text-muted mt-0.5">Read technical details</div>
                    </div>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </Link>

                <button
                  onClick={triggerUpdate}
                  disabled={isTraining}
                  className="w-full bg-neon text-white text-[0.9rem] font-bold tracking-wider px-4 py-4.5 rounded-[100px] shadow-neon-glow-sm hover:shadow-neon-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 active:scale-[0.98]"
                >
                  {isTraining ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      TRAINING MODEL...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21v-5h5"></path></svg>
                      UPDATE FEATURES
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
