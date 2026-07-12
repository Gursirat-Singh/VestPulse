"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, BarChart3, AlertTriangle, ListFilter } from "lucide-react";

const sidebarItems = [
  { label: "Executive Summary", active: true },
  { label: "Financial Standing", active: false },
  { label: "Competitor Intelligence", active: false },
  { label: "Risk Matrix", active: false },
  { label: "Investment Thesis", active: false },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function ReportPreview() {
  return (
    <section id="example-report" className="py-28 bg-bg-base border-t border-white/[0.04] relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-accent-violet/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-left mb-16 max-w-2xl"
        >
          {/* Decorative violet accent line */}
          <div className="flex items-center space-x-3 mb-5">
            <div className="h-[2px] w-8 bg-gradient-to-r from-accent-violet to-accent-violet/0 rounded-full" />
            <span className="text-[11px] font-mono text-accent-violet uppercase tracking-widest font-semibold">Sample Output</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            High-Fidelity Sample Report
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
            The final artifact is an interactive, fully resolved intelligence report compiled by the multi-agent consensus network.
          </p>
        </motion.div>

        {/* Floating animation wrapper */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Outer violet gradient border wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="rounded-xl p-[1px] bg-gradient-to-br from-accent-violet/30 via-white/[0.06] to-accent-violet/10 shadow-[0_0_80px_-20px_rgba(124,124,255,0.15)]"
          >
            {/* Inner glass container */}
            <div className="rounded-[11px] overflow-hidden bg-bg-card/90 backdrop-blur-xl border border-white/[0.04]">

              {/* macOS Window Bar */}
              <div className="bg-[#0C0D11] border-b border-white/[0.06] px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Traffic light dots */}
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-[0_0_4px_rgba(255,95,87,0.4)]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-[0_0_4px_rgba(255,189,46,0.4)]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-[0_0_4px_rgba(40,200,64,0.4)]" />
                  </div>
                  <div className="h-4 w-[1px] bg-white/[0.06]" />
                  <span className="text-[11px] font-mono text-slate-500 tracking-wide">nvda_consensus_v1.0.md</span>
                </div>
                <div className="bg-accent-green/[0.08] border border-accent-green/20 px-3 py-1 rounded-full text-[10px] font-mono text-accent-green font-medium tracking-wider uppercase">
                  Stable Verdict
                </div>
              </div>

              {/* Inner Layout: Dashboard UI Mock */}
              <div className="flex flex-col min-h-[520px] bg-[#0A0B0D]">
                
                {/* Mock Company Header */}
                <div className="border-b border-white/[0.04] px-6 py-4 flex justify-between items-center bg-[#0C0D11]/80 backdrop-blur-md">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-violet/20 to-accent-violet/5 border border-white/[0.08] flex items-center justify-center font-bold text-lg text-slate-200">
                      NVDA
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100 tracking-tight">NVIDIA Corporation</h3>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                        <span className="font-mono bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.08]">NASDAQ</span>
                        <span>Technology</span>
                        <span>&middot;</span>
                        <span className="text-slate-400">Semiconductors</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">AI Verdict</span>
                      <div className="bg-accent-green/[0.08] border border-accent-green/20 px-3 py-1 rounded-[6px] text-xs font-mono text-accent-green font-bold tracking-wide">
                        STRONG BUY
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 overflow-hidden relative">
                  {/* Mock Left Sidebar */}
                  <div className="w-64 border-r border-white/[0.04] p-5 space-y-8 hidden md:flex flex-col bg-[#0A0B0D]/50 z-10">
                    {/* Nav */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-semibold px-2">Analysis Sections</span>
                      <div className="space-y-1 text-xs">
                        <div className="px-3 py-2 bg-white/[0.04] text-accent-violet font-medium rounded-[6px] border border-white/[0.04] shadow-sm">Executive Summary</div>
                        <div className="px-3 py-2 text-slate-400 hover:text-slate-200 transition-colors">Financial Fundamentals</div>
                        <div className="px-3 py-2 text-slate-400 hover:text-slate-200 transition-colors">Competitor Intelligence</div>
                        <div className="px-3 py-2 text-slate-400 hover:text-slate-200 transition-colors">Risk Assessment</div>
                      </div>
                    </div>
                    {/* Quick Stats */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-semibold px-2">Quick Metrics</span>
                      <div className="bg-[#0C0D11] border border-white/[0.04] rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Market Cap</span>
                          <span className="font-mono text-slate-300">$2.34T</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">P/E Ratio</span>
                          <span className="font-mono text-slate-300">72.4</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Beta</span>
                          <span className="font-mono text-slate-300">1.69</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mock Main Dashboard Area */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex-1 p-6 space-y-6 overflow-hidden z-10 relative"
                  >
                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Exec Summary Card (Span 2) */}
                      <motion.div variants={childVariants} className="lg:col-span-2 glass-panel border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h4 className="text-[11px] uppercase font-mono tracking-widest text-accent-violet font-bold mb-3">Executive Summary</h4>
                        <h2 className="text-lg font-bold text-slate-100 mb-2">Dominant AI Accelerator Market Share</h2>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          NVIDIA maintains an undisputed leadership position in the AI hardware market. Unprecedented demand for Hopper architecture and strong cash flow generation justify a high-conviction ratings profile.
                        </p>
                      </motion.div>
                      
                      {/* Price Target Card */}
                      <motion.div variants={childVariants} className="glass-panel border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-accent-green/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Consensus Target</span>
                        <span className="text-4xl font-bold text-slate-100 font-mono tracking-tight">$1,200</span>
                        <div className="mt-3 bg-accent-green/[0.08] px-2.5 py-1 rounded-full flex items-center space-x-1.5">
                          <TrendingUp className="w-3 h-3 text-accent-green" />
                          <span className="text-[10px] text-accent-green font-mono font-bold">+27.2% Upside</span>
                        </div>
                      </motion.div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Revenue Chart mock */}
                      <motion.div variants={childVariants} className="glass-panel border border-white/[0.06] rounded-2xl p-6 relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-[11px] uppercase font-mono tracking-widest text-slate-400 font-bold">Revenue Trend</h4>
                          <span className="text-[10px] font-mono text-slate-500">Billions USD</span>
                        </div>
                        {/* Chart SVG */}
                        <svg className="w-full h-24" viewBox="0 0 100 40" fill="none" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradient2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#7C7CFF" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#7C7CFF" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="lineGradient2" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#7C7CFF" stopOpacity="0.5" />
                              <stop offset="100%" stopColor="#7C7CFF" stopOpacity="1" />
                            </linearGradient>
                          </defs>
                          <path d="M5 32 L45 28 L85 8 L85 40 L5 40 Z" fill="url(#chartGradient2)" />
                          <path d="M5 32 L45 28 L85 8" stroke="url(#lineGradient2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M5 32 L45 28 L85 8" stroke="#7C7CFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
                          <circle cx="5" cy="32" r="3" fill="#141519" stroke="#7C7CFF" strokeWidth="1.5" />
                          <circle cx="45" cy="28" r="3" fill="#141519" stroke="#7C7CFF" strokeWidth="1.5" />
                          <circle cx="85" cy="8" r="3" fill="#7C7CFF" />
                          <path d="M5 32 L5 40 M45 28 L45 40 M85 8 L85 40" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.1" />
                        </svg>
                        <div className="flex justify-between text-[9px] font-mono text-slate-500 px-1 mt-2">
                          <span>FY22</span>
                          <span>FY23</span>
                          <span>FY24</span>
                        </div>
                      </motion.div>
                      
                      {/* Key Risks mock */}
                      <motion.div variants={childVariants} className="glass-panel border border-white/[0.06] rounded-2xl p-6 relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-red/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h4 className="text-[11px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-5 flex items-center space-x-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                          <span>Key Risks</span>
                        </h4>
                        <div className="space-y-4 text-xs">
                          <div className="flex items-start space-x-3 text-slate-300 group/risk bg-white/[0.02] p-3 rounded-xl border border-white/[0.02]">
                            <span className="relative flex-shrink-0 mt-0.5">
                              <span className="absolute inset-0 w-2 h-2 rounded-full bg-accent-red/40 blur-[3px] animate-pulse" />
                              <span className="relative w-2 h-2 rounded-full bg-accent-red block" />
                            </span>
                            <span className="group-hover/risk:text-slate-200 transition-colors leading-relaxed">Supply chain concentration at TSMC creates extreme bottleneck risk.</span>
                          </div>
                          <div className="flex items-start space-x-3 text-slate-300 group/risk bg-white/[0.02] p-3 rounded-xl border border-white/[0.02]">
                            <span className="relative flex-shrink-0 mt-0.5">
                              <span className="absolute inset-0 w-2 h-2 rounded-full bg-accent-red/40 blur-[3px] animate-pulse" />
                              <span className="relative w-2 h-2 rounded-full bg-accent-red block" />
                            </span>
                            <span className="group-hover/risk:text-slate-200 transition-colors leading-relaxed">Geopolitical export restrictions to China impacting ~20% of data center TAM.</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
