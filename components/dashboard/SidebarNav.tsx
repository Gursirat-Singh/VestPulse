"use client";

import React from "react";
import { 
  FileText, 
  TrendingUp, 
  Newspaper, 
  Users2, 
  AlertOctagon, 
  DollarSign, 
  Lightbulb 
} from "lucide-react";

interface SidebarNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function SidebarNav({ activeSection, onSectionChange }: SidebarNavProps) {
  const sections = [
    { id: "summary", label: "Executive Summary", icon: FileText },
    { id: "financials", label: "Financial Analysis", icon: TrendingUp },
    { id: "news", label: "News & Sentiment", icon: Newspaper },
    { id: "competitors", label: "Competitive Analysis", icon: Users2 },
    { id: "risks", label: "Risk Assessment", icon: AlertOctagon },
    { id: "valuation", label: "Valuation", icon: DollarSign },
    { id: "thesis", label: "Investment Thesis", icon: Lightbulb },
  ];

  const handleScroll = (id: string) => {
    onSectionChange(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2 drop-shadow-sm">
        Research Overview
      </span>
      {sections.map((sec) => {
        const Icon = sec.icon;
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => handleScroll(sec.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 text-left border-l-2 ${
              isActive
                ? "bg-accent-violet/10 text-white border-accent-violet shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border-transparent"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "drop-shadow-[0_0_5px_currentColor]" : ""}`} />
            <span>{sec.label}</span>
          </button>
        );
      })}
    </div>
  );
}
