"use client";

import React from "react";
import { HistoryItem, formatRelativeTime } from "../../lib/history";
import { Clock, Trash2, ArrowUpRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelect: (company: string) => void;
  onClear: () => void;
}

export function HistoryDrawer({ isOpen, onClose, items, onSelect, onClear }: HistoryDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Drawer content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-slate-950 border-t border-slate-900 rounded-t-3xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header drag handle area */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 rounded-full bg-slate-850" />
            </div>

            <div className="px-6 pb-4 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Recent Research</span>
              </div>
              <div className="flex items-center space-x-4">
                {items.length > 0 && (
                  <button
                    onClick={onClear}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-none">
              {items.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-600 space-y-2">
                  <Clock className="w-8 h-8 opacity-20" />
                  <p className="text-xs">No recent research found.</p>
                </div>
              ) : (
                items.map((item, idx) => {
                  const isInvest = item.decision === "INVEST";
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelect(item.companyName);
                        onClose();
                      }}
                      className="w-full text-left glass-panel p-4 rounded-2xl flex flex-col space-y-2 border-slate-900"
                    >
                      <div className="flex justify-between items-start w-full">
                        <div>
                          <div className="font-semibold text-sm text-slate-200">
                            {item.companyName}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {item.ticker}
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-500" />
                      </div>

                      <div className="flex justify-between items-center w-full pt-1">
                        {item.decision ? (
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-bold ${isInvest ? "text-emerald-400" : "text-rose-400"}`}>
                              {item.decision}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {item.confidence}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500">No Verdict</span>
                        )}
                        <span className="text-[10px] text-slate-500">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
