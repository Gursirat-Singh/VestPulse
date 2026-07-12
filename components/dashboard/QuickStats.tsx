"use client";

import React from "react";
import { FinancialProfile, ValuationRatios } from "../../types";

interface QuickStatsProps {
  profile?: FinancialProfile;
  ratios?: ValuationRatios;
}

export function QuickStats({ profile, ratios }: QuickStatsProps) {
  if (!profile) return null;

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000_000) return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const stats = [
    { label: "Market Cap", value: formatNumber(profile.marketCap) },
    { label: "Current Price", value: `$${profile.price.toFixed(2)}` },
    { label: "52W High / Low", value: profile.range || "N/A" },
    { label: "P/E Ratio (TTM)", value: ratios?.peRatio ? ratios.peRatio.toFixed(2) : "N/A" },
    { label: "P/S Ratio (TTM)", value: ratios?.psRatio ? ratios.psRatio.toFixed(2) : "N/A" },
    { label: "Dividend Yield", value: profile.dividendYield ? `${(profile.dividendYield * 100).toFixed(2)}%` : "0.00%" },
    { label: "Beta", value: profile.beta ? profile.beta.toFixed(2) : "N/A" },
  ];

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block drop-shadow-sm">
        Quick Stats
      </span>
      <div className="glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] space-y-3.5 hover:border-white/[0.08] transition-colors">
        {stats.map((s, idx) => (
          <div key={idx} className="flex justify-between items-center text-xs group/item rounded-lg px-2 py-1.5 -mx-2 hover:bg-white/[0.02] transition-colors">
            <span className="text-slate-400 font-medium">{s.label}</span>
            <span className="text-slate-200 font-mono font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover/item:text-white transition-colors">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
