"use client";

import React from "react";
import { ValuationRatios, HistoricalFinancial } from "../../types";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface FinancialHealthRadarProps {
  ratios?: ValuationRatios;
  historical?: HistoricalFinancial[];
  isPublic: boolean;
}

export function FinancialHealthRadar({ ratios, historical = [], isPublic }: FinancialHealthRadarProps) {
  if (!isPublic || !ratios || historical.length === 0) {
    return (
      <div className="glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] h-full flex flex-col justify-center items-center text-center text-slate-400">
        <p className="text-sm">Financial health index is unavailable for private or unlisted companies.</p>
      </div>
    );
  }

  // Calculate scores between 10-100 based on standard ratios TTM
  // Profitability (Gross Margin & ROE)
  const roeScore = Math.min(Math.max((ratios.roe || 0) * 100, 10), 95);
  const profitScore = Math.min(Math.max((ratios.grossMargin || 0) * 100, 10), 95);
  const profitability = (roeScore + profitScore) / 2;

  // Growth (YoY revenue growth)
  const latest = historical[historical.length - 1] || {};
  const prev = historical[historical.length - 2] || {};
  const revGrowth = prev.revenue ? ((latest.revenue - prev.revenue) / prev.revenue) * 100 : 0;
  const growth = Math.min(Math.max(revGrowth, 10), 95);

  // Solvency (Debt to Equity)
  const deRatio = ratios.debtToEquity || 0;
  const solvency = Math.max(10, Math.min(95, 100 - deRatio * 30)); // lower debt means better solvency score

  // Efficiency (Current Ratio)
  const currRatio = ratios.currentRatio || 1;
  const efficiency = Math.min(Math.max(currRatio * 35, 10), 95);

  // Cash Flow (Free Cash Flow to Net Income)
  const fcfToNi = latest.netIncome ? (latest.freeCashFlow / latest.netIncome) : 1;
  const cashFlow = Math.min(Math.max(fcfToNi * 75, 10), 95);

  const data = [
    { subject: "Profitability", A: profitability, fullMark: 100 },
    { subject: "Growth", A: growth, fullMark: 100 },
    { subject: "Solvency", A: solvency, fullMark: 100 },
    { subject: "Efficiency", A: efficiency, fullMark: 100 },
    { subject: "Cash Flow", A: cashFlow, fullMark: 100 },
  ];

  return (
    <div className="glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] flex flex-col h-[320px] md:h-full justify-between hover:border-white/[0.08] transition-all duration-300">
      <h3 className="text-sm font-bold text-white/80 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 uppercase tracking-wider mb-2">
        Financial Health
      </h3>
      <div className="flex-1 w-full min-h-[220px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="90%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.03)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#cbd5e1", fontSize: 10, fontWeight: "bold" }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Metrics"
              dataKey="A"
              stroke="#818cf8"
              strokeWidth={2}
              style={{ filter: "drop-shadow(0 0 10px rgba(99,102,241,0.5))" }}
              fill="#6366f1"
              fillOpacity={0.15}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
