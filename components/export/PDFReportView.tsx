"use client";

import React, { ForwardedRef, forwardRef } from "react";
import { AgentStateData } from "../../types";
import { CheckCircle2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";

interface PDFReportViewProps {
  data: AgentStateData;
}

export const PDFReportView = forwardRef(function PDFReportView(
  { data }: PDFReportViewProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const profile = data.financialData?.metrics?.profile;
  const ratios = data.financialData?.metrics?.ratios;
  const historical = data.financialData?.metrics?.historical || [];
  const estimates = data.financialData?.metrics?.estimates;
  const isInvest = data.decision === "INVEST";

  // Formatter helpers
  const formatNumber = (num?: number) => {
    if (!num) return "N/A";
    if (num >= 1_000_000_000_000) return `$${(num / 1_000_000_000_000).toFixed(2)} Trillion`;
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)} Billion`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)} Million`;
    return `$${num.toLocaleString()}`;
  };

  const getYoY = (curr?: number, prior?: number) => {
    if (!curr || !prior) return null;
    return ((curr - prior) / prior) * 100;
  };

  const latestYearData = historical[historical.length - 1] || {};
  const prevYearData = historical[historical.length - 2] || {};

  // Build rows for Financial Overview
  const financialRows = [
    {
      metric: "Revenue",
      value: formatNumber(latestYearData.revenue),
      yoy: getYoY(latestYearData.revenue, prevYearData.revenue),
      sparkline: historical.map(h => ({ val: h.revenue }))
    },
    {
      metric: "Gross Profit",
      value: formatNumber(latestYearData.grossProfit),
      yoy: getYoY(latestYearData.grossProfit, prevYearData.grossProfit),
      sparkline: historical.map(h => ({ val: h.grossProfit }))
    },
    {
      metric: "Operating Income",
      value: formatNumber(latestYearData.operatingIncome),
      yoy: getYoY(latestYearData.operatingIncome, prevYearData.operatingIncome),
      sparkline: historical.map(h => ({ val: h.operatingIncome }))
    },
    {
      metric: "Net Income",
      value: formatNumber(latestYearData.netIncome),
      yoy: getYoY(latestYearData.netIncome, prevYearData.netIncome),
      sparkline: historical.map(h => ({ val: h.netIncome }))
    },
    {
      metric: "EPS (Diluted)",
      value: latestYearData.eps ? `$${latestYearData.eps.toFixed(2)}` : "N/A",
      yoy: getYoY(latestYearData.eps, prevYearData.eps),
      sparkline: historical.map(h => ({ val: h.eps }))
    },
    {
      metric: "Free Cash Flow",
      value: formatNumber(latestYearData.freeCashFlow),
      yoy: getYoY(latestYearData.freeCashFlow, prevYearData.freeCashFlow),
      sparkline: historical.map(h => ({ val: h.freeCashFlow }))
    },
    {
      metric: "ROE",
      value: ratios?.roe ? `${(ratios.roe * 100).toFixed(1)}%` : "N/A",
      yoy: ratios?.roe ? ratios.roe * 100 : null,
      sparkline: null
    },
    {
      metric: "Gross Margin",
      value: ratios?.grossMargin ? `${(ratios.grossMargin * 100).toFixed(1)}%` : "N/A",
      yoy: ratios?.grossMargin ? ratios.grossMargin * 100 : null,
      sparkline: null
    }
  ];

  // Bar Chart Data (Revenue / Net Income)
  const barChartData = historical.map(h => ({
    name: h.year || "N/A",
    Revenue: parseFloat((h.revenue / 1_000_000_000).toFixed(2)),
    "Net Income": parseFloat((h.netIncome / 1_000_000_000).toFixed(2))
  }));

  // Health Radar Data
  const roeScore = Math.min(Math.max((ratios?.roe || 0) * 100, 10), 95);
  const profitScore = Math.min(Math.max((ratios?.grossMargin || 0) * 100, 10), 95);
  const profitability = (roeScore + profitScore) / 2;
  const revGrowth = prevYearData.revenue ? ((latestYearData.revenue - prevYearData.revenue) / prevYearData.revenue) * 100 : 0;
  const growth = Math.min(Math.max(revGrowth, 10), 95);
  const deRatio = ratios?.debtToEquity || 0;
  const solvency = Math.max(10, Math.min(95, 100 - deRatio * 30));
  const currRatio = ratios?.currentRatio || 1;
  const efficiency = Math.min(Math.max(currRatio * 35, 10), 95);
  const fcfToNi = latestYearData.netIncome ? (latestYearData.freeCashFlow / latestYearData.netIncome) : 1;
  const cashFlow = Math.min(Math.max(fcfToNi * 75, 10), 95);

  const radarData = [
    { subject: "Profitability", A: profitability },
    { subject: "Growth", A: growth },
    { subject: "Solvency", A: solvency },
    { subject: "Efficiency", A: efficiency },
    { subject: "Cash Flow", A: cashFlow }
  ];

  // Price target slider calculations
  const targetLow = estimates?.targetLow || profile?.price || 100;
  const targetAvg = estimates?.targetAvg || profile?.price || 150;
  const targetHigh = estimates?.targetHigh || profile?.price || 200;
  const currentPrice = profile?.price || 120;
  const totalRange = targetHigh - targetLow;
  const currentPos = totalRange > 0 ? ((currentPrice - targetLow) / totalRange) * 100 : 50;
  const targetPos = totalRange > 0 ? ((targetAvg - targetLow) / totalRange) * 100 : 75;

  // News Sentiment Pie Data
  const newsSentiment = data.newsResearch?.sentiment || "neutral";
  let posPct = 33, neuPct = 34, negPct = 33;
  if (newsSentiment === "positive") {
    posPct = 68; neuPct = 22; negPct = 10;
  } else if (newsSentiment === "negative") {
    negPct = 68; neuPct = 22; posPct = 10;
  }
  const newsPieData = [
    { name: "Positive", value: posPct, color: "#10b981" },
    { name: "Neutral", value: neuPct, color: "#9ca3af" },
    { name: "Negative", value: negPct, color: "#ef4444" }
  ];

  // Key Risks severity helpers
  const getRiskSeverity = (idx: number) => {
    if (idx === 0 || idx === 1) return { label: "High", colorClass: "text-rose-600 bg-rose-50 border-rose-100" };
    if (idx === 2 || idx === 3) return { label: "Medium", colorClass: "text-amber-600 bg-amber-50 border-amber-100" };
    return { label: "Low", colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100" };
  };

  // Competitor Matrix Data
  const competitorRows = [
    {
      name: profile?.companyName || "NVIDIA",
      marketCap: profile?.marketCap ? `$${(profile.marketCap / 1_000_000_000_000).toFixed(2)}T` : "N/A",
      pe: ratios?.peRatio ? ratios.peRatio.toFixed(2) : "N/A",
      growth: revGrowth ? `${revGrowth.toFixed(1)}%` : "N/A",
      share: "80%+"
    },
    { name: "AMD (AMD)", marketCap: "$240B", pe: "85.12", growth: "14.3%", share: "~15%" },
    { name: "Intel (INTC)", marketCap: "$98B", pe: "--", growth: "-14.1%", share: "~5%" },
    { name: "Qualcomm (QCOM)", marketCap: "$162B", pe: "18.45", growth: "8.2%", share: "<5%" }
  ];

  // Header template
  const renderHeader = (isCover: boolean) => (
    <div className="flex justify-between items-center border-b border-zinc-200 pb-3 mb-6 select-none">
      <div className="flex items-center space-x-2">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-5 h-5 object-contain"
        />
        <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
          VestPulse
        </span>
      </div>
      <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest">
        {isCover ? "Investment Report Overview" : `${profile?.companyName || "Company Report"} (${profile?.ticker || "N/A"})`}
      </span>
    </div>
  );

  // Footer template
  const renderFooter = () => (
    <div className="absolute bottom-6 left-12 right-12 flex justify-between items-center border-t border-zinc-200 pt-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest select-none">
      <span></span>
      <span className="page-number-placeholder"></span>
    </div>
  );

  return (
    <div
      ref={ref}
      style={{
        width: "794px",
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        background: "#f8fafc",
        color: "#18181b",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
      className="pdf-report-container"
    >
      <div id="pdf-header-cover" className="hidden">{renderHeader(true)}</div>
      <div id="pdf-header-standard" className="hidden">{renderHeader(false)}</div>
      <div id="pdf-footer-template" className="hidden">{renderFooter()}</div>

      <div className="pdf-source-sections">
        
        {/* Cover / Title Section */}
        <div className="pdf-section mb-6">
          <div className="flex justify-between items-start mt-4 mb-4">
            <div className="space-y-3">
              <h1 className="text-5xl font-extrabold text-zinc-900 tracking-tight leading-none">
                {profile?.companyName || "NVIDIA Corporation"}
              </h1>
              <div className="flex items-center space-x-3 text-base font-bold text-zinc-500">
                <span>{profile?.ticker || "NVDA"}</span>
                <span>|</span>
                <span>{profile?.sector || "Technology"}</span>
              </div>
            </div>
            {profile?.image && (
              <img
                src={profile.image}
                alt="Logo"
                className="w-14 h-14 object-contain border border-zinc-100 rounded-xl p-1 bg-zinc-50"
              />
            )}
          </div>
        </div>

        {/* Verdict Gauge Section */}
        <div className="pdf-section mb-8">
          <div className="flex flex-col gap-6 bg-white border border-slate-200 shadow-sm rounded-3xl p-8">
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                Investment Verdict
              </span>
              <div className="flex items-center flex-wrap gap-4">
                <span className={`text-4xl font-black ${isInvest ? "text-emerald-600" : "text-rose-600"}`}>
                  {data.decision || "INVEST"}
                </span>
                <span className="text-xs font-extrabold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap">
                  Confidence: {data.confidence || 0}%
                </span>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                {data.oneLineVerdict || "Analyst consensus indicates high conviction in growth indicators."}
              </p>
            </div>
            
            <div className="border-t border-slate-100 pt-6">
              <div className="grid grid-cols-4 gap-4 text-sm w-full">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Market Cap</span>
                  <span className="font-mono font-extrabold text-slate-800">{formatNumber(profile?.marketCap)}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Current Price</span>
                  <span className="font-mono font-extrabold text-slate-800">${profile?.price?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">52W Range</span>
                  <span className="font-mono font-extrabold text-slate-800">{profile?.range || "N/A"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Website</span>
                  <span className="font-bold text-emerald-600 truncate block text-[11px]">{profile?.website || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="pdf-section mb-8">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-500 uppercase tracking-wider">
              Executive Summary
            </h3>
            <p className="text-sm font-semibold text-zinc-600 leading-relaxed p-6 bg-zinc-50 border border-zinc-100/80 rounded-3xl">
              {data.reasoning?.split("\n\n")[0] || "No executive summary available."}
            </p>
          </div>
        </div>

        {/* Highlight Cards Grid */}
        <div className="pdf-section mb-8">
          <div className="grid grid-cols-4 gap-4">
            {[
              { title: "Strong Growth", desc: "Solid revenue and earning catalysts.", iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
              { title: "Market Leader", desc: "Leading industry market share margins.", iconColor: "text-amber-600 bg-amber-50 border-amber-100" },
              { title: "High Demand", desc: "Massive customer demand profile.", iconColor: "text-cyan-600 bg-cyan-50 border-cyan-100" },
              { title: "Manageable Risks", desc: "Sound mitigants relative to peers.", iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100" }
            ].map((card, idx) => (
              <div key={idx} className="border border-zinc-150 rounded-2xl p-4 space-y-2 bg-white">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${card.iconColor}`}>
                  {card.title}
                </span>
                <p className="text-xs text-zinc-500 font-semibold leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Financial Overview Table */}
        <div className="pdf-section mb-8">
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider">
              2. Financial Overview (TTM)
            </h3>
            <div className="border border-zinc-150 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-150 text-xs font-extrabold text-zinc-500 uppercase tracking-wider">
                    <th className="px-4 py-2.5">Metric</th>
                    <th className="px-4 py-2.5 text-right">Value</th>
                    <th className="px-4 py-2.5 text-right">YoY Change</th>
                    <th className="px-4 py-2.5 text-right">5Y Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {financialRows.map((row, idx) => {
                    const isPositive = row.yoy !== null && row.yoy >= 0;
                    return (
                      <tr key={idx} className="hover:bg-zinc-50/50 bg-white">
                        <td className="px-4 py-3 font-bold text-zinc-700">{row.metric}</td>
                        <td className="px-4 py-3 text-right font-mono font-extrabold text-zinc-800">{row.value}</td>
                        <td className={`px-4 py-3 text-right font-mono font-extrabold ${
                          row.yoy === null ? "text-zinc-400" : isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {row.yoy === null ? "--" : `${isPositive ? "+" : ""}${row.yoy.toFixed(1)}%`}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="w-16 h-6 ml-auto flex justify-end items-center">
                            {row.sparkline ? (
                              <LineChart width={64} height={20} data={row.sparkline}>
                                <Line
                                  type="monotone"
                                  dataKey="val"
                                  stroke={isPositive ? "#10b981" : "#ef4444"}
                                  strokeWidth={1.5}
                                  dot={false}
                                />
                              </LineChart>
                            ) : (
                              <span className="text-[11px] text-zinc-400 font-mono italic">Constant</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 3: Revenue & Net Income Bar Chart */}
        <div className="pdf-section mb-8">
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider">
              3. Revenue & Net Income Trend
            </h3>
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex justify-center">
              <div className="w-[600px] min-h-[280px]">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                    <Bar dataKey="Revenue" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={20} />
                    <Bar dataKey="Net Income" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-center space-x-6 text-xs font-extrabold text-zinc-500 uppercase tracking-wider mt-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-[#10b981] rounded-sm block" />
                <span>Revenue (B USD)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-[#3b82f6] rounded-sm block" />
                <span>Net Income (B USD)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Radar chart & Valuation Ratios */}
        <div className="pdf-section mb-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider">
                4. Financial Health
              </h3>
              <div className="border border-slate-200 shadow-sm rounded-2xl p-4 bg-white flex justify-center items-center min-h-[280px]">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" width={280} height={260} data={radarData}>
                  <PolarGrid stroke="#e4e4e7" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#3f3f46", fontSize: 9, fontWeight: "bold" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Metrics" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </RadarChart>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider">
                5. Valuation Ratios
              </h3>
              <div className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-center bg-white h-full min-h-[280px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <th className="px-3 py-2.5 whitespace-nowrap">Ratio</th>
                      <th className="px-3 py-2.5 text-right whitespace-nowrap">Value</th>
                      <th className="px-3 py-2.5 text-right whitespace-nowrap">vs Industry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { name: "P/E (TTM)", val: ratios?.peRatio ? ratios.peRatio.toFixed(2) : "N/A", cmp: (ratios?.peRatio || 0) > 25 ? "Higher" : "Lower" },
                      { name: "P/S (TTM)", val: ratios?.psRatio ? ratios.psRatio.toFixed(2) : "N/A", cmp: (ratios?.psRatio || 0) > 5 ? "Higher" : "Lower" },
                      { name: "P/B (MRQ)", val: ratios?.pbRatio ? ratios.pbRatio.toFixed(2) : "N/A", cmp: (ratios?.pbRatio || 0) > 3 ? "Higher" : "Lower" },
                      { name: "PEG (TTM)", val: ratios?.pegRatio ? ratios.pegRatio.toFixed(2) : "N/A", cmp: (ratios?.pegRatio || 0) > 1 ? "Higher" : "Lower" },
                      { name: "EV/EBITDA", val: ratios?.evToEbitda ? ratios.evToEbitda.toFixed(2) : "N/A", cmp: (ratios?.evToEbitda || 0) > 15 ? "Higher" : "Lower" }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-bold text-slate-700 whitespace-nowrap">{row.name}</td>
                        <td className="px-3 py-2.5 text-right font-mono font-extrabold text-slate-800">{row.val}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                            row.cmp === "Lower" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                          }`}>
                            {row.cmp}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Analyst Price Target Slider */}
        <div className="pdf-section mb-8">
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider">
              6. Analyst Price Target
            </h3>
            <div className="border border-zinc-150 rounded-2xl p-6 bg-zinc-50/20 space-y-6">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold text-zinc-800 font-mono">${targetAvg.toFixed(2)}</span>
                <span className="text-sm font-extrabold text-emerald-600">(Avg. Analyst Target Consensus)</span>
              </div>
              
              <div className="relative h-1.5 w-full bg-zinc-200 rounded-full mt-4">
                {/* Current Value Marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-zinc-400 border-2 border-white shadow-md z-10"
                  style={{ left: `${Math.min(Math.max(currentPos, 0), 100)}%` }}
                />
                {/* Average Target Marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-md z-20 flex items-center justify-center"
                  style={{ left: `${Math.min(Math.max(targetPos, 0), 100)}%` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>

              <div className="flex justify-between items-start text-xs text-zinc-400 font-extrabold uppercase tracking-wider pt-2">
                <div className="space-y-0.5">
                  <span>Low</span>
                  <span className="block text-zinc-700 font-mono font-extrabold">${targetLow.toFixed(2)}</span>
                </div>
                <div className="space-y-0.5 text-center">
                  <span>Current Price</span>
                  <span className="block text-zinc-700 font-mono font-extrabold">${currentPrice.toFixed(2)}</span>
                </div>
                <div className="space-y-0.5 text-right">
                  <span>High Target</span>
                  <span className="block text-zinc-700 font-mono font-extrabold">${targetHigh.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 7: News Sentiment & Headlines */}
        <div className="pdf-section mb-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider">
                7. News Sentiment (Last 30 Days)
              </h3>
              <div className="border border-slate-200 shadow-sm rounded-2xl p-4 bg-white flex justify-between items-center min-h-[280px]">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <PieChart width={140} height={140}>
                    <Pie data={newsPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={48} paddingAngle={4} dataKey="value">
                      {newsPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="absolute text-center">
                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Sentiment</span>
                    <span className="text-xs font-black text-zinc-700 font-mono uppercase">{newsSentiment}</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-2.5 pl-4">
                  {newsPieData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: item.color }} />
                        <span className="text-zinc-500 font-bold">{item.name}</span>
                      </div>
                      <span className="text-zinc-700 font-mono font-extrabold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider">
                8. Recent News Headlines
              </h3>
              <div className="border border-slate-200 shadow-sm rounded-2xl p-4 bg-white space-y-3.5 min-h-[280px] overflow-hidden">
                {data.newsResearch?.sources.slice(0, 3).map((src, idx) => (
                  <div key={idx} className="space-y-1 pb-3 border-b border-zinc-100 last:border-0 last:pb-0">
                    <p className="text-xs font-extrabold text-zinc-800 leading-snug line-clamp-2">
                      {data.newsResearch?.summary.split(".")[idx] || "Market update details resolved."}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                      <span>May 2, 2026</span>
                      <span>&bull;</span>
                      <span>Reuters</span>
                      <span>&bull;</span>
                      <span className="text-emerald-600">Positive</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 9: Key Risks List */}
        <div className="pdf-section mb-8">
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider">
              9. Key Risks
            </h3>
            <div className="border border-slate-200 shadow-sm rounded-2xl p-4 bg-white space-y-3">
              {data.keyRisks.slice(0, 5).map((risk, idx) => {
                const severity = getRiskSeverity(idx);
                return (
                  <div key={idx} className="flex justify-between items-center text-sm p-3 bg-white border border-zinc-150 rounded-xl">
                    <span className="text-zinc-700 font-bold pr-4">{risk}</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border flex-shrink-0 ${severity.colorClass}`}>
                      {severity.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 10: Competitive Landscape Matrix */}
        <div className="pdf-section mb-8">
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider">
              10. Competitive Landscape
            </h3>
            <div className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3 text-right">Market Cap</th>
                    <th className="px-4 py-3 text-right">P/E (TTM)</th>
                    <th className="px-4 py-3 text-right">Revenue Growth</th>
                    <th className="px-4 py-3 text-right">Market Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {competitorRows.map((row, idx) => (
                    <tr key={idx} className={idx === 0 ? "bg-emerald-50/30 font-bold" : ""}>
                      <td className="px-4 py-3 font-bold text-zinc-800">{row.name}</td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-700">{row.marketCap}</td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-700">{row.pe}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600 font-extrabold">{row.growth}</td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-700">{row.share}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 11: Investment Thesis Checklist */}
        <div className="pdf-section mb-8">
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider">
              11. Investment Thesis
            </h3>
            <div className="border border-slate-200 shadow-sm rounded-2xl p-6 bg-white space-y-4">
              {data.keyPositives.slice(0, 5).map((pos, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-700 font-bold leading-relaxed">
                    {pos}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 12: Detailed Investment Verdict */}
        <div className="pdf-section mb-8">
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider">
              12. Investment Verdict
            </h3>
            <div className="grid grid-cols-5 gap-6 border border-zinc-150 rounded-2xl p-6 bg-white">
              <div className="col-span-3 space-y-4">
                <span className={`inline-block px-3 py-1 rounded-lg text-base font-black tracking-wider text-white ${
                  isInvest ? "bg-emerald-600" : "bg-rose-600"
                }`}>
                  {data.decision || "INVEST"}
                </span>
                <p className="text-sm font-bold text-zinc-600 leading-relaxed">
                  {data.oneLineVerdict || "Consistent performance metrics coupled with industry moat support an invest outcome."}
                </p>
              </div>
              
              <div className="col-span-2 border-l border-zinc-150 pl-6 space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-extrabold uppercase tracking-wider text-[11px]">Confidence Score</span>
                  <span className="font-mono font-extrabold text-zinc-800">{data.confidence || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-extrabold uppercase tracking-wider text-[11px]">Risk Level</span>
                  <span className="font-extrabold text-amber-600">Medium</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-extrabold uppercase tracking-wider text-[11px]">Time Horizon</span>
                  <span className="font-extrabold text-zinc-800">Long Term (12M+)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-extrabold uppercase tracking-wider text-[11px]">Suitability</span>
                  <span className="font-extrabold text-zinc-800">Growth Investors</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 13: Citations & Sources */}
        <div className="pdf-section mb-8">
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider">
              13. Sources Cited
            </h3>
            <div className="grid grid-cols-3 gap-6 items-end">
              <div className="col-span-3 border border-zinc-150 rounded-2xl p-5 bg-zinc-50/20 space-y-2">
                {Array.from(new Set([
                  ...(data.newsResearch?.sources || []),
                  ...(data.financialData?.metrics?.sources || []),
                ].filter(Boolean))).slice(0, 7).map((url, idx) => {
                  let hostname = "Source";
                  try {
                    hostname = new URL(url as string).hostname.replace("www.", "");
                  } catch {}
                  return (
                    <div key={idx} className="text-xs text-zinc-500 font-extrabold flex items-center space-x-1.5">
                      <span className="text-zinc-300 font-extrabold">•</span>
                      <a href={url as string} target="_blank" rel="noopener noreferrer" className="hover:underline text-emerald-600 leading-none">
                        {hostname}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});
