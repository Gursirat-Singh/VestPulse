"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Newspaper,
  Users,
  ShieldAlert,
  BrainCircuit,
  FileText,
} from "lucide-react";

const cards = [
  {
    icon: LineChart,
    title: "Financial Fundamentals",
    description:
      "Deep quantitative analysis of income statements, balance sheets, and cash flows. Computes key valuation ratios, growth trends, and capital efficiency metrics in real-time.",
    wide: true,
  },
  {
    icon: Newspaper,
    title: "Live News Intelligence",
    description:
      "Scrapes real-time financial news, press releases, and earnings transcripts. Applies heuristic sentiment scoring to map positive catalyst momentum and negative sentiment risks.",
    wide: false,
  },
  {
    icon: Users,
    title: "Competitive Landscape",
    description:
      "Maps and evaluates direct industry competitors. Extracts peer valuation metrics, margins, and market positioning data to determine relative strength and sustainable competitive moats.",
    wide: false,
  },
  {
    icon: ShieldAlert,
    title: "Risk Assessment",
    description:
      "Pinpoints critical operational, geopolitical, financial, and regulatory headwinds. Scans disclosures and sentiment shifts to identify structural vulnerabilities before they materialize.",
    wide: false,
  },
  {
    icon: FileText,
    title: "Professional Reports",
    description:
      "Generates high-fidelity investment memos in structured Markdown format. Integrates data tables, charts, and direct sources, optimized for offline distribution and executive review.",
    wide: false,
  },
  {
    icon: BrainCircuit,
    title: "AI Investment Committee",
    description:
      "A multi-agent debate layer where analytical roles (financial, sentiment, competitive, risk) cross-examine evidence to reach a consensus verdict, avoiding bias.",
    wide: true,
  },
];

function FinancialPreview() {
  const metrics = [
    { label: "Revenue (FY24)", value: "$60,922", color: "text-slate-100" },
    { label: "Gross Margin", value: "72.7%", color: "text-accent-green" },
    { label: "Free Cash Flow", value: "$27,021", color: "text-slate-100" },
    { label: "YoY Growth", value: "+268%", color: "text-accent-green" },
    { label: "Debt / Equity", value: "0.41", color: "text-slate-100" },
    { label: "P/E Ratio", value: "65.3x", color: "text-accent-red" },
  ];

  return (
    <div className="mt-6 rounded-lg overflow-hidden border border-white/[0.04]">
      {/* Header */}
      <div className="bg-[#0A0B0E] px-5 py-3 flex justify-between items-center border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            NVDA Historical Extract
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          Values in USD Millions
        </span>
      </div>
      {/* Metrics Grid */}
      <div className="bg-[#0C0D10] px-5 py-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-5">
          {metrics.map((m, i) => (
            <div key={i} className="space-y-1.5">
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                {m.label}
              </span>
              <span className={`block text-sm font-bold font-mono ${m.color}`}>
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentDebatePreview() {
  return (
    <div className="mt-6 rounded-lg overflow-hidden border border-white/[0.04]">
      {/* Header */}
      <div className="bg-[#0A0B0E] px-5 py-3 flex justify-between items-center border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            Agent Debate Protocol
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-accent-green font-semibold">
          ● Active Consensus
        </span>
      </div>
      {/* Messages */}
      <div className="bg-[#0C0D10] px-5 py-4 space-y-3 font-mono text-xs">
        <div className="flex gap-3 items-start">
          <div className="shrink-0 mt-0.5 w-5 h-5 rounded-md bg-accent-violet/15 flex items-center justify-center">
            <span className="text-accent-violet text-[9px] font-black">F</span>
          </div>
          <div>
            <span className="text-accent-violet font-bold text-[11px]">Agent_Financials</span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">
              Revenue trajectory (+268% YoY) and strong FCF generation support a bullish target price.
            </p>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="shrink-0 mt-0.5 w-5 h-5 rounded-md bg-accent-red/15 flex items-center justify-center">
            <span className="text-accent-red text-[9px] font-black">R</span>
          </div>
          <div>
            <span className="text-accent-red font-bold text-[11px]">Agent_Risks</span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">
              Counterpoint: Supply chain concentration at TSMC poses material tail-end operational risks.
            </p>
          </div>
        </div>
        {/* Consensus */}
        <div className="pt-3 mt-1 border-t border-white/[0.04] flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
            Consensus Output
          </span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
            <span className="text-accent-green font-bold text-xs tracking-wide">
              INVEST — 92% Confidence
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResearchCapabilities() {
  return (
    <section id="features" className="py-28 bg-bg-base border-t border-white/[0.04] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-accent-violet/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-left mb-20 max-w-2xl"
        >
          {/* Decorative violet line */}
          <div className="w-10 h-[3px] rounded-full bg-gradient-to-r from-accent-violet to-accent-violet/40 mb-5" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Research Capabilities
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
            Everything required to evaluate a company, fully automated and structured by specialized agent networks.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {cards.map((card, index) => {
            const Icon = card.icon;
            const isOdd = index % 2 !== 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isOdd ? 30 : -30, y: 10 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`
                  ${card.wide ? "lg:col-span-2" : ""}
                  group relative rounded-xl overflow-hidden
                  bg-bg-card border border-white/[0.06]
                  transition-all duration-300 ease-out
                  hover:-translate-y-[2px]
                  hover:border-accent-violet/30
                  hover:shadow-[0_0_30px_-5px_rgba(124,124,255,0.12)]
                `}
              >
                {/* Gradient top edge */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-violet/60 to-transparent" />

                {/* Inner light effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-b from-accent-violet/[0.04] via-transparent to-transparent" />

                <div className="relative p-8">
                  <div className="space-y-4">
                    {/* Icon + Title */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {/* Icon glow */}
                        <div className="absolute inset-0 rounded-xl bg-accent-violet/20 blur-md scale-150 opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
                        <div className="relative w-10 h-10 rounded-xl bg-accent-violet/[0.1] border border-accent-violet/20 flex items-center justify-center">
                          <Icon className="w-[18px] h-[18px] text-accent-violet" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-3xl pl-14">
                      {card.description}
                    </p>
                  </div>

                  {/* Embedded previews for wide cards */}
                  {card.title === "Financial Fundamentals" && <FinancialPreview />}
                  {card.title === "AI Investment Committee" && <AgentDebatePreview />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
