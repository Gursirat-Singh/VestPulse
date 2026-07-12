"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface InvestmentThesisProps {
  positives: string[];
}

export function InvestmentThesis({ positives = [] }: InvestmentThesisProps) {
  return (
    <div id="thesis" className="scroll-mt-24 glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] flex flex-col h-full justify-between">
      <div className="space-y-4">
        <h3 className="text-sm font-bold bg-gradient-to-r from-white/90 to-white/50 bg-clip-text text-transparent uppercase tracking-wider">
          Investment Thesis
        </h3>
        
        {positives.length === 0 ? (
          <div className="text-xs text-white/40 italic py-6">No positives compiled.</div>
        ) : (
          <div className="space-y-3">
            {positives.map((pos, idx) => (
              <div
                key={idx}
                className="group/item flex items-start space-x-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:-translate-y-0.5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
              >
                <div className="relative flex-shrink-0 w-2 h-2 mt-1 ml-1">
                  <div className="absolute inset-0 rounded-full bg-emerald-400 z-10"></div>
                  <div className="absolute inset-0 rounded-full bg-emerald-400/50 blur-[3px] animate-pulse"></div>
                </div>
                <span className="text-xs text-white/80 font-medium leading-relaxed">
                  {pos}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
