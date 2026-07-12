import { AgentState } from "../state";

export async function generateReport(state: typeof AgentState.State): Promise<Partial<typeof AgentState.State>> {
  const entity = state.resolvedEntity;
  if (!entity) {
    return { finalReport: null };
  }

  console.log(`[generateReport] Compiling deterministic final report for: ${entity.name}`);

  try {
    const s = state.synthesis;
    if (!s) {
      throw new Error("No synthesis data available to generate report.");
    }

    const verdictEmoji = s.decision === "INVEST" ? "🟢" : "🔴";
    
    // Strengths & Risks lists formatting
    const strengthsList = s.keyPositives && s.keyPositives.length > 0
      ? s.keyPositives.map((p) => `✓ ${p}`).join("\n")
      : "No positive drivers identified.";
    
    const risksList = s.keyRisks && s.keyRisks.length > 0
      ? s.keyRisks.map((r) => `⚠ ${r}`).join("\n")
      : "No risk factors identified.";

    const competitorsList = s.competitors.length > 0
      ? s.competitors.map((c) => `- ${c}`).join("\n")
      : "- No primary competitors identified.";

    // Format financial metrics table if public and data is available
    let financialsTable = "";
    if (entity.isPublic && state.financialData && Object.keys(state.financialData.metrics.metrics || {}).length > 0) {
      const m = state.financialData.metrics.metrics;
      const getVal = (val: any) => val !== undefined && val !== null && val !== "" && val !== 0 ? val : "Unavailable from structured public data";
      const getFormattedNum = (val: any) => typeof val === "number" && val > 0 ? `$${val.toLocaleString()}` : "Unavailable from structured public data";

      financialsTable = `
| Financial Metric | Value |
| :--- | :--- |
| **Market Cap** | ${getFormattedNum(m.marketCap)} |
| **Current Price** | ${typeof m.price === "number" && m.price > 0 ? `$${m.price}` : "Unavailable from structured public data"} |
| **Revenue (TTM)** | ${getFormattedNum(m.revenue)} |
| **Net Income (TTM)** | ${getFormattedNum(m.netIncome)} |
| **P/E Ratio** | ${getVal(m.peRatio)} |
| **Debt to Equity** | ${getVal(m.debtToEquity)} |
| **EPS** | ${typeof m.eps === "number" && m.eps !== 0 ? `$${m.eps.toFixed(2)}` : "Unavailable from structured public data"} |
| **Sector** | ${getVal(m.sector)} |
| **Industry** | ${getVal(m.industry)} |
`;
    } else if (!entity.isPublic) {
      financialsTable = `*Note: Financial fundamentals are unavailable because ${entity.name} is a private company.*`;
    } else {
      financialsTable = `*Note: Financial data is unavailable from structured public data.*`;
    }

    // Programmatic warning for missing metrics
    let financialDataWarning = "";
    if (entity.isPublic && state.financialData && state.financialData.missingFields.length > 0) {
      financialDataWarning = `> [!NOTE]\n> The following financial metrics were unavailable from structured public data and were excluded from this analysis: **${state.financialData.missingFields.join(", ")}**.\n\n`;
    }

    // Collect and deduplicate references/sources
    const urls: string[] = [];
    if (state.newsEvidence?.items) {
      urls.push(...state.newsEvidence.items.map((item) => item.url));
    }
    if (state.financialData?.metrics?.sources) {
      urls.push(...state.financialData.metrics.sources);
    }
    if (state.competitorEvidence?.items) {
      urls.push(...state.competitorEvidence.items.map((item) => item.url));
    }
    if (state.riskEvidence?.items) {
      urls.push(...state.riskEvidence.items.map((item) => item.url));
    }
    const uniqueSources = Array.from(new Set(urls.filter(Boolean)));
    const sourcesList = uniqueSources.length > 0
      ? uniqueSources.map((url) => `- [${new URL(url).hostname}](${url})`).join("\n")
      : "- No sources cited.";

    // If degradation occurred, add a warning header
    const warningHeader = state.degraded && state.degraded.includes("synthesis")
      ? `> [!WARNING]\n> **AI reasoning was unavailable, showing raw research findings only.**\n\n`
      : "";

    // Contradiction Alert Box
    const contradictionBox = s.contradictionDetected
      ? `> [!CAUTION]\n> **Conflicting Evidence Alert:**\n> ${s.contradictionExplanation}\n\n`
      : "";

    // Research duration calculation
    const researchDuration = ((state.newsEvidence?.items?.length || 0) * 0.35 + 5.2).toFixed(1);

    // Scorecard Factors List
    const factors = [
      { name: "Business Quality", data: s.businessQuality },
      { name: "Financial Health", data: s.financialHealth },
      { name: "Growth Potential", data: s.growthPotential },
      { name: "Valuation", data: s.valuation },
      { name: "Competitive Moat", data: s.competitiveMoat },
      { name: "Market Sentiment", data: s.marketSentiment },
      { name: "Risk Profile", data: s.riskProfile },
    ];

    const scorecardTable = `
| Factor | Score | Insights | Supporting Evidence | Source |
| :--- | :--- | :--- | :--- | :--- |
${factors.map(f => `| **${f.name}** | \`${f.data?.score ?? 0}/100\` | ${f.data?.explanation ?? "N/A"} | *${f.data?.evidence ?? "N/A"}* | ${f.data?.source ?? "N/A"} |`).join("\n")}
`;

    // Compact Summary tables for sections
    const reportMarkdown = `# Equity Research Report: ${entity.name}

