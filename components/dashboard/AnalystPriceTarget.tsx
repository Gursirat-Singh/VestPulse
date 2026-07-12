"use client";

import React from "react";
import { AnalystEstimate } from "../../types";

interface AnalystPriceTargetProps {
  estimates?: AnalystEstimate;
  currentPrice?: number;
  isPublic: boolean;
}

export function AnalystPriceTarget({ estimates, currentPrice = 0, isPublic }: AnalystPriceTargetProps) {
  if (!isPublic || !estimates || !currentPrice) {
    return (
      <div className="glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] h-full flex flex-col justify-center items-center text-center text-slate-400">
        <p className="text-sm">Price target metrics are unavailable for private or unlisted companies.</p>
      </div>
    );
  }

  const { targetLow = currentPrice * 0.8, targetAvg = currentPrice * 1.15, targetHigh = currentPrice * 1.5 } = estimates;

  const upsidePercentage = ((targetAvg - currentPrice) / currentPrice) * 100;
  const isPositiveUpside = upsidePercentage >= 0;

  // Calculate percentage positions for current and target points along the low-high range
  const totalRange = targetHigh - targetLow;
  const currentPos = totalRange > 0 ? ((currentPrice - targetLow) / totalRange) * 100 : 50;
  const targetPos = totalRange > 0 ? ((targetAvg - targetLow) / totalRange) * 100 : 75;

  return (
    <div className="glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] flex flex-col h-full justify-between hover:border-white/[0.08] transition-all duration-300">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white/80 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 uppercase tracking-wider">
          Analyst Price Target
        </h3>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white font-mono">
            ${targetAvg.toFixed(2)}
          </span>
          <span className={`text-xs font-bold ${isPositiveUpside ? "text-emerald-400" : "text-rose-400"}`}>
            ({isPositiveUpside ? "+" : ""}{upsidePercentage.toFixed(1)}% Upside)
          </span>
        </div>
      </div>

      {/* Horizontal Bar Chart / Slider Gauge */}
      <div className="space-y-6 py-4">
        <div className="relative h-1.5 w-full bg-slate-800 rounded-full">
          {/* Current price marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-300 border border-[#0D0E12] shadow-md z-10 transition-transform duration-300 hover:scale-125"
            style={{ left: `${Math.min(Math.max(currentPos, 0), 100)}%` }}
            title={`Current: $${currentPrice.toFixed(2)}`}
          />
          {/* Target price marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-indigo-500 border border-white/20 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-20 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.8)] hover:scale-110"
            style={{ left: `${Math.min(Math.max(targetPos, 0), 100)}%` }}
            title={`Avg Target: $${targetAvg.toFixed(2)}`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between items-start text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          <div className="space-y-0.5">
            <span>Low</span>
            <span className="block text-slate-300 font-mono">${targetLow.toFixed(2)}</span>
          </div>
          <div className="space-y-0.5 text-center">
            <span>Current</span>
            <span className="block text-slate-300 font-mono">${currentPrice.toFixed(2)}</span>
          </div>
          <div className="space-y-0.5 text-right">
            <span>High</span>
            <span className="block text-slate-300 font-mono">${targetHigh.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
