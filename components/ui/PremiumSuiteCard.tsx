import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Lock, LucideIcon } from "lucide-react";

interface PremiumSuiteCardProps {
  title: string;
  description: string;
  features: string[];
  link: string;
  ctaText: string;
  icon: LucideIcon;
  badge?: string;
  authRequired?: boolean;
  highlighted?: boolean;
  accentColor?: string; // e.g. "violet" or "emerald"
}

export function PremiumSuiteCard({
  title,
  description,
  features,
  link,
  ctaText,
  icon: Icon,
  badge,
  authRequired = false,
  highlighted = false,
  accentColor = "violet"
}: PremiumSuiteCardProps) {
  const isViolet = accentColor === "violet";
  
  const borderGradient = isViolet
    ? "from-accent-violet/30 via-white/[0.06] to-accent-violet/10"
    : "from-emerald-500/30 via-white/[0.06] to-emerald-500/10";
    
  const accentText = isViolet ? "text-accent-violet" : "text-emerald-400";
  const accentBg = isViolet ? "bg-accent-violet/10" : "bg-emerald-500/10";
  const accentGlow = isViolet 
    ? "shadow-[0_0_20px_-5px_rgba(124,124,255,0.3)]" 
    : "shadow-[0_0_20px_-5px_rgba(52,211,153,0.3)]";
  const buttonBg = isViolet
    ? "bg-accent-violet hover:bg-[#6c6cff] shadow-accent-violet/20"
    : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative flex flex-col h-full rounded-2xl p-[1px] bg-gradient-to-br from-white/[0.08] to-white/[0.02] overflow-hidden group"
      style={{
        background: highlighted ? undefined : "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)"
      }}
    >
      {/* Highlighted border gradient wrapper */}
      {highlighted && (
        <div className={`absolute inset-0 bg-gradient-to-br ${borderGradient} rounded-2xl -z-10`} />
      )}

      {/* Decorative radial gradient orb inside */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-2xl ${
        isViolet ? "bg-accent-violet/20" : "bg-emerald-500/20"
      }`} />

      {/* Inner Content Card */}
      <div className="flex flex-col h-full rounded-[15px] bg-[#0E0F12]/95 p-6 sm:p-8 backdrop-blur-md relative z-10 flex-1">
        {/* Header Block */}
        <div className="flex items-start justify-between mb-6">
          <div className={`p-3 rounded-xl ${accentBg} ${accentText} ${accentGlow}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex items-center space-x-2">
            {badge && (
              <span className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full border bg-white/[0.02] text-slate-400 border-white/[0.06]`}>
                {badge}
              </span>
            )}
            {authRequired && (
              <span className="flex items-center space-x-1 text-[10px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" />
                <span>Auth Required</span>
              </span>
            )}
          </div>
        </div>

        {/* Title & Desc */}
        <div className="space-y-2 mb-6">
          <h4 className="text-xl font-bold tracking-tight text-white">{title}</h4>
          <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>

        {/* Features Checklist */}
        <ul className="space-y-2.5 mb-8 flex-1">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-center text-xs text-slate-300">
              <span className={`w-1.5 h-1.5 rounded-full ${isViolet ? "bg-accent-violet" : "bg-emerald-400"} mr-2.5 flex-shrink-0`} />
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        {/* Action Button */}
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-semibold text-white transition-all duration-300 shadow-md ${buttonBg} hover:shadow-lg cursor-pointer`}
        >
          <span>{ctaText}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
