"use client";

import React, { useState, useRef, useEffect } from "react";
import { HistoryItem, formatRelativeTime } from "../../lib/history";
import { Clock, Trash2, ArrowUpRight } from "lucide-react";

interface HistorySidebarProps {
  items: HistoryItem[];
  onSelect: (company: string) => void;
  onClear: () => void;
}

export function HistorySidebar({ items, onSelect, onClear }: HistorySidebarProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerConfirm = () => {
    setShowConfirm(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowConfirm(false);
    }, 4000);
  };

  const handleClear = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onClear();
    setShowConfirm(false);
  };

  const handleCancel = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowConfirm(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between px-3 h-7">
        <div className="flex items-center space-x-2 text-slate-200 font-semibold text-xs uppercase tracking-wider">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Recent Research</span>
        </div>
        {items.length > 0 && (
          <div className="flex items-center space-x-1.5">
            {showConfirm ? (
              <div className="flex items-center space-x-1 animate-fade-in">
                <button
                  onClick={handleClear}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={handleCancel}
                  className="text-[10px] text-slate-400 hover:text-slate-300 font-medium px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={triggerConfirm}
                className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                title="Clear all history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-600 py-6 space-y-2">
            <Clock className="w-6 h-6 opacity-20" />
            <p className="text-[11px]">No recent research. Start by searching.</p>
          </div>
        ) : (
          items.map((item, idx) => {
            const isInvest = item.decision === "INVEST";
            return (
              <button
                key={idx}
                onClick={() => onSelect(item.companyName)}
                className="w-full text-left glass-panel glass-panel-hover p-3 rounded-2xl flex flex-col space-y-2 transition-all group border-slate-900 bg-slate-950/10"
              >
                <div className="flex justify-between items-start w-full">
                  <div className="truncate pr-2">
                    <div className="font-semibold text-xs text-slate-200 group-hover:text-white truncate">
                      {item.companyName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-wider">
                      {item.ticker}
                    </div>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                </div>

                <div className="flex justify-between items-center w-full pt-1">
                  {item.decision ? (
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold ${isInvest ? "text-emerald-400" : "text-rose-400"}`}>
                        {item.decision}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {item.confidence}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-500">No Verdict</span>
                  )}
                  <span className="text-[9px] text-slate-500">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
