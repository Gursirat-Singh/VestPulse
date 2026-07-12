import { AgentState } from "../state";
import { fetchAggregatedFinancialData } from "../../tools/financial";
import { withRetry } from "../../retry";
import { cached } from "../../cache/redis";
import { FinancialOrchestratorResult, FinancialData } from "../../../types";

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

export async function gatherFinancials(state: typeof AgentState.State): Promise<Partial<typeof AgentState.State>> {
  const entity = state.resolvedEntity;
  if (!entity) {
    return { financialData: null };
  }

  console.log(`[gatherFinancials] Gathering financials for: ${entity.name}`);

  // Case 1: Private company
  if (!entity.isPublic) {
    console.log(`[gatherFinancials] ${entity.name} is private. Skipping financials.`);
    return {
      financialData: {
        metrics: getSafeEmptyFinancials(entity.name),
        completeness: 0,
        providersUsed: [],
        missingFields: [],
      },
    };
  }

  // Case 2: Public company (fetch and cache from aggregator)
  if (entity.ticker) {
    const ticker = entity.ticker.toUpperCase().trim();
    const cacheKey = `financials_v3:${ticker.toLowerCase()}`;
    const TTL_24_HOURS = 24 * 3600;

    try {
      const financialData: FinancialOrchestratorResult = await cached(cacheKey, TTL_24_HOURS, async () => {
        const data = await withRetry(() => fetchAggregatedFinancialData(ticker), {
          retries: 2,
          baseDelayMs: 200,
        });

        if (!data) {
          return {
            metrics: getSafeEmptyFinancials(ticker),
            completeness: 0,
            providersUsed: [],
            missingFields: ALL_19_FIELDS
          };
        }

        return data;
      });

      return {
        financialData,
      };

    } catch (error: any) {
      console.error(`[gatherFinancials] Error fetching aggregated financials for ${ticker}:`, error);
      return {
        financialData: {
          metrics: getSafeEmptyFinancials(ticker),
          completeness: 0,
          providersUsed: [],
          missingFields: ALL_19_FIELDS
        },
        degraded: [`Failed to gather financial metrics for ${ticker}: ${error.message || error}`],
      };
    }
  }

  return {
    financialData: {
      metrics: getSafeEmptyFinancials(entity.name),
      completeness: 0,
      providersUsed: [],
      missingFields: ALL_19_FIELDS
    },
  };
}
