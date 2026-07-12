"use client";

import React, { useState } from "react";
import { HistoricalFinancial, ValuationRatios } from "../../types";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface FinancialOverviewTableProps {
  historical?: HistoricalFinancial[];
  ratios?: ValuationRatios;
  isPublic: boolean;
  completeness?: number;
  providersUsed?: string[];
  missingFields?: string[];
}

const ALL_19_FIELDS = [
  "Company Name", "Ticker", "Market Cap", "Current Price", "Sector", "Industry", 
  "Description", "Employee Count", "52 Week Low", "52 Week High", "PE Ratio", 
  "ROE", "Cash", "Debt", "Revenue", "Net Income", "Operating Income", "EPS", "Profit Margin"
];

export function FinancialOverviewTable({ 
  historical = [], 
  ratios, 
  isPublic,
  completeness = 0,
  providersUsed = [],
  missingFields = []
}: FinancialOverviewTableProps) {
  const [showAudit, setShowAudit] = useState(false);

  if (!isPublic) {
    return (
      <div className="glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] h-full flex flex-col justify-center items-center text-center text-slate-400">
        <p className="text-sm">Financial overview statistics are unavailable for private or unlisted companies.</p>
      </div>
    );
  }

  // If there is zero data across FMP/Yahoo/Finnhub (total failure)
  if (historical.length === 0 && completeness === 0) {
    return (
      <div className="glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] h-full flex flex-col justify-center items-center text-center text-slate-400">
        <p className="text-sm">Financial data was unavailable from all public data providers.</p>
      </div>
    );
  }

  // Get TTM/Latest values
  const latest = historical[historical.length - 1] || {};
  const prev = historical[historical.length - 2] || {};

  const calcYoY = (curr: number, prior: number) => {
    if (!prior) return null;
    const change = ((curr - prior) / prior) * 100;
    return change;
  };

  const formatCurrency = (val: number) => {
    if (val === undefined || val === null || val === 0) return "N/A";
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  const rows = [
    {
      metric: "Revenue",
      value: formatCurrency(latest.revenue),
      yoy: calcYoY(latest.revenue, prev.revenue),
      sparkData: historical.length > 0 ? historical.map(h => ({ val: h.revenue })) : null,
    },
    {
      metric: "Gross Profit",
      value: formatCurrency(latest.grossProfit),
      yoy: calcYoY(latest.grossProfit, prev.grossProfit),
      sparkData: historical.length > 0 && historical.some(h => h.grossProfit > 0) ? historical.map(h => ({ val: h.grossProfit })) : null,
    },
    {
      metric: "Operating Income",
      value: formatCurrency(latest.operatingIncome),
      yoy: calcYoY(latest.operatingIncome, prev.operatingIncome),
      sparkData: historical.length > 0 ? historical.map(h => ({ val: h.operatingIncome })) : null,
    },
    {
      metric: "Net Income",
      value: formatCurrency(latest.netIncome),
      yoy: calcYoY(latest.netIncome, prev.netIncome),
      sparkData: historical.length > 0 ? historical.map(h => ({ val: h.netIncome })) : null,
    },
    {
      metric: "EPS",
      value: latest.eps ? `$${latest.eps.toFixed(2)}` : "N/A",
      yoy: calcYoY(latest.eps, prev.eps),
      sparkData: historical.length > 0 ? historical.map(h => ({ val: h.eps })) : null,
    },
    {
      metric: "Free Cash Flow",
      value: formatCurrency(latest.freeCashFlow),
      yoy: calcYoY(latest.freeCashFlow, prev.freeCashFlow),
      sparkData: historical.length > 0 ? historical.map(h => ({ val: h.freeCashFlow })) : null,
    },
    {
      metric: "ROE",
      value: ratios?.roe ? `${(ratios.roe * 100).toFixed(1)}%` : "N/A",
      yoy: null,
      sparkData: null,
    },
    {
      metric: "Gross Margin",
      value: ratios?.grossMargin ? `${(ratios.grossMargin * 100).toFixed(1)}%` : "N/A",
      yoy: null,
      sparkData: null,
    },
  ];

  return (
    <div className="glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] flex flex-col h-full">
      
      {/* Dynamic Coverage Summary Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 mb-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 uppercase tracking-wider">
            Financial Overview (TTM)
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Sources:</span>
            {providersUsed.map((p, idx) => (
              <span key={idx} className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-slate-300 font-mono">
                <div className="relative flex items-center justify-center w-2 h-2 mr-1.5">
                  <span className="absolute w-2 h-2 rounded-full bg-emerald-500/40 blur-[3px] animate-pulse" />
                  <span className="relative w-1 h-1 rounded-full bg-emerald-400" />
                </div>
                {p}
              </span>
            ))}
            {providersUsed.length === 0 && (
              <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-white/[0.02] border border-white/[0.04] text-slate-500 font-mono">
                No providers
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3 bg-white/[0.02] border border-white/[0.04] px-3.5 py-1.5 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium font-mono uppercase tracking-wider text-[10px]">Data Coverage:</span>
          <div className="flex items-center space-x-1.5">
            <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  completeness >= 80 ? "bg-indigo-500" : completeness >= 50 ? "bg-blue-500" : "bg-rose-500"
                }`} 
                style={{ width: `${completeness}%` }}
              />
            </div>
            <span className={`text-xs font-bold font-mono ${
              completeness >= 80 ? "text-indigo-400" : completeness >= 50 ? "text-blue-400" : "text-rose-400"
            }`}>
              {completeness}%
            </span>
          </div>
        </div>
      </div>

      {/* Financial Metrics Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="border-b border-white/[0.06] text-slate-300 font-bold uppercase tracking-wider pb-2">
              <th className="py-2.5">Metric</th>
              <th className="py-2.5 text-right">Value</th>
              <th className="py-2.5 text-right">YoY Change</th>
              <th className="py-2.5 text-right pl-6">5Y Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map((row, idx) => {
              const isPositive = row.yoy !== null && row.yoy >= 0;
              return (
                <tr key={idx} className="hover:bg-white/[0.03] even:bg-white/[0.01] transition-colors">
                  <td className="py-3 font-semibold text-slate-200 group-hover:text-white transition-colors">{row.metric}</td>
                  <td className="py-3 text-right font-mono font-semibold text-slate-300">
                    {row.value}
                  </td>
                  <td className={`py-3 text-right font-mono font-bold ${
                    row.yoy === null
                      ? "text-slate-500"
                      : isPositive
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}>
                    {row.yoy === null
                      ? "--"
                      : `${isPositive ? "+" : ""}${row.yoy.toFixed(1)}%`}
                  </td>
                  <td className="py-3 text-right">
                    <div className="w-16 h-6 ml-auto flex justify-end items-center">
                      {row.sparkData ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={row.sparkData}>
                            <Line
                              type="monotone"
                              dataKey="val"
                              stroke={isPositive ? "#10b981" : "#f43f5e"}
                              strokeWidth={1.5}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-mono italic">
                          No trend
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dynamic retrieved / missing fields audit report */}
      <div className="mt-4 pt-4 border-t border-white/[0.06]">
        <button 
          onClick={() => setShowAudit(!showAudit)} 
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1.5 focus:outline-none"
        >
          <span>{showAudit ? "▼" : "▶"}</span>
          <span>Data Quality Audit Report ({ALL_19_FIELDS.length - missingFields.length} / {ALL_19_FIELDS.length} fields)</span>
        </button>
        
        {showAudit && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl animate-fade-in">
            <div>
              <span className="text-slate-400 font-bold block mb-2 font-mono uppercase tracking-wider text-[9px]">Retrieved Metrics ({ALL_19_FIELDS.length - missingFields.length})</span>
              <div className="flex flex-wrap gap-1.5">
                {ALL_19_FIELDS.filter(f => !missingFields.includes(f)).map((f, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 font-mono text-[9px]">
                    <div className="relative flex items-center justify-center w-1.5 h-1.5">
                      <span className="absolute w-2 h-2 rounded-full bg-emerald-500/40 blur-[3px] animate-pulse" />
                      <span className="relative w-1 h-1 rounded-full bg-emerald-400" />
                    </div>
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <span className="text-slate-400 font-bold block mb-2 font-mono uppercase tracking-wider text-[9px]">Missing Metrics ({missingFields.length})</span>
              <div className="flex flex-wrap gap-1.5">
                {missingFields.map((f, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/5 text-rose-400 border border-rose-500/10 font-mono text-[9px]">
                    <div className="relative flex items-center justify-center w-1.5 h-1.5">
                      <span className="absolute w-2 h-2 rounded-full bg-rose-500/40 blur-[3px] animate-pulse" />
                      <span className="relative w-1 h-1 rounded-full bg-rose-400" />
                    </div>
                    ✗ {f}
                  </span>
                ))}
                {missingFields.length === 0 && (
                  <span className="text-slate-500 italic text-[11px]">All metrics resolved successfully.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
