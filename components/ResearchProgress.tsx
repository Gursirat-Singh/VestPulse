"use client";

import React from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";

interface ResearchProgressProps {
  activeNode: string | null;
  completedNodes: string[];
  messages: Record<string, string>;
  errors: string[];
}

const NODES_ORDER = [
  { id: "resolveCompany", label: "Resolve Company Entity" },
  { id: "gatherNews", label: "Gather Recent News & Sentiment" },
  { id: "gatherFinancials", label: "Collect Financial Fundamentals" },
  { id: "gatherCompetitors", label: "Map Competitive Landscape" },
  { id: "gatherRisks", label: "Assess Primary Risk Factors" },
  { id: "synthesize", label: "Synthesize Gathered Intelligence" },
  { id: "decide", label: "Investment Verdict Formulation" },
  { id: "generateReport", label: "Compile Professional Report" },
];

export function ResearchProgress({ activeNode, completedNodes, messages, errors }: ResearchProgressProps) {
  // If the graph hasn't started and no activeNode or completedNode exists, render nothing
  if (!activeNode && completedNodes.length === 0) return null;

  // Determine if we went down the insufficient data route
  const isInsufficientPath = completedNodes.includes("insufficientData") || activeNode === "insufficientData";

  const renderNodesList = isInsufficientPath 
    ? [
        { id: "resolveCompany", label: "Resolve Company Entity" },
        { id: "insufficientData", label: "Assess Data Adequacy" },
      ]
    : NODES_ORDER;

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-950/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Agent Research Pipeline
      </h3>
      <div className="space-y-3.5">
        {renderNodesList.map((step) => {
          const isCompleted = completedNodes.includes(step.id);
          const isActive = activeNode === step.id;
          const statusText = messages[step.id];

          return (
            <div
              key={step.id}
              className={`flex items-start space-x-3 transition-colors duration-300 p-2.5 rounded-lg ${
                isActive ? "bg-slate-900/80 border border-indigo-500/20" : "bg-transparent"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isCompleted ? (
                  <div className="h-5 w-5 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                ) : isActive ? (
                  <div className="h-5 w-5 bg-indigo-500/10 rounded-full flex items-center justify-center">
                    <Loader2 className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border border-slate-800 flex items-center justify-center" />
                )}
              </div>

              <div className="flex-1 space-y-0.5">
                <p
                  className={`text-sm font-medium transition-colors ${
                    isCompleted
                      ? "text-slate-300"
                      : isActive
                      ? "text-indigo-400 font-semibold"
                      : "text-slate-600"
                  }`}
                >
                  {step.label}
                </p>
                {isActive && statusText && (
                  <p className="text-xs text-slate-400 animate-pulse">{statusText}</p>
                )}
                {isCompleted && statusText && (
                  <p className="text-xs text-slate-500">{statusText}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-rose-400">Non-fatal Warnings:</p>
            <ul className="list-disc list-inside text-[11px] text-rose-300/80 space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
