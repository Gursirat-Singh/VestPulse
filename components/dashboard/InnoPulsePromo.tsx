"use client";

import React from "react";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, Sparkles, Lock, ArrowUpRight } from "lucide-react";

interface InnoPulsePromoProps {
  companyName: string;
  ticker?: string;
  isPublic?: boolean;
}

// 1. Bottom report banner (always visible at the bottom of the report)
export function InnoPulseBottomBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass-panel border border-white/[0.04] rounded-3xl p-8 relative overflow-hidden bg-gradient-to-br from-[#0F1015] to-[#0A0B0E] mt-12"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/[0.03] blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[11px] font-mono text-emerald-400">
            <Rocket className="w-3.5 h-3.5" />
            <span>Continue Your Research</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Researching the Indian Startup Ecosystem?
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Switch to our specialized startup platform, <span className="text-white font-medium">InnoPulse</span>, to track DPIIT-recognized startups, funding rounds, incubators, and government schemes.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0">
          <a
            href="https://innopulse-puce.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <span>Explore InnoPulse</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <span className="flex items-center space-x-1 text-[10px] font-mono text-amber-500/80">
            <Lock className="w-2.5 h-2.5" />
            <span>Authentication required</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// 2. Smart display card for private startups/companies
export function InnoPulseStartupCard({ companyName }: { companyName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-[#111A16] to-[#0A0E0D] shadow-[0_0_50px_-12px_rgba(16,185,129,0.1)]"
    >
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400">
            <Sparkles className="w-3 h-3" />
            <span>Startup Ecosystem Match</span>
          </div>
          <h4 className="text-lg font-bold text-white">
            Looking for startup-specific insights on &ldquo;{companyName}&rdquo;?
          </h4>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            VestPulse specializes in public equities. To explore venture funding rounds, cap tables, DPIIT recognition status, and investor networks for Indian startups like <span className="text-emerald-400 font-semibold">{companyName}</span>, use InnoPulse.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0 w-full md:w-auto">
          <a
            href="https://innopulse-puce.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            <span>Search on InnoPulse</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
          <span className="flex items-center space-x-1 text-[10px] font-mono text-amber-500/80 mx-auto md:mx-0">
            <Lock className="w-2.5 h-2.5" />
            <span>Auth required</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// 3. Smart display card for Indian public companies
export function InnoPulseIndianPublicCard({ companyName }: { companyName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel border border-emerald-500/10 rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-[#0C1210]/90 to-[#080B0A]/90"
    >
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400">
            <Rocket className="w-3.5 h-3.5" />
            <span>Indian Venture Ecosystem</span>
          </div>
          <h4 className="text-lg font-bold text-white">
            Explore related Indian startups
          </h4>
          <p className="text-sm text-slate-350 max-w-3xl leading-relaxed">
            As a leading Indian entity, <span className="text-emerald-400 font-semibold">{companyName}</span> has deep connections to India&apos;s tech and startup ecosystem. Analyze startup competitors, strategic venture investments, and DPIIT-recognized builders in similar industries on InnoPulse.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0 w-full md:w-auto">
          <a
            href="https://innopulse-puce.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 hover:border-transparent text-emerald-400 hover:text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all duration-300 cursor-pointer"
          >
            <span>Explore Ecosystem</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <span className="flex items-center space-x-1 text-[10px] font-mono text-amber-500/70 mx-auto md:mx-0">
            <Lock className="w-2.5 h-2.5" />
            <span>Auth required</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
