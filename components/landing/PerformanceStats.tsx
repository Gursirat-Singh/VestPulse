"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/* ── stat data ─────────────────────────────────────── */
const stats: {
  value: string;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sublabel: string;
}[] = [
  {
    value: "10,000+",
    numericValue: 10000,
    suffix: "+",
    label: "Companies Supported",
    sublabel: "Global equity coverage",
  },
  {
    value: "50+",
    numericValue: 50,
    suffix: "+",
    label: "Live Research Sources",
    sublabel: "Real-time data feeds",
  },
  {
    value: "< 2 min",
    prefix: "< ",
    numericValue: 2,
    suffix: " min",
    label: "Avg Analysis Time",
    sublabel: "End-to-end pipeline",
  },
  {
    value: "7",
    numericValue: 7,
    label: "Pipeline Steps",
    sublabel: "Deterministic stages",
  },
];

/* ── animated counter hook ─────────────────────────── */
function useCountUp(
  target: number,
  isInView: boolean,
  duration = 2000
): number {
  const [current, setCurrent] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return current;
}

/* ── single stat card ──────────────────────────────── */
function StatCard({
  stat,
  index,
}: {
  stat: (typeof stats)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const count = useCountUp(stat.numericValue ?? 0, isInView, 1800);

  const formattedValue =
    stat.numericValue !== undefined
      ? `${stat.prefix ?? ""}${count.toLocaleString()}${stat.suffix ?? ""}`
      : stat.value;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      {/* card */}
      <div
        className="
          relative overflow-hidden rounded-2xl
          glass-panel glass-panel-hover
          border-t-2 border-t-accent-violet/40
          px-6 py-8 sm:py-10
          flex flex-col items-center text-center
          transition-all duration-500
          group-hover:-translate-y-1
        "
      >
        {/* ambient glow on hover */}
        <div
          className="
            pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2
            w-40 h-40 rounded-full
            bg-accent-violet/0 group-hover:bg-accent-violet/[0.07]
            blur-3xl transition-all duration-700
          "
        />

        {/* stat number */}
        <span className="relative z-10 text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-white">
          {formattedValue}
        </span>

        {/* primary label */}
        <span className="relative z-10 mt-3 text-sm font-semibold tracking-wide text-slate-300 uppercase">
          {stat.label}
        </span>

        {/* sub-label */}
        <span className="relative z-10 mt-1 text-xs text-slate-500 font-medium">
          {stat.sublabel}
        </span>
      </div>
    </motion.div>
  );
}

/* ── section ───────────────────────────────────────── */
export function PerformanceStats() {
  return (
    <section className="relative py-20 sm:py-24 overflow-hidden">
      {/* gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-bg-card/60 to-bg-base pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* subtle violet radial */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent-violet/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
