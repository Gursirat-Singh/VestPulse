"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Rocket } from "lucide-react";
import { PremiumSuiteCard } from "../ui/PremiumSuiteCard";

export function ResearchSuite() {
  return (
    <section id="research-suite" className="py-20 relative overflow-hidden bg-bg-base border-t border-white/[0.04]">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] rounded-full bg-accent-violet/[0.03] blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10 space-y-14">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-accent-violet/10 border border-accent-violet/25 px-3 py-1 rounded-full text-xs font-semibold text-accent-violet"
          >
            <span>Unified Platform</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
          >
            Explore the AI Research Suite
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-400 leading-relaxed"
          >
            Access specialized research platforms powered by autonomous AI agents, tailored for public equities and private startup ecosystems.
          </motion.p>
        </div>

        {/* Dual Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* VestPulse Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <PremiumSuiteCard
              title="VestPulse"
              description="Deep analysis of public markets and financial statements powered by multi-agent consensus."
              features={[
                "Institutional-grade financial tables",
                "Advanced valuation ratios & model synthesis",
                "Real-time news sentiment & risk modeling",
                "Comprehensive PDF research exports"
              ]}
              link="/analyze"
              ctaText="Start Equities Analysis"
              icon={BarChart3}
              badge="Public Equities"
              highlighted={true}
              accentColor="violet"
            />
          </motion.div>

          {/* InnoPulse Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <PremiumSuiteCard
              title="InnoPulse"
              description="Track and analyze Indian startups, funding rounds, incubators, and government schemes."
              features={[
                "DPIIT-recognized startup verification",
                "Venture funding rounds & investor data",
                "Incubator & accelerator directories",
                "Government scheme eligibility assessments"
              ]}
              link="https://innopulse-puce.vercel.app/"
              ctaText="Explore Startups Platform"
              icon={Rocket}
              badge="Indian Startups"
              authRequired={true}
              highlighted={true}
              accentColor="emerald"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
