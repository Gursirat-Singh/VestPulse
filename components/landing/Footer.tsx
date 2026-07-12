"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";

export function Footer() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/analyze?company=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <footer className="bg-bg-base border-t border-white/[0.04] pt-20 pb-10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 space-y-16 relative z-10">

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-2xl mx-auto"
        >
          {/* Decorative radial gradient orb */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-accent-violet/[0.06] blur-[100px] pointer-events-none" />

          {/* Gradient border wrapper */}
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-accent-violet/30 via-white/[0.06] to-accent-violet/10 relative">
            {/* Inner card */}
            <div className="rounded-[15px] bg-gradient-to-br from-[#141519] to-[#0F1014] p-8 sm:p-10 text-center space-y-6 backdrop-blur-sm">
              {/* Subtle grid pattern overlay */}
              <div className="absolute inset-0 rounded-[15px] bg-grid-pattern opacity-30 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* Gradient heading */}
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-100 via-white to-slate-300 bg-clip-text text-transparent">
                  Ready to analyze another company?
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Start a new research session powered by autonomous AI agents.
                </p>

                {/* Glowing search bar */}
                <form
                  onSubmit={handleSearch}
                  className="relative w-full flex items-center bg-bg-base/80 border border-white/[0.08] rounded-xl p-1.5 transition-all duration-300 focus-within:border-accent-violet/40 focus-within:shadow-[0_0_20px_-4px_rgba(124,124,255,0.25)] text-left group"
                >
                  <Search className="w-5 h-5 text-slate-500 ml-3 mr-2 flex-shrink-0 group-focus-within:text-accent-violet/60 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search company or ticker (e.g. TSLA)..."
                    className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-600 placeholder:font-mono text-sm sm:text-base focus:ring-0 focus:outline-none min-w-0 pr-3"
                  />
                  <button
                    type="submit"
                    className="bg-accent-violet hover:bg-[#6c6cff] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center space-x-1.5 flex-shrink-0 hover:shadow-[0_0_16px_-2px_rgba(124,124,255,0.35)] cursor-pointer"
                  >
                    <span>Analyze</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lower Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/[0.06] pt-8 text-xs text-slate-500"
        >
          {/* Logo — refined treatment */}
          <div className="flex items-center space-x-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-accent-violet/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img
                src="/logo.png"
                alt="VestPulse Logo"
                className="w-5 h-5 object-contain relative z-10"
              />
            </div>
            <span className="tracking-tight text-slate-300 font-semibold text-sm">VestPulse</span>
          </div>

          <p className="text-slate-600 font-mono text-[11px]">
            &copy; {new Date().getFullYear()} VestPulse. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
