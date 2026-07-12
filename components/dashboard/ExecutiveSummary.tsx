"use client";

import React from "react";
import { TrendingUp, Crown, Zap, ShieldCheck } from "lucide-react";

interface ExecutiveSummaryProps {
  keyPositives: string[];
  keyRisks: string[];
}

export function ExecutiveSummary({ keyPositives, keyRisks }: ExecutiveSummaryProps) {
  // Use fallbacks if LLM output is too short
  const item1 = keyPositives[0] || "Strong growth catalysts driving positive outlook.";
  const item2 = keyPositives[1] || "Solid market share and competitive advantage.";
  const item3 = keyPositives[2] || "Sustained customer demand across target sectors.";
  const item4 = keyRisks[0] || "Valuation premiums and macroeconomic headwinds present risk.";

  const cards = [
    {
      title: "Strong Growth",
      description: item1,
      icon: TrendingUp,
      colorClass: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Market Leader",
      description: item2,
      icon: Crown,
      colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "High Demand",
      description: item3,
      icon: Zap,
      colorClass: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
      title: "Manageable Risks",
      description: item4,
      icon: ShieldCheck,
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div id="summary" className="scroll-mt-24 space-y-4">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider drop-shadow-sm">
        Executive Summary
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className="glass-panel border border-white/[0.04] p-6 rounded-3xl flex items-start space-x-4 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] hover:-translate-y-1 hover:border-white/[0.08] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className={`p-3 rounded-2xl border ${c.colorClass} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 drop-shadow-[0_0_8px_currentColor]" />
              </div>
              <div className="space-y-1 relative z-10">
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{c.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium group-hover:text-slate-300 transition-colors">
                  {c.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
