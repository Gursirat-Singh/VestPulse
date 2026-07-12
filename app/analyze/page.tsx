"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ResearchProgress } from "../../components/ResearchProgress";
import { TrendingUp, AlertTriangle, ArrowLeft, Menu, Share2 } from "lucide-react";
import { AgentStateData } from "../../types";
import Link from "next/link";
import { toast } from "sonner";

// Existing Components
import { HistoryDrawer } from "../../components/history/HistoryDrawer";
import { HistorySidebar } from "../../components/history/HistorySidebar";
import { PremiumSearchBar } from "../../components/ui/PremiumSearchBar";
import { EmptyState } from "../../components/ui/EmptyState";
import { ExportDropdown } from "../../components/export/ExportDropdown";
import { getHistory, saveHistoryItem, clearHistory, HistoryItem } from "../../lib/history";

// Bloomberg Dashboard Subcomponents
import { SidebarNav } from "../../components/dashboard/SidebarNav";
import { QuickStats } from "../../components/dashboard/QuickStats";
import { CompanyHeader } from "../../components/dashboard/CompanyHeader";
import { ExecutiveSummary } from "../../components/dashboard/ExecutiveSummary";
import { FinancialOverviewTable } from "../../components/dashboard/FinancialOverviewTable";
import { RevenueChart } from "../../components/dashboard/RevenueChart";
import { FinancialHealthRadar } from "../../components/dashboard/FinancialHealthRadar";
import { ValuationRatiosTable } from "../../components/dashboard/ValuationRatiosTable";
import { AnalystPriceTarget } from "../../components/dashboard/AnalystPriceTarget";
import { NewsSentimentChart } from "../../components/dashboard/NewsSentimentChart";
import { NewsHeadlines } from "../../components/dashboard/NewsHeadlines";
import { KeyRisks } from "../../components/dashboard/KeyRisks";
import { CompetitiveLandscapeTable } from "../../components/dashboard/CompetitiveLandscapeTable";
import { InvestmentThesis } from "../../components/dashboard/InvestmentThesis";
import { InnoPulseBottomBanner, InnoPulseStartupCard, InnoPulseIndianPublicCard } from "../../components/dashboard/InnoPulsePromo";

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const initialCompany = searchParams.get("company") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentStateData | null>(null);

  // History & Sidebar Layout State
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("summary");
  
  const [reanalyzePrompt, setReanalyzePrompt] = useState<{
    companyName: string;
    savedData: AgentStateData;
  } | null>(null);

  // Ref for PDF Export
  const reportRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    setHistoryItems(getHistory());
  }, []);

  // Simple ScrollSpy to highlight correct left-sidebar section
  useEffect(() => {
    if (!result) return;

    const sections = ["summary", "financials", "news", "competitors", "risks", "valuation", "thesis"];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [result]);

  const startAnalysis = async (companyName: string, forceApi = false) => {
    if (!forceApi) {
      const existing = historyItems.find(
        (h) => h.companyName.toLowerCase() === companyName.toLowerCase() && h.agentData
      );
      if (existing && existing.agentData) {
        setReanalyzePrompt({
          companyName,
          savedData: existing.agentData
        });
        return;
      }
    }

    setIsLoading(true);
    setResult(null);
    setGlobalError(null);
    setActiveNode(null);
    setCompletedNodes([]);
    setMessages({});
    setErrors([]);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyName }),
      });

      if (!response.ok) {
        throw new Error(`API server returned an error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No response stream body available.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("event: ")) {
            currentEvent = trimmed.slice(7).trim();
          } else if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(5).trim();
            try {
              const parsed = JSON.parse(dataStr);

              if (currentEvent === "status") {
                const nodeName = parsed.node;
                setActiveNode(nodeName);
                
                setCompletedNodes((prev) => {
                  if (prev.includes(nodeName)) return prev;
                  return [...prev, nodeName];
                });
                
                setMessages((prev) => ({
                  ...prev,
                  [nodeName]: parsed.message,
                }));
              } else if (currentEvent === "result") {
                setResult(parsed);
                if (parsed.errors) {
                  setErrors(parsed.errors);
                }
                
                if (parsed.decision) {
                  const updated = saveHistoryItem({
                    companyName: parsed.companyName || companyName,
                    ticker: parsed.resolvedEntity?.ticker || "N/A",
                    decision: parsed.decision,
                    confidence: parsed.confidence,
                    agentData: parsed,
                  });
                  setHistoryItems(updated);
                }
              } else if (currentEvent === "error") {
                setGlobalError(parsed.message);
              }
            } catch (jsonErr) {
              console.error("Error parsing SSE JSON data:", jsonErr);
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Research request failed:", err);
      setGlobalError(err.message || String(err));
    } finally {
      setIsLoading(false);
      setActiveNode(null);
    }
  };

  const lastFetchedCompany = useRef<string | null>(null);

  // Auto-start analysis if company query parameter exists
  useEffect(() => {
    if (initialCompany && lastFetchedCompany.current !== initialCompany) {
      lastFetchedCompany.current = initialCompany;
      startAnalysis(initialCompany);
    }
  }, [initialCompany]);

  const handleClearHistory = () => {
    clearHistory();
    setHistoryItems([]);
  };

  const handleShare = async () => {
    if (!result) return;
    try {
      const shareUrl = `${window.location.origin}/analyze?company=${encodeURIComponent(result.resolvedEntity?.name || result.companyName)}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard.");
    } catch (err) {
      toast.error("Failed to copy share link.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100 font-sans">
      {reanalyzePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-slate-100 mb-2">Previous Analysis Found</h3>
            <p className="text-slate-400 text-sm mb-6">
              You have already analyzed <span className="text-white font-semibold">{reanalyzePrompt.companyName}</span> recently. Do you want to fetch fresh data or view the saved analysis?
            </p>
            <div className="flex items-center space-x-3 justify-end">
              <button
                onClick={() => {
                  setResult(reanalyzePrompt.savedData);
                  setReanalyzePrompt(null);
                  setIsLoading(false);
                  setGlobalError(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm font-semibold"
              >
                Show Saved Data
              </button>
              <button
                onClick={() => {
                  const comp = reanalyzePrompt.companyName;
                  setReanalyzePrompt(null);
                  startAnalysis(comp, true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition-colors text-sm font-semibold shadow-md shadow-indigo-500/20"
              >
                Analyze Again
              </button>
            </div>
          </div>
        </div>
      )}
      {/* LEFT SIDEBAR (Bloomberg Nav + Quick Stats + Recent Searches) */}
      <aside className="hidden lg:flex w-80 border-r border-white/[0.04] bg-[#0A0B0D]/50 flex-col h-full overflow-hidden select-none">
        <div className="p-6 border-b border-white/[0.04] flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="VestPulse Logo"
            className="w-6 h-6 object-contain"
          />
          <span className="font-extrabold text-sm tracking-tight text-slate-200">
            VestPulse
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Section Quick Jump Menu */}
          {result && (
            <SidebarNav
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          )}

          {/* Quick Metrics Stats */}
          {result?.financialData?.metrics?.profile && (
            <QuickStats
              profile={result.financialData.metrics.profile}
              ratios={result.financialData.metrics.ratios}
            />
          )}

          {/* Recent Searches Panel */}
          <HistorySidebar
            items={historyItems}
            onSelect={startAnalysis}
            onClear={handleClearHistory}
          />
        </div>
      </aside>

      {/* Mobile Drawer wrapper */}
      <HistoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        items={historyItems}
        onSelect={startAnalysis}
        onClear={handleClearHistory}
      />

      {/* RIGHT SIDE MAIN DASHBOARD WRAPPER */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-[#060608] bg-grid-pattern">
        {/* Navigation Bar */}
        <header className="border-b border-white/[0.04] bg-[#0A0B0D]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {result && (
              <div className="flex items-center space-x-2.5">
                 <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  Share
                </button>
                <ExportDropdown
                  markdownContent={result.finalReport || ""}
                  reportRef={reportRef}
                  companyName={result.resolvedEntity?.name || result.companyName}
                  resultData={result}
                />
              </div>
            )}

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2.5 bg-[#13141a] border border-white/[0.04] rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dashboard Main Workspace Area */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 space-y-8 pb-24">
          
          {/* Search/Analysis Bar */}
          <div className="space-y-4">
            <PremiumSearchBar
              onSubmit={startAnalysis}
              disabled={isLoading}
              initialValue={initialCompany}
              recentItems={historyItems}
            />
          </div>

          {/* Stepper Node Progress */}
          {isLoading && (
            <div className="glass-panel p-6 rounded-3xl border border-white/[0.04] space-y-4 bg-gradient-to-br from-[#13141a] to-[#0D0E12] shadow-[0_0_80px_-20px_rgba(124,124,255,0.15)] relative overflow-hidden group">
              <ResearchProgress
                activeNode={activeNode}
                completedNodes={completedNodes}
                messages={messages}
                errors={errors}
              />
            </div>
          )}

          {/* API Global Execution Error Panel */}
          {globalError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-start space-x-3 text-rose-200">
              <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <span className="font-semibold block">Execution Failed</span>
                <p className="text-zinc-400">{globalError}</p>
              </div>
            </div>
          )}

          {/* Empty State Welcome */}
          {!result && !isLoading && !globalError && (
            <EmptyState />
          )}

          {/* Missing Entity Error */}
          {result && !isLoading && !result.resolvedEntity && !globalError && (
            <div className="flex flex-col items-center justify-center p-12 mt-8 bg-rose-500/5 border border-rose-500/20 rounded-3xl space-y-4 shadow-lg shadow-rose-500/5">
              <AlertTriangle className="h-10 w-10 text-rose-400" />
              <h3 className="text-xl font-bold text-slate-100">Company could not be identified.</h3>
              <p className="text-slate-400 text-sm text-center">Please search using a valid company name or stock ticker.</p>
            </div>
          )}

          {/* Bloomberg Grid Dashboard */}
          {result && result.resolvedEntity && (
            <div ref={reportRef} className="space-y-8 animate-fade-in bg-zinc-950/20 p-2 rounded-3xl">
              
              {/* Header Info Block */}
              <CompanyHeader
                profile={result.financialData?.metrics?.profile}
                decision={result.decision}
                confidence={result.confidence}
                timestamp={new Date().toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />

              {/* InnoPulse Smart Cards */}
              {!result.resolvedEntity?.isPublic && (
                <InnoPulseStartupCard companyName={result.resolvedEntity.name} />
              )}
              {result.resolvedEntity?.isPublic && (
                (result.resolvedEntity?.ticker?.endsWith('.NS') || 
                 result.resolvedEntity?.ticker?.endsWith('.BO') || 
                 result.resolvedEntity.name.toLowerCase().includes('zomato') || 
                 result.resolvedEntity.name.toLowerCase().includes('reliance') || 
                 result.resolvedEntity.name.toLowerCase().includes('paytm') || 
                 result.resolvedEntity.name.toLowerCase().includes('infosys') || 
                 result.resolvedEntity.name.toLowerCase().includes('tata')) && (
                  <InnoPulseIndianPublicCard companyName={result.resolvedEntity.name} />
                )
              )}

              {/* Highlights Cards (Executive Summary) */}
              <ExecutiveSummary
                keyPositives={result.keyPositives}
                keyRisks={result.keyRisks}
              />

              {/* Grid 1: Financial Overview & Trend */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div id="financials" className="scroll-mt-24 lg:col-span-3">
                  <FinancialOverviewTable
                    historical={result.financialData?.metrics?.historical}
                    ratios={result.financialData?.metrics?.ratios}
                    isPublic={result.resolvedEntity?.isPublic || false}
                    completeness={result.financialData?.completeness}
                    providersUsed={result.financialData?.providersUsed}
                    missingFields={result.financialData?.missingFields}
                  />
                </div>
                <div className="lg:col-span-2">
                  <RevenueChart
                    historical={result.financialData?.metrics?.historical}
                    isPublic={result.resolvedEntity?.isPublic || false}
                  />
                </div>
              </div>

              {/* Grid 2: Health Radar & Valuation Target */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <FinancialHealthRadar
                    ratios={result.financialData?.metrics?.ratios}
                    historical={result.financialData?.metrics?.historical}
                    isPublic={result.resolvedEntity?.isPublic || false}
                  />
                </div>
                <div className="md:col-span-2">
                  <ValuationRatiosTable
                    ratios={result.financialData?.metrics?.ratios}
                    isPublic={result.resolvedEntity?.isPublic || false}
                  />
                </div>
                <div className="md:col-span-1">
                  <AnalystPriceTarget
                    estimates={result.financialData?.metrics?.estimates}
                    currentPrice={result.financialData?.metrics?.profile?.price}
                    isPublic={result.resolvedEntity?.isPublic || false}
                  />
                </div>
              </div>

              {/* Grid 3: News, Sentiment, and Key Risks */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <NewsSentimentChart
                    sentiment={result.newsResearch?.sentiment || null}
                    heuristicSentiment={result.newsResearch?.sentiment === "positive" ? 0.8 : -0.5}
                  />
                </div>
                <div className="lg:col-span-2">
                  <NewsHeadlines
                    items={result.newsResearch?.sources.map((url, i) => ({
                      title: result.newsResearch?.summary.split(".")[i] || "Recent Business Update",
                      url,
                      publishedDate: "Recent",
                      snippet: "",
                    })) || []}
                  />
                </div>
                <div className="lg:col-span-1">
                  <KeyRisks
                    risks={result.keyRisks}
                  />
                </div>
              </div>

              {/* Grid 4: Competitive Standing & Investment Thesis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CompetitiveLandscapeTable
                  competitorsList={result.competitiveLandscape?.competitors || []}
                  profile={result.financialData?.metrics?.profile}
                  ratios={result.financialData?.metrics?.ratios}
                  historical={result.financialData?.metrics?.historical}
                  isPublic={result.resolvedEntity?.isPublic || false}
                />
                <InvestmentThesis
                  positives={result.keyPositives}
                />
              </div>

              {/* InnoPulse Bottom Banner */}
              <InnoPulseBottomBanner />

            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 text-center text-zinc-500">Loading analysis...</div>}>
      <AnalyzeContent />
    </Suspense>
  );
}
