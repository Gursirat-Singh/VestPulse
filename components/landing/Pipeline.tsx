"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  LineChart,
  Newspaper,
  Users,
  ShieldAlert,
  BrainCircuit,
  FileText,
} from "lucide-react";

/* ── pipeline steps ────────────────────────────────── */
const steps = [
  { id: 1, title: "Resolve Entity", icon: Building2, desc: "Identifies tickers, aliases and CIK codes across global markets" },
  { id: 2, title: "Financials", icon: LineChart, desc: "Pulls income, balance sheet and cash-flow statements" },
  { id: 3, title: "News & Sentiment", icon: Newspaper, desc: "Scrapes live market news and scores sentiment signals" },
  { id: 4, title: "Competitors", icon: Users, desc: "Maps peer landscape and relative industry positioning" },
  { id: 5, title: "Risk Scan", icon: ShieldAlert, desc: "Identifies operational, regulatory and macro hazards" },
  { id: 6, title: "AI Committee", icon: BrainCircuit, desc: "Multi-agent consensus debate across analyst personas" },
  { id: 7, title: "Final Report", icon: FileText, desc: "Generates institutional-grade investment artifact" },
];

/* ── step card ─────────────────────────────────────── */
function StepCard({
  step,
  index,
  total,
}: {
  step: (typeof steps)[number];
  index: number;
  total: number;
}) {
  const Icon = step.icon;
  const isLast = index === total - 1;

  return (
    <div className="relative flex flex-row lg:flex-col items-start lg:items-center gap-5 lg:gap-0">
      {/* ── vertical connector (mobile only) ────── */}
      {!isLast && (
        <div className="lg:hidden absolute left-[23px] top-[52px] bottom-0 w-px">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full origin-top bg-gradient-to-b from-accent-violet/50 to-transparent"
          />
        </div>
      )}

      {/* ── number badge ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: index * 0.08, type: "spring", stiffness: 260, damping: 20 }}
        className="
          relative z-20 flex-shrink-0
          w-12 h-12 rounded-full
          flex items-center justify-center
          bg-gradient-to-br from-accent-violet/90 to-accent-violet/40
          shadow-[0_0_20px_rgba(124,124,255,0.25)]
          text-white text-sm font-bold font-mono
          lg:mb-5
        "
      >
        {String(step.id).padStart(2, "0")}
      </motion.div>

      {/* ── card body ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay: 0.1 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="
          group relative flex-1 lg:flex-initial lg:w-full
          glass-panel rounded-2xl overflow-hidden
          px-5 py-5 lg:px-4 lg:py-6
          flex flex-col lg:items-center lg:text-center
          transition-all duration-500
          hover:-translate-y-1
          hover:border-accent-violet/20
          hover:shadow-[0_8px_40px_rgba(124,124,255,0.08)]
          cursor-default
          mb-6 lg:mb-0
        "
      >
        {/* hover glow */}
        <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-accent-violet/0 group-hover:bg-accent-violet/[0.06] blur-3xl transition-all duration-700" />

        {/* icon container */}
        <div
          className="
            relative z-10 w-11 h-11 rounded-xl mb-3
            flex items-center justify-center
            bg-accent-violet/[0.08] border border-accent-violet/10
            group-hover:bg-accent-violet/[0.14] group-hover:border-accent-violet/25
            transition-all duration-400
          "
        >
          <Icon className="w-5 h-5 text-accent-violet" strokeWidth={1.8} />
        </div>

        {/* title */}
        <h3 className="relative z-10 text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
          {step.title}
        </h3>

        {/* description */}
        <p className="relative z-10 mt-1.5 text-xs leading-relaxed text-slate-500 group-hover:text-slate-400 transition-colors lg:max-w-[160px]">
          {step.desc}
        </p>
      </motion.div>
    </div>
  );
}

/* ── horizontal connecting line (desktop) ──────────── */
function DesktopConnector() {
  return (
    <div className="hidden lg:block absolute top-[24px] left-[7%] right-[7%] z-10 h-px">
      {/* background track */}
      <div className="absolute inset-0 bg-white/[0.04] rounded-full" />

      {/* animated progress line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-y-0 left-0 right-0 origin-left bg-gradient-to-r from-accent-violet/70 via-accent-violet/40 to-transparent rounded-full"
      />

      {/* pulsing glow overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.4 }}
        className="absolute inset-y-0 left-0 w-3/4 origin-left"
      >
        <div className="h-full w-full bg-gradient-to-r from-accent-violet/50 to-transparent rounded-full animate-pulse" style={{ animationDuration: "3s" }} />
      </motion.div>
    </div>
  );
}

/* ── section ───────────────────────────────────────── */
export function Pipeline() {
  return (
    <section
      id="pipeline"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* background layers */}
      <div className="absolute inset-0 bg-bg-base pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* ambient glow blobs */}
      <div className="pointer-events-none absolute top-32 -left-40 w-[500px] h-[500px] rounded-full bg-accent-violet/[0.025] blur-[140px]" />
      <div className="pointer-events-none absolute bottom-20 right-0 w-[400px] h-[300px] rounded-full bg-accent-violet/[0.02] blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-left mb-16 sm:mb-20 max-w-2xl"
        >
          <p className="text-accent-violet text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Architecture
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gradient leading-tight">
            Autonomous Research Pipeline
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed max-w-xl">
            A deterministic seven-stage pipeline that executes institutional-grade
            security analysis — from entity resolution to finished report — in
            under two minutes.
          </p>
        </motion.div>

        {/* pipeline visualization */}
        <div className="relative">
          <DesktopConnector />

          <div className="grid grid-cols-1 lg:grid-cols-7 lg:gap-5 relative z-20">
            {steps.map((step, i) => (
              <StepCard key={step.id} step={step} index={i} total={steps.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
