"use client";

import React from "react";
import { Award, ShieldAlert } from "lucide-react";
import { FinancialProfile } from "../../types";

interface CompanyHeaderProps {
  profile?: FinancialProfile;
  decision: "INVEST" | "PASS" | null;
  confidence: number | null;
  timestamp: string;
  duration?: string;
  sourcesCount?: number;
}

export function CompanyHeader({
  profile,
  decision,
  confidence = 0,
  timestamp,
  duration = "12.4s",
  sourcesCount = 24
}: CompanyHeaderProps) {
  const isInvest = decision === "INVEST";
  
  // Calculate SVG stroke-dashoffset for semi-circle
  // Circle radius is 50. Circumference is 2 * PI * r = 314.15
  // For a semi-circle we only use half (157).
  const confValue = confidence || 0;
  const radius = 40;
  const circumference = Math.PI * radius; // 125.66
  const strokeDashoffset = circumference - (confValue / 100) * circumference;

  return (
    <div className="flex flex-col lg:flex-row gap-6 justify-between items-start w-full">
      {/* Left side info */}
      <div className="space-y-4 flex-1">
        <div className="flex items-center space-x-4">
          {profile?.image ? (
            <img
              src={profile.image}
              alt={profile.companyName}
              onError={(e) => {
                // If logo fails, fallback to custom element
                (e.target as HTMLElement).style.display = "none";
              }}
              className="w-16 h-16 rounded-2xl border border-white/[0.04] bg-slate-900/60 p-2 object-contain shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] transition-all duration-300 hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)]"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-white/[0.04] flex items-center justify-center font-bold text-xl text-indigo-400 shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] transition-all duration-300 hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)]">
              {profile?.ticker?.slice(0, 2) || "AI"}
            </div>
          )}
          
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                {profile?.companyName || "Company Name"}
              </h1>
              {profile?.ticker && (
                <span className="text-xs font-mono font-bold bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded text-slate-300">
                  {profile.ticker}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-400">
              {profile?.sector && (
                <span className="bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-lg">
                  {profile.sector}
                </span>
              )}
              {profile?.industry && (
                <span className="bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-lg">
                  {profile.industry}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center flex-wrap gap-2">
          <div className="relative flex items-center justify-center w-2 h-2 mr-1">
            <div className="absolute w-2 h-2 rounded-full bg-accent-emerald blur-[3px] animate-pulse"></div>
            <div className="absolute w-2 h-2 rounded-full bg-accent-emerald"></div>
          </div>
          <span>Last Updated: {timestamp}</span>
          <span>&bull;</span>
          <span>Analysis Time: {duration}</span>
          <span>&bull;</span>
          <span>Sources Analyzed: {sourcesCount}</span>
        </div>
      </div>

      {/* Right side verdict & gauge */}
      {decision && (
        <div className="glass-panel backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 flex flex-col justify-center w-full lg:w-80 relative overflow-hidden bg-gradient-to-br from-[#13141a]/90 to-[#0D0E12]/90 shadow-[0_0_30px_-5px_rgba(255,255,255,0.05)] group hover:border-white/[0.15] transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Action Required
            </span>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              isInvest ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}>
              {confidence}% Confidence
            </div>
          </div>

          <div className="relative z-10">
            <span className={`text-4xl font-black tracking-widest block drop-shadow-[0_0_15px_currentColor] ${
              isInvest ? "text-emerald-400" : "text-rose-400"
            }`}>
              {isInvest ? "INVEST" : "SKIP"}
            </span>
          </div>

          <div className="w-full mt-5 relative z-10">
            <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${isInvest ? "bg-emerald-500" : "bg-rose-500"}`} 
                style={{ 
                  width: `${confidence}%`,
                  boxShadow: isInvest ? "0 0 10px #10b981" : "0 0 10px #f43f5e" 
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
