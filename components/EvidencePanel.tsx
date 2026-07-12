"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  NewsResearch, 
  FinancialOrchestratorResult, 
  CompetitiveLandscape, 
  RiskFactors 
} from "../types";
import { ChevronRight, ExternalLink, Activity, DollarSign, Users, ShieldAlert, Link2 } from "lucide-react";

interface EvidencePanelProps {
  keyPositives: string[];
  keyRisks: string[];
  reasoning: string | null;
  newsResearch: NewsResearch | null;
  financialData: FinancialOrchestratorResult | null;
  competitiveLandscape: CompetitiveLandscape | null;
  riskFactors: RiskFactors | null;
}

export function EvidencePanel({
  keyPositives,
  keyRisks,
  reasoning,
  newsResearch,
  financialData,
  competitiveLandscape,
  riskFactors,
}: EvidencePanelProps) {
  // Extract all unique sources
  const allSourcesSet = new Set<string>();
  [
    ...(newsResearch?.sources || []),
    ...(financialData?.metrics?.sources || []),
    ...(competitiveLandscape?.sources || []),
    ...(riskFactors?.sources || []),
  ].forEach((url) => {
    if (url && url.startsWith("http")) allSourcesSet.add(url);
  });
  const allSources = Array.from(allSourcesSet);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        {/* SUMMARY TAB */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Decision Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {reasoning && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-zinc-400">Analyst Reasoning</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{reasoning}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/[0.06]">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-emerald-400 flex items-center space-x-1.5">
                    <span>Key Supporting Points</span>
                  </h4>
                  <ul className="space-y-2">
                    {keyPositives.map((pos, idx) => (
                      <li key={idx} className="flex items-start text-sm text-zinc-300">
                        <ChevronRight className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{pos}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-rose-400 flex items-center space-x-1.5">
                    <span>Core Vulnerabilities</span>
                  </h4>
                  <ul className="space-y-2">
                    {keyRisks.map((risk, idx) => (
                      <li key={idx} className="flex items-start text-sm text-zinc-300">
                        <ChevronRight className="h-4 w-4 text-rose-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FINANCIALS TAB */}
        <TabsContent value="financials">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                <span>Financial Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {financialData ? (
                <>
                  <p className="text-sm text-zinc-300 leading-relaxed">{financialData.metrics.summary}</p>
                  
                  {Object.keys(financialData.metrics.metrics).length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900/30">
                      <table className="w-full text-left text-sm text-zinc-300">
                        <thead className="bg-zinc-900/80 text-xs font-semibold text-zinc-400 uppercase">
                          <tr>
                            <th className="px-4 py-3">Metric</th>
                            <th className="px-4 py-3 text-right">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {Object.entries(financialData.metrics.metrics).map(([key, val]) => (
                            <tr key={key} className="hover:bg-zinc-800/20">
                              <td className="px-4 py-3 font-medium capitalize">
                                {key.replace(/([A-Z])/g, " $1")}
                              </td>
                              <td className="px-4 py-3 text-right font-mono">
                                {typeof val === "number" 
                                  ? val >= 1_000_000_000
                                    ? `$${(val / 1_000_000_000).toFixed(2)}B`
                                    : val >= 1_000_000
                                    ? `$${(val / 1_000_000).toFixed(2)}M`
                                    : val.toLocaleString()
                                  : val}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-500 italic p-4 rounded-xl bg-zinc-900/40 border border-white/[0.04]">
                      Detailed metrics profile unavailable for private or unlisted entity.
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-zinc-400 italic">No financials details gathered.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEWS TAB */}
        <TabsContent value="news">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-teal-400" />
                <span>News & Business Sentiment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {newsResearch ? (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-zinc-400">Calculated Sentiment:</span>
                    <Badge
                      variant={
                        newsResearch.sentiment === "positive"
                          ? "success"
                          : newsResearch.sentiment === "negative"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {newsResearch.sentiment.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{newsResearch.summary}</p>
                </>
              ) : (
                <p className="text-sm text-zinc-400 italic">No news summary gathered.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPETITORS TAB */}
        <TabsContent value="competitors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-cyan-400" />
                <span>Competitive Landscape</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {competitiveLandscape ? (
                <>
                  <p className="text-sm text-zinc-300 leading-relaxed">{competitiveLandscape.summary}</p>
                  
                  {competitiveLandscape.competitors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-zinc-400">Primary Competitors & Rivals:</h4>
                      <div className="flex flex-wrap gap-2">
                        {competitiveLandscape.competitors.map((comp, idx) => (
                          <Badge key={idx} variant="outline" className="bg-zinc-900 border-white/[0.08]">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-zinc-400 italic">No competitor analysis gathered.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RISKS TAB */}
        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <span>Risk & Headwinds Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {riskFactors ? (
                <>
                  <p className="text-sm text-zinc-300 leading-relaxed">{riskFactors.summary}</p>
                  
                  {riskFactors.risks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-zinc-400">Primary Risks:</h4>
                      <ul className="space-y-1.5">
                        {riskFactors.risks.map((risk, idx) => (
                          <li key={idx} className="flex items-start text-sm text-zinc-300">
                            <span className="text-rose-500 mr-2">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-zinc-400 italic">No risks summary gathered.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOURCES TAB */}
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link2 className="h-5 w-5 text-zinc-400" />
                <span>Cited Sources</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allSources.length > 0 ? (
                <ul className="space-y-2.5">
                  {allSources.map((url, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-500 mr-2 flex-shrink-0" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 hover:underline break-all"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500 italic">No web citations or sources cited.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
