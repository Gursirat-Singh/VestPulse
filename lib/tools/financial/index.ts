import { FmpProvider } from "./providers/fmp";
import { YahooProvider } from "./providers/yahoo";
import { FinnhubProvider } from "./providers/finnhub";
import { mergeFinancialMetrics, calculateCompletenessScore, CompletenessReport } from "./merge";
import { FinancialData, FinancialOrchestratorResult } from "../../../types";

const fmp = new FmpProvider();
const yahoo = new YahooProvider();
const finnhub = new FinnhubProvider();

const ALL_19_FIELDS = [
  "Company Name", "Ticker", "Market Cap", "Current Price", "Sector", "Industry", 
  "Description", "Employee Count", "52 Week Low", "52 Week High", "PE Ratio", 
  "ROE", "Cash", "Debt", "Revenue", "Net Income", "Operating Income", "EPS", "Profit Margin"
];

function getSafeEmptyFinancials(ticker: string): FinancialData {
  return {
    profile: {
      companyName: "",
      ticker,
      price: 0,
      marketCap: 0,
      range: "N/A",
      beta: 0,
      sector: "",
      industry: "",
      image: "",
      website: "",
      dividendYield: 0,
      description: ""
    },
    historical: [],
    ratios: {
      peRatio: 0,
      psRatio: 0,
      pbRatio: 0,
      pegRatio: 0,
      evToEbitda: 0,
      grossMargin: 0,
      roe: 0,
      debtToEquity: 0,
      currentRatio: 0
    },
    estimates: {
      targetLow: 0,
      targetAvg: 0,
      targetHigh: 0,
      epsAvg: 0
    },
    metrics: {},
    sources: []
  };
}

export async function fetchAggregatedFinancialData(ticker: string): Promise<FinancialOrchestratorResult> {
  const cleanTicker = ticker.trim().toUpperCase();

  try {
    // 1. Concurrent Fetch primary providers: FMP and Yahoo Finance
    const [fmpResult, yahooResult] = await Promise.allSettled([
      fmp.fetchData(cleanTicker),
      yahoo.fetchData(cleanTicker)
    ]);

    let fmpData: Partial<FinancialData> | null = null;
    let yahooData: Partial<FinancialData> | null = null;

    if (fmpResult.status === "fulfilled" && fmpResult.value) {
      fmpData = fmpResult.value;
    }
    if (yahooResult.status === "fulfilled" && yahooResult.value) {
      yahooData = yahooResult.value;
    }

    // 2. Initial Merge & Quality Check
    let mergedData = mergeFinancialMetrics(fmpData, yahooData);
    let completenessReport = calculateCompletenessScore(mergedData);

    const providersUsed: string[] = [];
    if (fmpData) providersUsed.push("FMP");
    if (yahooData) providersUsed.push("Yahoo Finance");

    let finnhubData: Partial<FinancialData> | null = null;

    // 3. Smart Retry logic: Fetch Finnhub if completeness score is below 80%
    if (completenessReport.score < 80 && process.env.FINNHUB_API_KEY) {
      console.log(`Aggregator: Completeness (${completenessReport.score}%) < 80% for ${cleanTicker}. Attempting Smart Retry via Finnhub...`);
      try {
        finnhubData = await finnhub.fetchData(cleanTicker);
        if (finnhubData) {
          providersUsed.push("Finnhub");
          // Merge with Finnhub as tertiary source
          mergedData = mergeFinancialMetrics(fmpData, yahooData, finnhubData);
          completenessReport = calculateCompletenessScore(mergedData);
        }
      } catch (fErr) {
        console.error(`Aggregator: Smart Retry via Finnhub failed for ${cleanTicker}`, fErr);
      }
    }

    // Individual coverages for logging
    const fmpScore = fmpData ? calculateCompletenessScore(mergeFinancialMetrics(fmpData)) : null;
    const yahooScore = yahooData ? calculateCompletenessScore(mergeFinancialMetrics(yahooData)) : null;
    const finnhubScore = finnhubData ? calculateCompletenessScore(mergeFinancialMetrics(finnhubData)) : null;

    // 4. Orchestrator Logging
    console.log(`\n==============================`);
    console.log(`Financial Orchestrator`);
    console.log(`==============================`);
    console.log(`Resolving: ${cleanTicker}`);
    if (fmpScore) {
      console.log(`FMP`);
      console.log(`Coverage ${fmpScore.score}%`);
      if (fmpScore.missingFields.length > 0) {
        console.log(`Missing: ${fmpScore.missingFields.slice(0, 6).join(", ")}${fmpScore.missingFields.length > 6 ? "..." : ""}`);
      }
    } else {
      console.log(`FMP: Coverage 0% (Unavailable)`);
    }

    if (yahooScore) {
      console.log(`Yahoo`);
      console.log(`Coverage ${yahooScore.score}%`);
      if (fmpScore) {
        const filledByYahoo = fmpScore.missingFields.filter(f => !yahooScore.missingFields.includes(f));
        if (filledByYahoo.length > 0) {
          console.log(`Filled: ${filledByYahoo.slice(0, 6).join(", ")}${filledByYahoo.length > 6 ? "..." : ""}`);
        }
      }
    } else {
      console.log(`Yahoo: Coverage 0% (Unavailable)`);
    }

    if (finnhubScore) {
      console.log(`Finnhub`);
      console.log(`Coverage ${finnhubScore.score}%`);
      if (fmpScore || yahooScore) {
        const prevMerged = mergeFinancialMetrics(fmpData, yahooData);
        const prevScore = calculateCompletenessScore(prevMerged);
        const filledByFinnhub = prevScore.missingFields.filter(f => !finnhubScore.missingFields.includes(f));
        if (filledByFinnhub.length > 0) {
          console.log(`Filled: ${filledByFinnhub.join(", ")}`);
        }
      }
    }

    console.log(`Merged Coverage`);
    console.log(`${completenessReport.score}%`);
    console.log(`Final Provider Count`);
    console.log(`${providersUsed.length}`);
    console.log(`Research Continuing...`);
    console.log(`==============================\n`);

    return {
      metrics: mergedData,
      completeness: completenessReport.score,
      providersUsed,
      missingFields: completenessReport.missingFields
    };
  } catch (err) {
    console.error(`Orchestrator: Fatal error during financial data aggregation for ${cleanTicker}`, err);
    return {
      metrics: getSafeEmptyFinancials(cleanTicker),
      completeness: 0,
      providersUsed: [],
      missingFields: ALL_19_FIELDS
    };
  }
}
