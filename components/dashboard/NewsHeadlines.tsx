"use client";

import React from "react";
import { NewsItem } from "../../types";
import { ExternalLink } from "lucide-react";

interface NewsHeadlinesProps {
  items: NewsItem[];
}

export function NewsHeadlines({ items = [] }: NewsHeadlinesProps) {
  const displayItems = items.slice(0, 3); // show latest 3 items to match screenshot layout

  const getSource = (url?: string) => {
    if (!url) return "Web";
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace("www.", "");
    } catch {
      return "Web";
    }
  };

  return (
    <div className="glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] flex flex-col h-full justify-between">
      <div className="space-y-4">
        <h3 className="text-sm font-bold bg-gradient-to-r from-white/90 to-white/50 bg-clip-text text-transparent uppercase tracking-wider">
          Recent News Headlines
        </h3>
        
        {displayItems.length === 0 ? (
          <div className="text-xs text-white/40 italic py-6">No news headlines found.</div>
        ) : (
          <div className="space-y-4">
            {displayItems.map((item, idx) => (
              <div
                key={idx}
                className="group/item flex flex-col space-y-1.5 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:-translate-y-0.5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-white/80 group-hover/item:text-white leading-snug transition-colors line-clamp-2"
                  >
                    {item.title}
                  </a>
                  <ExternalLink className="w-3 h-3 text-white/40 group-hover/item:text-white/80 mt-0.5 flex-shrink-0 transition-colors" />
                </div>
                
                <div className="flex items-center space-x-2 text-[10px] text-white/50 font-semibold uppercase tracking-wider">
                  <span>{item.publishedDate || "Recent"}</span>
                  <span>&bull;</span>
                  <span>{getSource(item.url)}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <div className="relative w-1.5 h-1.5 mr-1">
                      <div className="absolute inset-0 rounded-full bg-emerald-400 z-10"></div>
                      <div className="absolute inset-0 rounded-full bg-emerald-400/50 blur-[2px] animate-pulse"></div>
                    </div>
                    Positive
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 3 && (
        <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between w-full">
          <a
            href={items[3]?.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-white/70 hover:text-white uppercase tracking-wider flex items-center space-x-1 transition-colors"
          >
            <span>View All News</span>
            <span>&rarr;</span>
          </a>
        </div>
      )}
    </div>
  );
}
