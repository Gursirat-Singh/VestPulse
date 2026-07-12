"use client";

import React from "react";
import { Share2, Clock, Calendar, ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

interface ReportHeaderProps {
  companyName: string;
  ticker?: string;
  decision: "INVEST" | "PASS" | null;
  confidence: number | null;
  timestamp: string;
  duration?: string;
  sector?: string;
  industry?: string;
}

export function ReportHeader({
  companyName,
  ticker = "N/A",
  decision,
  confidence,
  timestamp,
  duration = "45s",
  sector = "Technology",
  industry = "Software & Services",
}: ReportHeaderProps) {
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/analyze?company=${encodeURIComponent(companyName)}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard.");
    } catch (err) {
      toast.error("Failed to copy share link.");
    }
  };

  const isInvest = decision === "INVEST";
  const initials = companyName.slice(0, 2).toUpperCase();

  return (
    <div className="glass-panel p-6 md:p-8 rounded-3xl border-white/[0.06] space-y-6 relative overflow-hidden">
      {/* Decorative gradient element */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isInvest ? "from-emerald-500/10" : "from-rose-500/10"} to-transparent rounded-bl-full pointer-events-none`} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Company Identity */}
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-lg text-emerald-400">
            {initials}
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-100">{companyName}</h1>
              <span className="text-sm font-mono bg-zinc-900 border border-white/5 px-2 py-0.5 rounded text-zinc-400">
                {ticker}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-zinc-500 font-medium">
              <span>{sector}</span>
              <span>&bull;</span>
              <span>{industry}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white shadow-sm hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 mr-2 text-zinc-400" />
            Share Research
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
        {/* Verdict */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Investment Verdict</span>
          <div className="flex items-center space-x-2">
            <span className={`text-xl font-extrabold ${isInvest ? "text-emerald-400" : "text-rose-400"}`}>
              {decision || "PENDING"}
            </span>
            {decision && (
              <Badge variant={isInvest ? "success" : "destructive"}>
                {isInvest ? "Catalyst Alert" : "High Risk"}
              </Badge>
            )}
          </div>
        </div>

        {/* Confidence */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Confidence Score</span>
          <div className="text-xl font-extrabold text-zinc-200">
            {confidence ? `${confidence}%` : "N/A"}
          </div>
        </div>

        {/* Analysis Timestamp */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Analysis Date</span>
          <div className="flex items-center space-x-1.5 text-sm text-zinc-300 font-medium h-7">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <span>{timestamp}</span>
          </div>
        </div>

        {/* Research Duration */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Analysis Duration</span>
          <div className="flex items-center space-x-1.5 text-sm text-zinc-300 font-medium h-7">
            <Clock className="w-4 h-4 text-zinc-500" />
            <span>{duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
