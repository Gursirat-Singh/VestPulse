"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#pipeline" },
  { label: "Pipeline", href: "#pipeline" },
  { label: "Technology", href: "#technology" },
  { label: "Sample Report", href: "#example-report" },
];

export function Nav() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full"
    >
      {/* Glass backdrop layer */}
      <div className="absolute inset-0 bg-bg-base/70 backdrop-blur-xl" />

      {/* Gradient border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-violet/30 to-transparent" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo & Wordmark */}
        <Link
          href="/"
          className="flex items-center space-x-2.5 text-white font-semibold text-lg hover:opacity-90 transition-opacity group"
        >
          {/* Animated glow wrapper */}
          <div className="relative flex items-center justify-center">
            {/* Glow pulse behind logo */}
            <motion.div
              className="absolute w-8 h-8 rounded-full bg-accent-violet/20 blur-lg"
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <img
              src="/logo.png"
              alt="VestPulse Logo"
              className="relative w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(124,124,255,0.3)]"
            />
          </div>
          <span className="tracking-tight text-slate-200 group-hover:text-white transition-colors duration-300">
            VestPulse
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-7 text-[13px] text-slate-400 font-medium tracking-wide">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative py-1 group transition-colors duration-300 hover:text-white"
            >
              {link.label}
              {/* Sliding underline from left */}
              <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-accent-violet to-blue-500 transition-all duration-300 ease-out group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div>
          <Link
            href="/analyze"
            className="relative inline-flex items-center justify-center bg-gradient-to-r from-accent-violet to-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_24px_rgba(124,124,255,0.35)] shadow-lg shadow-accent-violet/15"
          >
            Start Analysis
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
