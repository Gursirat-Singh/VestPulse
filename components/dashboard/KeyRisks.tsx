"use client";

import React from "react";

interface KeyRisksProps {
  risks: string[];
}

export function KeyRisks({ risks = [] }: KeyRisksProps) {
  const getSeverity = (riskText: string, index: number) => {
    const text = riskText.toLowerCase();
    if (text.includes("valuation") || text.includes("trade") || text.includes("regulation") || text.includes("competition") || index === 0) {
      return { label: "High", class: "bg-rose-500/10 text-rose-400 border border-rose-500/10", dot: "bg-rose-500" };
    }
    if (text.includes("supply") || text.includes("dependence") || text.includes("macro") || index === 1 || index === 2) {
      return { label: "Medium", class: "bg-amber-500/10 text-amber-400 border border-amber-500/10", dot: "bg-amber-500" };
    }
    return { label: "Low", class: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10", dot: "bg-emerald-500" };
  };

  const displayRisks = risks.slice(0, 5); // show up to 5 risks

  return (
    <div id="risks" className="scroll-mt-24 glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] flex flex-col h-full justify-between">
      <div className="space-y-4">
        <h3 className="text-sm font-bold bg-gradient-to-r from-white/90 to-white/50 bg-clip-text text-transparent uppercase tracking-wider">
          Key Risks
        </h3>
        {displayRisks.length === 0 ? (
          <div className="text-xs text-white/40 italic py-6">No key risk factors identified.</div>
        ) : (
          <div className="space-y-3">
            {displayRisks.map((risk, idx) => {
              const severity = getSeverity(risk, idx);
              return (
                <div
                  key={idx}
                  className="group/item flex justify-between items-center text-xs p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:-translate-y-0.5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
                >
                  <div className="flex items-start space-x-3 pr-4 overflow-hidden">
                    <div className="relative flex-shrink-0 w-2 h-2 mt-1">
                      <div className={`absolute inset-0 rounded-full ${severity.dot} z-10`}></div>
                      <div className={`absolute inset-0 rounded-full ${severity.dot}/50 blur-[3px] animate-pulse`}></div>
                    </div>
                    <span className="text-white/80 font-medium leading-relaxed">{risk}</span>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold flex-shrink-0 ${severity.class}`}>
                    {severity.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
