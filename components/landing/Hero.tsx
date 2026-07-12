"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, CheckCircle2, Shield, Zap, AlertTriangle } from "lucide-react";
import { companyInputSchema } from "../../lib/validation";

const EXAMPLE_COMPANIES = ["Apple", "TSLA", "NVIDIA", "Microsoft"];

const TRUST_INDICATORS = [
  { icon: Zap, label: "Real-Time Data Integration" },
  { icon: Shield, label: "No Sign-up Required" },
  { icon: CheckCircle2, label: "Institutional Quality Verification" },
];

export function Hero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (searchQuery.trim()) {
      const result = companyInputSchema.safeParse(searchQuery.trim());
      if (!result.success) {
        result.error.issues[0]?.message ??
          "Please enter a valid company name."
      }
      router.push(`/analyze?company=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleChipClick = (company: string) => {
    setSearchQuery(company);
    setError(null);
    router.push(`/analyze?company=${encodeURIComponent(company)}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 pb-24 overflow-hidden bg-bg-base">

      {/* ─── Animated Gradient Mesh Background ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Blob 1 - top left violet */}
        <motion.div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #7C7CFF 0%, transparent 70%)" }}
          animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Blob 2 - center right blue */}
        <motion.div
          className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)" }}
          animate={{ x: [0, -30, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        {/* Blob 3 - bottom left green-tinted */}
        <motion.div
          className="absolute -bottom-40 left-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #7C7CFF 0%, #3B82F6 40%, transparent 70%)" }}
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1.05, 0.95, 1.05] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        />
      </div>

      {/* ─── Dot Grid Pattern Overlay ─── */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      {/* ─── Main Content ─── */}
      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-12 gap-16 items-center relative z-10">

        {/* ────────── Left Column: Text & Search ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="lg:col-span-7 space-y-8 text-left"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center space-x-2.5 text-accent-violet font-semibold tracking-wider uppercase text-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-violet opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-violet" />
            </span>
            <span>VestPulse | Autonomous Research</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold tracking-tight leading-[1.1]">
            <span className="text-gradient">AI Investment Research.</span>
            <br />
            <span className="text-gradient">Powered by </span>
            <span className="text-accent-violet relative">
              Autonomous
              {/* Subtle underline glow */}
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-accent-violet/60 via-accent-violet/30 to-transparent" />
            </span>
            <span className="text-gradient"> Agents.</span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
            Analyze any public company using live financial statements, real-time news,
            competitor intelligence, and multi-agent reasoning.
          </p>

          {/* Search & Inputs */}
          <div className="pt-1 space-y-5 max-w-xl">
            <form
              onSubmit={handleSearch}
              className="relative w-full flex items-center bg-bg-card/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-1.5 transition-all duration-300 focus-within:border-accent-violet/40 focus-within:shadow-[0_0_20px_rgba(124,124,255,0.12)] group"
            >
              <Search className="w-5 h-5 text-slate-500 group-focus-within:text-accent-violet/60 ml-3.5 mr-2.5 flex-shrink-0 transition-colors duration-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setError(null);
                }}
                placeholder="Search company or ticker (e.g. TSLA)..."
                className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-600 placeholder:font-mono text-sm sm:text-base focus:ring-0 focus:outline-none min-w-0 pr-3"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-accent-violet to-blue-500 hover:from-[#8a8aff] hover:to-blue-400 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 sm:py-3 rounded-lg transition-all duration-300 flex items-center space-x-1.5 flex-shrink-0 hover:shadow-[0_0_16px_rgba(124,124,255,0.3)] hover:scale-[1.02]"
              >
                <span>Analyze</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {error && (
              <div className="flex flex-col text-rose-400 text-sm font-medium bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg backdrop-blur-md">
                <div className="flex items-center space-x-1">
                  <span className="font-bold">⚠ Invalid company name</span>
                </div>
                <span className="text-rose-300 mt-1 whitespace-pre-line leading-relaxed">{error}</span>
              </div>
            )}

            {/* Chip row */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-slate-500">
              <span className="font-mono text-slate-600">Try searching:</span>
              {EXAMPLE_COMPANIES.map((company, index) => (
                <motion.button
                  key={company}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.07 }}
                  onClick={() => handleChipClick(company)}
                  className="bg-bg-card/80 hover:bg-white/[0.06] border border-white/[0.05] hover:border-accent-violet/20 text-slate-300 px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer text-xs hover:shadow-[0_0_12px_rgba(124,124,255,0.08)] hover:text-white"
                >
                  {company}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Trust indicators row */}
          <div className="pt-8 border-t border-white/[0.04] flex flex-wrap gap-x-8 gap-y-4 text-xs text-slate-500 max-w-xl">
            {TRUST_INDICATORS.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.12, ease: "easeOut" }}
                className="flex items-center space-x-2 group"
              >
                <item.icon className="w-3.5 h-3.5 text-accent-violet group-hover:drop-shadow-[0_0_4px_rgba(124,124,255,0.6)] transition-all duration-300" />
                <span className="group-hover:text-slate-400 transition-colors duration-300">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ────────── Right Column: Globe & Mock Data Cards ────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          className="lg:col-span-5 relative h-[520px] w-full hidden lg:flex items-center justify-center select-none"
        >
          {/* Globe/Network Container */}
          <div className="relative w-full h-full max-w-[440px] max-h-[440px] flex items-center justify-center">

            {/* Spinning Dashed Rings */}
            <div className="absolute inset-0 rounded-full border border-white/[0.02] border-dashed animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-5 rounded-full border border-accent-violet/[0.06] border-dashed animate-[spin_40s_linear_infinite_reverse]" />
            <div className="absolute inset-12 rounded-full border border-white/[0.03] animate-[spin_30s_linear_infinite]" />

            {/* Animated gradient orb - pulses violet to blue */}
            <motion.div
              className="absolute w-80 h-80 rounded-full blur-[100px]"
              animate={{
                background: [
                  "radial-gradient(circle, rgba(124,124,255,0.12) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(124,124,255,0.12) 0%, transparent 70%)",
                ],
                scale: [1, 1.15, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Center Core */}
            <div className="absolute w-24 h-24 glass-panel rounded-full flex items-center justify-center z-20 border-white/[0.08] shadow-[0_0_40px_rgba(124,124,255,0.08)]">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              >
                <svg
                  className="w-10 h-10 text-accent-violet drop-shadow-[0_0_8px_rgba(124,124,255,0.4)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </motion.div>
            </div>

            {/* ── Floating Terminal-style Data Cards ── */}

            {/* Card 1: Decision Verdict (INVEST) */}
            <motion.div
              animate={{ y: [0, -8, 0], x: [0, 2, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 glass-panel glass-panel-hover p-4 rounded-xl w-52 z-30 text-left border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
              style={{
                background: "linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.3) 100%)",
              }}
            >
              {/* Top gradient border accent */}
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-violet/30 to-transparent" />
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  Consensus Verdict
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded">
                  NVDA
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-accent-green tracking-wide drop-shadow-[0_0_6px_rgba(0,226,138,0.3)]">
                  INVEST
                </span>
                <span className="text-xs font-mono text-slate-500">Rating</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-2.5">
                <span className="text-[10px] text-slate-500">Confidence Score</span>
                <span className="text-xs font-mono font-bold text-accent-green">92%</span>
              </div>
            </motion.div>

            {/* Card 2: Financial Stats */}
            <motion.div
              animate={{ y: [0, 8, 0], x: [0, -3, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute top-24 -right-14 glass-panel glass-panel-hover p-4 rounded-xl w-48 z-30 text-left border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
              style={{
                background: "linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.3) 100%)",
              }}
            >
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2.5">
                Key Financials
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Revenue</span>
                  <span className="font-mono text-slate-200">$26.04B</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">YoY Growth</span>
                  <span className="font-mono text-accent-green">+268%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Gross Margin</span>
                  <span className="font-mono text-accent-green">76.0%</span>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Price Target & Sentiment */}
            <motion.div
              animate={{ y: [0, -6, 0], x: [0, 4, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute -bottom-6 -left-2 glass-panel glass-panel-hover p-4 rounded-xl w-52 z-30 text-left border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
              style={{
                background: "linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.3) 100%)",
              }}
            >
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-green/20 to-transparent" />
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  Market Outlook
                </span>
                <span className="text-[10px] text-accent-green bg-accent-green/[0.07] px-2 py-0.5 rounded-md font-medium">
                  Bullish
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Price Target</span>
                  <span className="text-sm font-mono text-slate-200">$1,200.00</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Implied Upside</span>
                  <span className="text-xs font-mono text-accent-green">+22.4%</span>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
