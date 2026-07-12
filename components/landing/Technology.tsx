"use client";

import React from "react";
import { motion } from "framer-motion";

const techStack = [
  { name: "Next.js", desc: "React Framework", symbol: "N", color: "text-white" },
  { name: "LangGraph", desc: "Agent Workflows", symbol: "LG", color: "text-accent-violet" },
  { name: "LangChain", desc: "LLM Orchestration", symbol: "LC", color: "text-accent-violet" },
  { name: "Tavily", desc: "Real-Time Search", symbol: "Tv", color: "text-accent-green" },
  { name: "FMP API", desc: "Financial Data Core", symbol: "FM", color: "text-accent-green" },
  { name: "Gemini / Groq", desc: "Inference Layer", symbol: "AI", color: "text-accent-violet" },
];

export function Technology() {
  return (
    <section id="technology" className="py-24 bg-bg-base border-t border-white/[0.04] relative overflow-hidden">
      {/* Gradient orb background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent-violet/[0.04] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent-green/[0.02] rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Decorative violet accent line */}
          <div className="w-10 h-[3px] rounded-full bg-gradient-to-r from-accent-violet to-accent-violet/40 mx-auto mb-5" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Powered By
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Best-in-class infrastructure for intelligent research
          </p>
        </motion.div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {techStack.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: 0.45,
                delay: index * 0.07,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="
                group relative rounded-xl overflow-hidden
                bg-bg-card/80 backdrop-blur-sm
                border border-white/[0.06]
                p-5 text-center
                transition-all duration-300 ease-out
                hover:-translate-y-[2px]
                hover:border-accent-violet/30
                hover:shadow-[0_0_25px_-5px_rgba(124,124,255,0.1)]
              "
            >
              {/* Gradient top edge */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-violet/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Inner hover light */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-b from-accent-violet/[0.03] via-transparent to-transparent" />

              {/* Symbol Icon */}
              <div className="relative mx-auto mb-4">
                <div className="absolute inset-0 rounded-xl bg-accent-violet/15 blur-lg scale-150 opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                <div className="relative w-11 h-11 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-accent-violet/20 transition-colors duration-300">
                  <span className={`text-sm font-bold font-mono ${tech.color} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
                    {tech.symbol}
                  </span>
                </div>
              </div>

              {/* Text */}
              <h4 className="font-semibold text-sm text-slate-200 tracking-tight">
                {tech.name}
              </h4>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                {tech.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
