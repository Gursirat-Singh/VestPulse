"use client";

import React from "react";
import { ValuationRatios } from "../../types";

interface ValuationRatiosTableProps {
  ratios?: ValuationRatios;
  isPublic: boolean;
}

export function ValuationRatiosTable({ ratios, isPublic }: ValuationRatiosTableProps) {
  if (!isPublic || !ratios) {
    return (
      <div className="glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] h-full flex flex-col justify-center items-center text-center text-slate-400">
        <p className="text-sm">Valuation ratios are unavailable for private or unlisted companies.</p>
      </div>
    );
  }

  const rows = [
    {
      ratio: "P/E (TTM)",
      value: ratios.peRatio ? ratios.peRatio.toFixed(2) : "N/A",
      compare: ratios.peRatio > 25 ? "Higher" : "Lower",
      isHigherBad: true,
    },
    {
      ratio: "P/S (TTM)",
      value: ratios.psRatio ? ratios.psRatio.toFixed(2) : "N/A",
      compare: ratios.psRatio > 5 ? "Higher" : "Lower",
      isHigherBad: true,
    },
    {
      ratio: "P/B (MRQ)",
      value: ratios.pbRatio ? ratios.pbRatio.toFixed(2) : "N/A",
      compare: ratios.pbRatio > 3 ? "Higher" : "Lower",
      isHigherBad: true,
    },
    {
      ratio: "PEG (TTM)",
      value: ratios.pegRatio ? ratios.pegRatio.toFixed(2) : "N/A",
      compare: ratios.pegRatio > 1 ? "Higher" : "Lower",
      isHigherBad: true,
    },
    {
      ratio: "EV/EBITDA (TTM)",
      value: ratios.evToEbitda ? ratios.evToEbitda.toFixed(2) : "N/A",
      compare: ratios.evToEbitda > 15 ? "Higher" : "Lower",
      isHigherBad: true,
    },
  ];

  return (
    <div id="valuation" className="scroll-mt-24 glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] flex flex-col h-full">
      <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 uppercase tracking-wider mb-4">
        Valuation Ratios
      </h3>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="border-b border-white/[0.06] text-slate-300 font-bold uppercase tracking-wider pb-2">
              <th className="py-2.5">Ratio</th>
              <th className="py-2.5 text-right">Value</th>
              <th className="py-2.5 text-right">vs Industry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map((row, idx) => {
              const isLower = row.compare === "Lower";
              return (
                <tr key={idx} className="hover:bg-white/[0.03] even:bg-white/[0.01] transition-colors">
                  <td className="py-3 font-semibold text-slate-200 group-hover:text-white transition-colors">{row.ratio}</td>
                  <td className="py-3 text-right font-mono font-semibold text-slate-300">
                    {row.value}
                  </td>
                  <td className="py-3 text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isLower
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                    }`}>
                      {row.compare}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
