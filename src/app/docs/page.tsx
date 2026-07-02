"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  { id: "architecture", title: "System Architecture" },
  { id: "dataset", title: "Dataset Generation" },
  { id: "model", title: "Machine Learning Model" },
  { id: "scoring", title: "Scoring Methodology" },
  { id: "workflow", title: "Update Workflow" },
  { id: "future", title: "Future Works" },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition && element.offsetTop + element.offsetHeight > scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border h-[60px] flex justify-center">
        <div className="w-full max-w-[1280px] px-6 lg:px-8 h-full flex items-center justify-between">
          <Link href="/" className="font-bold text-[1.05rem] tracking-tight">
            BNPL <span className="text-neon">Prediction</span> System
          </Link>
          <Link
            href="/"
            className="text-[0.78rem] font-bold tracking-wider text-text-secondary hover:text-neon transition-colors"
          >
            BACK TO ASSESSMENT
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-[100px] pb-32 px-6 lg:px-8 max-w-[1280px] mx-auto w-full flex flex-col md:flex-row gap-12 lg:gap-24 relative">

        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-[100px] flex flex-col gap-4 border-l-2 border-border pl-6">
            <h3 className="text-[0.68rem] font-bold tracking-[0.1em] text-text-muted mb-2 uppercase">Documentation</h3>
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => scrollToSection(e, section.id)}
                className={`text-[0.82rem] font-semibold transition-all relative ${activeSection === section.id ? "text-neon" : "text-text-secondary hover:text-text-primary"
                  }`}
                style={{ textDecoration: 'none' }}
              >
                {section.title}
                {activeSection === section.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -left-[26px] top-1/2 -translate-y-1/2 w-0.5 h-full bg-neon rounded-full shadow-neon-glow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </div>
        </aside>

        {/* Mobile Navigation (Scroll horizontally) */}
        <nav className="md:hidden flex overflow-x-auto gap-4 pb-4 border-b border-border scrollbar-hide">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => scrollToSection(e, section.id)}
              className={`text-[0.75rem] font-bold whitespace-nowrap px-4 py-2 rounded-full transition-all ${activeSection === section.id ? "bg-neon-dim text-neon border border-neon/20 shadow-neon-glow-sm" : "bg-surface text-text-muted border border-transparent"
                }`}
              style={{ textDecoration: 'none' }}
            >
              {section.title}
            </a>
          ))}
        </nav>

        {/* Content Area */}
        <motion.main
          className="flex-1 w-full max-w-3xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeInUp} className="mb-14">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-4 leading-tight">
              System Documentation
            </h1>
            <p className="text-[0.95rem] text-text-muted font-medium">
              A comprehensive technical overview of the AI Credit Scoring Intelligence Platform for Modern Buy Now Pay Later (BNPL) Merchants.
            </p>
          </motion.div>

          <motion.section variants={fadeInUp} id="architecture" className="mb-16 scroll-mt-24 relative group">
            <h2 className="text-2xl font-bold text-text-primary mb-5 tracking-tight relative">
              <span className="text-neon mr-3 opacity-60">01.</span>System Architecture
            </h2>
            <div className="p-8 bg-surface rounded-3xl border border-border group-hover:border-neon/30 transition-colors duration-500 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
              <p className="text-[0.9rem] leading-relaxed text-text-secondary relative z-10">
                The BNPL Prediction System represents a decoupled, high-throughput microservice architecture.
                The presentation layer leverages a React-based Next.js application designed with strict native-app visual paradigms,
                utilizing Tailwind CSS for zero-runtime styling and Framer Motion for hardware-accelerated micro-interactions.
                <br /><br />
                The backend infrastructure is a stateless Flask REST API that orchestrates on-the-fly execution of a highly optimized
                XGBoost machine learning pipeline. The API manages inference requests in real-time while safely isolating
                heavy retraining cycles in asynchronous background threads.
              </p>
            </div>
          </motion.section>

          <motion.section variants={fadeInUp} id="dataset" className="mb-16 scroll-mt-24 relative group">
            <h2 className="text-2xl font-bold text-text-primary mb-5 tracking-tight relative">
              <span className="text-neon mr-3 opacity-60">02.</span>Dataset Generation
            </h2>
            <div className="p-8 bg-surface rounded-3xl border border-border group-hover:border-neon/30 transition-colors duration-500 shadow-sm relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-neon/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2"></div>
              <p className="text-[0.9rem] leading-relaxed text-text-secondary mb-6 relative z-10">
                Data acts as the foundation of the intelligence pipeline. The current implementation programmatically generates
                a highly sophisticated, probabilistic synthetic transaction matrix of 50,000 distinct records. It mathematically models
                real-world BNPL behavioral constraints by categorizing populations into rigid latent risk tiers prior to feature distribution sampling.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <div className="bg-white border border-border rounded-xl p-5 hover:shadow-neon-glow-sm hover:border-neon/40 transition-all">
                  <h4 className="text-[0.75rem] font-bold text-neon mb-2 tracking-wider">VOLATILITY METRICS</h4>
                  <p className="text-[0.82rem] text-text-muted">Avg Gap Days and Max Gap Days accurately measure cash-flow consistency and transactional latency between gateway events.</p>
                </div>
                <div className="bg-white border border-border rounded-xl p-5 hover:shadow-neon-glow-sm hover:border-neon/40 transition-all">
                  <h4 className="text-[0.75rem] font-bold text-neon mb-2 tracking-wider">NEGATIVE SIGNALS</h4>
                  <p className="text-[0.82rem] text-text-muted">Insufficient Funds Count and Late Payments heavily penalize the log-odds ratio, acting as the strongest indicators of imminent default.</p>
                </div>
                <div className="bg-white border border-border rounded-xl p-5 hover:shadow-neon-glow-sm hover:border-neon/40 transition-all md:col-span-2">
                  <h4 className="text-[0.75rem] font-bold text-neon mb-2 tracking-wider">CATEGORICAL ISOLATION</h4>
                  <p className="text-[0.82rem] text-text-muted">Merchant Vertical classification (Electronics, Grocery, Fashion, etc.) is strictly One-Hot Encoded to calculate independent vertical purchase variance devoid of ordinal bias.</p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section variants={fadeInUp} id="model" className="mb-16 scroll-mt-24 relative group">
            <h2 className="text-2xl font-bold text-text-primary mb-5 tracking-tight relative">
              <span className="text-neon mr-3 opacity-60">03.</span>Machine Learning Model
            </h2>
            <div className="p-8 bg-surface rounded-3xl border border-border group-hover:border-neon/30 transition-colors duration-500 shadow-sm relative overflow-hidden">
              <div className="absolute top-1/2 left-0 w-64 h-64 bg-neon/5 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/2"></div>
              <p className="text-[0.9rem] leading-relaxed text-text-secondary mb-6 relative z-10">
                Inference is powered by an advanced <strong>XGBoost Gradient Boosting Classifier</strong>. The model is specifically parameterized
                to navigate complex, non-linear financial behaviors while aggressively minimizing false negatives via calculated class-weight adjustments.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
                <div className="flex flex-col items-center justify-center bg-white border border-border rounded-xl py-4">
                  <span className="text-[1.5rem] font-bold text-text-primary">500</span>
                  <span className="text-[0.62rem] font-bold tracking-widest text-text-muted uppercase mt-1">Estimators</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-white border border-border rounded-xl py-4">
                  <span className="text-[1.5rem] font-bold text-text-primary">8</span>
                  <span className="text-[0.62rem] font-bold tracking-widest text-text-muted uppercase mt-1">Max Depth</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-white border border-border rounded-xl py-4">
                  <span className="text-[1.5rem] font-bold text-text-primary">0.05</span>
                  <span className="text-[0.62rem] font-bold tracking-widest text-text-muted uppercase mt-1">Learning Rate</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-neon-dim border border-neon/20 shadow-neon-glow-sm rounded-xl py-4">
                  <span className="text-[1.5rem] font-bold text-neon">99.4%</span>
                  <span className="text-[0.62rem] font-bold tracking-widest text-text-primary uppercase mt-1">Validation AUC</span>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section variants={fadeInUp} id="scoring" className="mb-16 scroll-mt-24 relative group">
            <h2 className="text-2xl font-bold text-text-primary mb-5 tracking-tight relative">
              <span className="text-neon mr-3 opacity-60">04.</span>Scoring Methodology
            </h2>
            <div className="p-8 bg-surface rounded-3xl border border-border group-hover:border-neon/30 transition-colors duration-500 shadow-sm relative overflow-hidden">
              <p className="text-[0.9rem] leading-relaxed text-text-secondary mb-6 relative z-10">
                The inference pipeline ingests raw transaction features and executes deterministic transformations before yielding three distinct metric outputs.
              </p>

              <div className="space-y-4 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white border border-border rounded-xl p-5 hover:border-neon/30 transition-colors">
                  <div className="bg-neon/10 text-neon font-bold text-[0.75rem] px-3 py-1.5 rounded-lg w-max shrink-0">RISK RATIO</div>
                  <p className="text-[0.82rem] text-text-secondary">The absolute probability tensor output from the XGBoost terminal nodes. Represents the likelihood of a 90-day delinquency event (Range: 0.0 to 1.0).</p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white border border-border rounded-xl p-5 hover:border-neon/30 transition-colors">
                  <div className="bg-neon/10 text-neon font-bold text-[0.75rem] px-3 py-1.5 rounded-lg w-max shrink-0">CREDIT SCORE</div>
                  <p className="text-[0.82rem] text-text-secondary">Linear interpolation mapping the inverted Risk Ratio onto a human-readable, traditional consumer credit scale (Range: 300 to 850).</p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white border border-border rounded-xl p-5 hover:border-neon/30 transition-colors">
                  <div className="bg-neon/10 text-neon font-bold text-[0.75rem] px-3 py-1.5 rounded-lg w-max shrink-0">MAX LIMIT</div>
                  <p className="text-[0.82rem] text-text-secondary">A highly dynamic purchasing threshold computed via Volume, Success Rate, and stringent penalty deductions for historical financial negligence.</p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section variants={fadeInUp} id="workflow" className="mb-16 scroll-mt-24 relative group">
            <h2 className="text-2xl font-bold text-text-primary mb-5 tracking-tight relative">
              <span className="text-neon mr-3 opacity-60">05.</span>Update Workflow
            </h2>
            <div className="p-8 bg-surface rounded-3xl border border-border group-hover:border-neon/30 transition-colors duration-500 shadow-sm relative overflow-hidden">
              <p className="text-[0.9rem] leading-relaxed text-text-secondary mb-6 relative z-10">
                To guarantee state-of-the-art predictive relevance, the architecture supports zero-downtime, continuous feature matrix regeneration
                and model hot-swapping via an asynchronous 24-hour cycle.
              </p>

              <div className="relative border-l-2 border-neon/30 ml-3 pl-6 space-y-6 z-10">
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-neon rounded-full -left-[31px] top-1 shadow-neon-glow-sm"></div>
                  <h4 className="text-[0.85rem] font-bold text-text-primary mb-1">Matrix Generation</h4>
                  <p className="text-[0.8rem] text-text-muted">A fresh dataset of 50,000 synthetic transaction patterns is synthesized to simulate the latest consumer trends.</p>
                </div>
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-neon rounded-full -left-[31px] top-1 shadow-neon-glow-sm"></div>
                  <h4 className="text-[0.85rem] font-bold text-text-primary mb-1">Tensor Preparation & Encoding</h4>
                  <p className="text-[0.8rem] text-text-muted">Categorical strings are One-Hot Encoded and arrays are reshaped and normalized for the boosting algorithms.</p>
                </div>
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-neon rounded-full -left-[31px] top-1 shadow-neon-glow-sm"></div>
                  <h4 className="text-[0.85rem] font-bold text-text-primary mb-1">Background Training Cycle</h4>
                  <p className="text-[0.8rem] text-text-muted">The XGBoost compiler rebuilds the trees over 500 estimators. Conducted entirely on an isolated worker thread.</p>
                </div>
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-neon rounded-full -left-[31px] top-1 shadow-neon-glow-sm"></div>
                  <h4 className="text-[0.85rem] font-bold text-text-primary mb-1">Zero-Downtime Hot Swap</h4>
                  <p className="text-[0.8rem] text-text-muted">Upon validation, the new binary artifacts overwrite previous iterations. The inference singleton reloads instantly into memory.</p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section variants={fadeInUp} id="future" className="mb-20 scroll-mt-24 relative group">
            <h2 className="text-2xl font-bold text-text-primary mb-5 tracking-tight relative">
              <span className="text-neon mr-3 opacity-60">06.</span>Future Works
            </h2>
            <div className="p-8 bg-surface rounded-3xl border border-border group-hover:border-neon/30 transition-colors duration-500 shadow-sm relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
              <ul className="list-none space-y-4 relative z-10">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-neon shrink-0 shadow-neon-glow-sm"></div>
                  <p className="text-[0.85rem] text-text-secondary leading-relaxed">
                    <strong className="text-text-primary block mb-0.5">Integration of Real Production Telemetry</strong>
                    Transition from the synthetic probability matrix to verified, historically labeled payment gateway transaction pipelines.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-neon shrink-0 shadow-neon-glow-sm"></div>
                  <p className="text-[0.85rem] text-text-secondary leading-relaxed">
                    <strong className="text-text-primary block mb-0.5">Deep Learning Sequence Modeling</strong>
                    Experiment with Recurrent Neural Networks (LSTMs) or Transformers to analyze chronologically ordered transaction time-series data for temporal pattern recognition.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-neon shrink-0 shadow-neon-glow-sm"></div>
                  <p className="text-[0.85rem] text-text-secondary leading-relaxed">
                    <strong className="text-text-primary block mb-0.5">Explainable AI (SHAP)</strong>
                    Implement real-time Shapley Additive Explanations on the frontend to provide transparent, human-readable rationale for every individual credit denial or approval.
                  </p>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Footer / Credit */}
          <motion.footer
            variants={fadeInUp}
            className="pt-10 border-t border-border mt-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div>
              <p className="text-[0.75rem] font-bold text-text-muted tracking-widest uppercase mb-2">Developed By</p>
              <p className="text-[1.1rem] font-bold text-text-primary tracking-tight">MD. Ibrahim Khalil</p>
            </div>
            <div className="flex flex-col md:items-end gap-1">
              <a href="tel:01304984437" className="text-[0.85rem] font-medium text-text-secondary hover:text-neon transition-colors" style={{ textDecoration: 'none' }}>
                01304984437
              </a>
              <a href="mailto:eng.mdibrahimkhalil@gmail.com" className="text-[0.85rem] font-medium text-text-secondary hover:text-neon transition-colors" style={{ textDecoration: 'none' }}>
                eng.mdibrahimkhalil@gmail.com
              </a>
            </div>
          </motion.footer>

        </motion.main>
      </div>
    </div>
  );
}
