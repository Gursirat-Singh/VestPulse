"use client";

import React from "react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { CheckCircle2, XCircle, Percent } from "lucide-react";

interface DecisionCardProps {
  decision: "INVEST" | "PASS" | null;
  confidence: number | null;
  oneLineVerdict: string | null;
}

export function DecisionCard({ decision, confidence, oneLineVerdict }: DecisionCardProps) {
  if (!decision) return null;

  const isInvest = decision === "INVEST";

  return (
    <div className="w-full max-w-2xl mx-auto overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/60 shadow-2xl backdrop-blur-md">
      {/* Decorative top border glow */}
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${
          isInvest ? "from-emerald-500 via-teal-500 to-cyan-500" : "from-rose-500 via-orange-500 to-amber-500"
        }`}
      />
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
              Investment Decision
            </span>
            <div className="flex items-center space-x-3">
              <span className={`text-3xl md:text-4xl font-extrabold tracking-tight ${
                isInvest ? "text-emerald-400" : "text-rose-400"
              }`}>
                {decision}
              </span>
              <Badge variant={isInvest ? "success" : "destructive"} className="h-6">
                {isInvest ? "Strong Catalysts" : "High Risk / Poor Ratios"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end space-y-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
              Confidence Score
            </span>
            <div className="flex items-center space-x-1.5 text-zinc-200">
              <span className="text-2xl md:text-3xl font-bold">{confidence}</span>
              <Percent className="h-5 w-5 text-zinc-500" />
            </div>
          </div>
        </div>

        {oneLineVerdict && (
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.04] flex items-start space-x-3">
            {isInvest ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium text-zinc-300 leading-relaxed">
              {oneLineVerdict}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span>Minimum Viable (0)</span>
            <span>High Conviction (100)</span>
          </div>
          <Progress value={confidence || 0} />
        </div>
      </div>
    </div>
  );
}
