"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface NewsSentimentChartProps {
  sentiment: "positive" | "neutral" | "negative" | null;
  heuristicSentiment?: number;
}

export function NewsSentimentChart({ sentiment, heuristicSentiment = 0 }: NewsSentimentChartProps) {
  // Translate heuristic sentiment value to percentage distribution for display
  // e.g. sentiment score ranges from -1 to 1. We can construct a nice balance.
  let positive = 33;
  let neutral = 34;
  let negative = 33;

  if (sentiment === "positive") {
    positive = Math.min(90, Math.round(55 + (heuristicSentiment * 25)));
    negative = Math.max(5, Math.round(15 - (heuristicSentiment * 5)));
    neutral = 100 - positive - negative;
  } else if (sentiment === "negative") {
    negative = Math.min(90, Math.round(55 - (heuristicSentiment * 25)));
    positive = Math.max(5, Math.round(15 + (heuristicSentiment * 5)));
    neutral = 100 - positive - negative;
  } else {
    neutral = 60;
    positive = 20;
    negative = 20;
  }

  const data = [
    { name: "Positive", value: positive, color: "#34d399" },
    { name: "Neutral", value: neutral, color: "#94a3b8" },
    { name: "Negative", value: negative, color: "#fb7185" },
  ];

  return (
    <div id="news" className="scroll-mt-24 glass-panel border border-white/[0.04] rounded-3xl p-6 relative group overflow-hidden bg-gradient-to-br from-[#13141a] to-[#0D0E12] flex flex-col h-[320px] md:h-full justify-between hover:border-white/[0.08] transition-all duration-300">
      <h3 className="text-sm font-bold text-white/80 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 uppercase tracking-wider mb-2">
        News Sentiment (Last 30 Days)
      </h3>
      <div className="flex-grow flex items-center justify-between gap-4">
        {/* Recharts Pie (Donut) Chart */}
        <div className="w-1/2 h-40 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={52}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    style={{ filter: `drop-shadow(0 0 6px ${entry.color}66)` }} 
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Sentiment
            </span>
            <span className="text-xs font-extrabold text-white font-mono">
              {sentiment ? sentiment.toUpperCase() : "N/A"}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {data.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full block flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300 font-medium">{item.name}</span>
              </div>
              <span className="text-white/90 font-mono font-bold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
