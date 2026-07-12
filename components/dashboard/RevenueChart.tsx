"use client";

import React from "react";
import { HistoricalFinancial } from "../../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  historical?: HistoricalFinancial[];
  isPublic: boolean;
}

export function RevenueChart({ historical = [], isPublic }: RevenueChartProps) {
  if (!isPublic || historical.length === 0) {
    return (
      <div className="glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] h-full flex flex-col justify-center items-center text-center text-slate-400">
        <p className="text-sm">Revenue trends are unavailable for private or unlisted companies.</p>
      </div>
    );
  }

  // Map data to Billions for easier reading on the Y-Axis
  const data = historical.map((h) => ({
    name: h.year || "N/A",
    Revenue: parseFloat((h.revenue / 1_000_000_000).toFixed(2)),
    NetIncome: parseFloat((h.netIncome / 1_000_000_000).toFixed(2)),
  }));

  // Custom tooltips to match dark theme aesthetics
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel border border-white/[0.06] bg-[#0D0E12]/90 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl shadow-black/50 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <div className="space-y-0.5">
            {payload.map((p: any, idx: number) => (
              <p key={idx} className="text-xs font-semibold text-white/90">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                  style={{ backgroundColor: p.color }}
                />
                {p.name}: {p.value}B
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] flex flex-col h-[320px] md:h-full hover:border-white/[0.08] transition-all duration-300">
      <h3 className="text-sm font-bold text-white/80 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 uppercase tracking-wider mb-4">
        Revenue & Net Income Trend
      </h3>
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorNetIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(tick) => `${tick}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
            <Legend
              verticalAlign="top"
              align="left"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1.5 pr-4">
                  {value === "Revenue" ? "Revenue (B USD)" : "Net Income (B USD)"}
                </span>
              )}
            />
            <Bar dataKey="Revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Bar dataKey="NetIncome" fill="url(#colorNetIncome)" radius={[4, 4, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
