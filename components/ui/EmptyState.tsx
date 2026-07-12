"use client";

import React from "react";
import { motion } from "framer-motion";
import { LineChart, Search, Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto text-center py-20 px-6 glass-panel rounded-3xl border-slate-900 relative overflow-hidden"
    >
      {/* Background gradients */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-xl relative group">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-300" />
          <LineChart className="w-8 h-8 text-indigo-400 relative z-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
            <span>Start Your Research</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            Search any public company or ticker to run our autonomous multi-agent pipeline and generate an institutional-grade investment report.
          </p>
        </div>

        {/* Abstract animated wave visualization */}
        <div className="w-full h-12 flex items-end justify-center space-x-1.5 pt-4">
          {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.7, 0.9, 0.5].map((val, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-gradient-to-t from-indigo-500 to-blue-400 rounded-full"
              initial={{ height: 4 }}
              animate={{ height: [4, val * 40, 4] }}
              transition={{
                duration: 2 + i * 0.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
