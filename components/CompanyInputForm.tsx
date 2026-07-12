"use client";

import React, { useState } from "react";
import { companyInputSchema } from "../lib/validation";

interface CompanyInputFormProps {
  onSubmit: (companyName: string) => void;
  disabled: boolean;
  initialValue?: string;
}

export function CompanyInputForm({ onSubmit, disabled, initialValue = "" }: CompanyInputFormProps) {
  const [input, setInput] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const examples = [
    { name: "Nvidia", label: "NVIDIA (Large Public)" },
    { name: "Zomato", label: "Zomato (Regional Public)" },
    { name: "Stripe", label: "Stripe (Private Entity)" },
    { name: "NonExistentFictionalCo", label: "Fictional Co. (Insufficient Data)" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (input.trim() && !disabled) {
      const result = companyInputSchema.safeParse(input.trim());
      if (!result.success) {
        setError(result.error.errors[0].message);
        return;
      }
      onSubmit(input.trim());
    }
  };

  const handleChipClick = (name: string) => {
    if (!disabled) {
      setInput(name);
      setError(null);
      onSubmit(name);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
          placeholder="Enter company name or stock ticker (e.g. Tesla, NVDA)..."
          disabled={disabled}
          className="flex-1 rounded-xl bg-zinc-900 border border-white/[0.08] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[120px]"
        >
          {disabled ? (
            <div className="flex items-center space-x-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Analyzing...</span>
            </div>
          ) : (
            "Analyze"
          )}
        </button>
      </form>

      {error && (
        <div className="flex flex-col text-rose-400 text-sm font-medium bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg backdrop-blur-md">
          <div className="flex items-center space-x-1">
            <span className="font-bold">⚠ Invalid company name</span>
          </div>
          <span className="text-rose-300 mt-1 whitespace-pre-line leading-relaxed">{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
          Select a profile to test the agent paths:
        </span>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex.name}
              type="button"
              onClick={() => handleChipClick(ex.name)}
              disabled={disabled}
              className="text-xs bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 px-3 py-1.5 rounded-full border border-white/[0.06] hover:border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