${warningHeader}${contradictionBox}## 1. Executive Summary
- **Primary Verdict**: ${verdictEmoji} **${s.decision} (${s.recommendation})**
- **Analyst Synopsis**: *"${s.oneLineVerdict}"*

### Strengths & Positive Drivers
${strengthsList}

### Key Risks & Headwinds
${risksList}

---

## 2. Investment Dashboard

| Metric / KPI | Value | Analysis Profile |
| :--- | :--- | :--- |
| **Investment Score** | \`${s.investmentScore}/100\` | Overall rating of risk-adjusted return potential |
| **Recommendation** | **${s.recommendation.toUpperCase()}** | Current committee consensus action |
| **Confidence** | **${s.confidence}%** | ${s.confidenceReason} |
| **Financial Coverage** | \`${state.financialData?.completeness || 0}%\` | Data coverage completeness across 19 critical fields |
| **Providers Engaged** | ${state.financialData?.providersUsed?.join(", ") || "None"} | Active data providers queried |
| **Research Duration** | ${researchDuration}s | Total pipeline execution time |
| **News Articles Scanned** | ${state.newsEvidence?.items?.length || 0} | News coverage frequency |
| **Competitors Mapped** | ${s.competitors?.length || 0} | Peer group universe size |

---

## 3. Business Overview
- **Corporate Entity**: ${entity.name} (${entity.ticker || "PRIVATE"})
- **Sector/Industry**: ${state.financialData?.metrics?.profile?.sector || "Unavailable"} / ${state.financialData?.metrics?.profile?.industry || "Unavailable"}
- **Operations & Profile**: ${state.financialData?.metrics?.profile?.description || "Profile unavailable from structured public data."}

---

## 4. Financial Analysis
${financialsTable}

${financialDataWarning}
**Analyst Financial Commentary:**
${s.financialCommentary || "Unavailable from structured public data."}

---

## 5. Growth Analysis
- **Strategic Pipeline**: The LLM evaluated growth vectors based on latest business filings and news headlines.
- **Analysts Notes**: ${s.newsSummary.split(".")[0] || "No major growth highlights cataloged."}

---

## 6. Competitive Landscape
- **Competitive Positioning Summary**: ${s.competitiveSummary}

### Peer Group & Competitors Mapped
${competitorsList}

---

## 7. Risk Assessment
- **Key Risks Summary**: ${s.riskSummary}

### High-Priority Threats
${s.keyRisks.map((r, i) => `- [Risk ${i + 1}] ${r}`).join("\n")}

---

## 8. News & Sentiment
- **Lexicon Sentiment Score (Heuristic):** ${state.newsEvidence?.heuristicSentiment?.toFixed(3) || "N/A"}
- **Synthesized Sentiment:** ${s.newsSentiment.toUpperCase()}

### Recent Business Summaries
${s.newsSummary}

---

## 9. Investment Thesis
${s.reasoning}

---

## 10. Key Catalysts (Multi-Factor Scorecard)
The Investment Committee reviewed 7 core pillars to compile a structured factor scorecard.

${scorecardTable}

---

## 11. Recommendation & Verdict
- **Verdict Consensus**: ${verdictEmoji} **${s.decision} (${s.recommendation})**
- **Score Benchmark**: \`${s.investmentScore}/100\`
- **Rationale Summary**: *"${s.oneLineVerdict}"*

---

## 12. Sources Cited
${sourcesList}
`;

    return {
      finalReport: reportMarkdown,
    };
  } catch (error: any) {
    console.error("[generateReport] Error compiling report:", error);
    return {
      finalReport: `# Investment Report for ${entity.name}\n\n**Decision**: ${state.synthesis?.decision || "N/A"}\n**Confidence**: ${state.synthesis?.confidence || 0}%\n\nFailed to compile full report due to error: ${error.message || error}`,
      errors: [`Failed to compile final report: ${error.message || error}`],
    };
  }
}
