"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import { HistoryItem } from "../../lib/history";
import { companyInputSchema } from "../../lib/validation";

interface PremiumSearchBarProps {
  onSubmit: (companyName: string) => void;
  disabled: boolean;
  initialValue?: string;
  recentItems: HistoryItem[];
}

export function PremiumSearchBar({ onSubmit, disabled, initialValue = "", recentItems }: PremiumSearchBarProps) {
  const [input, setInput] = useState(initialValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInput(initialValue);
  }, [initialValue]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (input.trim() && !disabled) {
      const result = companyInputSchema.safeParse(input.trim());
      if (!result.success) {
        result.error.issues[0]?.message ??
          "Please enter a valid company name."
      }
      onSubmit(input.trim());
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || recentItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < recentItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : recentItems.length - 1));
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && focusedIndex < recentItems.length) {
        e.preventDefault();
        const selected = recentItems[focusedIndex].companyName;
        setInput(selected);
        onSubmit(selected);
        setShowDropdown(false);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-30">
      <form onSubmit={handleSubmit} className="relative flex gap-2">
        <div className="relative flex-1 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-xl blur-sm opacity-50 group-focus-within:opacity-100 transition-all duration-300 pointer-events-none" />
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus-within:border-indigo-500/50 transition-colors">
            {disabled ? (
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mr-2" />
            ) : (
              <Search className="w-5 h-5 text-slate-500 mr-2" />
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
                setShowDropdown(true);
                setFocusedIndex(-1);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder="Enter company name or ticker (e.g., Apple, TSLA)..."
              disabled={disabled}
              className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-sm focus:ring-0"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[120px]"
        >
          {disabled ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {error && (
        <div className="absolute top-full left-0 mt-2 flex flex-col text-rose-400 text-sm font-medium bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg backdrop-blur-md">
          <div className="flex items-center space-x-1">
            <span className="font-bold">⚠ Invalid company name</span>
          </div>
          <span className="text-rose-300 mt-1 whitespace-pre-line leading-relaxed">{error}</span>
        </div>
      )}

      {/* Recent Searches Dropdown */}
      {showDropdown && recentItems.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-40 max-h-60 overflow-y-auto scrollbar-none">
          <div className="px-4 py-2 border-b border-slate-900 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Recent Searches
          </div>
          {recentItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setInput(item.companyName);
                onSubmit(item.companyName);
                setShowDropdown(false);
              }}
              onMouseEnter={() => setFocusedIndex(index)}
              className={`w-full text-left px-4 py-3 flex justify-between items-center text-sm transition-colors ${index === focusedIndex ? "bg-slate-900/60 text-slate-100" : "text-slate-400"
                }`}
            >
              <div>
                <span className="font-medium text-slate-200">{item.companyName}</span>
                <span className="ml-2 text-xs text-slate-500 font-mono">{item.ticker}</span>
              </div>
              <div className="flex items-center space-x-2">
                {item.decision && (
                  <span className={`text-xs font-bold ${item.decision === "INVEST" ? "text-emerald-400" : "text-rose-400"}`}>
                    {item.decision} ({item.confidence}%)
                  </span>
                )}
                <ArrowRight className="w-3.5 h-3.5 opacity-50" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
