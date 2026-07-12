import { FinancialProfile, HistoricalFinancial, ValuationRatios, AnalystEstimate, FinancialData } from "../../../../types";
import { FinancialProvider } from "./types";

export class FinnhubProvider implements FinancialProvider {
  name = "Finnhub";

  async fetchData(ticker: string): Promise<Partial<FinancialData> | null> {
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      console.warn("FinnhubProvider: Missing FINNHUB_API_KEY in environment");
      return null;
    }

    const cleanTicker = ticker.trim().toUpperCase();
    console.log(`\n========== FinnhubProvider Fetching Data (${cleanTicker}) ==========`);

    const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${cleanTicker}&token=${apiKey}`;
    const metricUrl = `https://finnhub.io/api/v1/stock/metric?symbol=${cleanTicker}&metric=all&token=${apiKey}`;
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${cleanTicker}&token=${apiKey}`;

    try {
      const [profileResult, metricResult, quoteResult] = await Promise.allSettled([
        fetch(profileUrl),
        fetch(metricUrl),
        fetch(quoteUrl)
      ]);

      let profileRaw: any = null;
      let metricRaw: any = null;
      let quoteRaw: any = null;

      const extractJson = async (res: PromiseSettledResult<Response>) => {
        if (res.status === "fulfilled" && res.value.ok) {
          const json = await res.value.json();
          if (json && Object.keys(json).length > 0) {
            return json;
          }
        }
        return null;
      };

      profileRaw = await extractJson(profileResult);
      metricRaw = await extractJson(metricResult);
      quoteRaw = await extractJson(quoteResult);

      if (!profileRaw && !metricRaw && !quoteRaw) {
        console.warn(`FinnhubProvider: No response data from Finnhub for ${cleanTicker}`);
        return null;
      }

      // 1. Map Profile
      const low = metricRaw?.metric?.["52WeekLow"];
      const high = metricRaw?.metric?.["52WeekHigh"];
      const range = (low !== undefined && high !== undefined) ? `${low}-${high}` : "N/A";

      // Finnhub returns market cap in millions, e.g., 30000.5 means $30,000,500,000. FMP/Yahoo return absolute.
      const rawCap = profileRaw?.marketCapitalization || metricRaw?.metric?.marketCapitalization || 0;
      const marketCap = rawCap ? Math.round(rawCap * 1000000) : 0;

      const profile: FinancialProfile = {
        companyName: profileRaw?.name || "",
        ticker: cleanTicker,
        price: quoteRaw?.c || 0,
        marketCap,
        range,
        beta: metricRaw?.metric?.beta || 0,
        sector: "", // Finnhub does not explicitly separate sector and industry in profile2 (only finnhubIndustry)
        industry: profileRaw?.finnhubIndustry || "",
        image: profileRaw?.logo || "",
        website: profileRaw?.weburl || "",
        dividendYield: metricRaw?.metric?.dividendYieldIndicatedAnnual || metricRaw?.metric?.dividendYieldTtm || 0,
        description: "", // Finnhub does not provide descriptions on free tier
        employeeCount: profileRaw?.employeeTotal ? parseInt(profileRaw.employeeTotal, 10) : undefined
      };

      // 2. Map Historical Financials
      const historical: HistoricalFinancial[] = [];
      const annualSeries = metricRaw?.series?.annual;

      if (annualSeries) {
        // Collect all distinct years from the series
        const yearsSet = new Set<string>();
        const seriesKeys = ["revenue", "netIncome", "operatingIncome", "eps", "freeCashFlow"];
        
        seriesKeys.forEach((key) => {
          const list = annualSeries[key];
          if (Array.isArray(list)) {
            list.forEach((item: any) => {
              if (item && item.period) {
                const year = item.period.split("-")[0];
                if (year) yearsSet.add(year);
              }
            });
          }
        });

        const sortedYears = Array.from(yearsSet).sort();

        // Helper to find value for a given year in a series list
        const getValueForYear = (list: any[], year: string): number => {
          if (!Array.isArray(list)) return 0;
          const found = list.find((item: any) => item && item.period && item.period.startsWith(year));
          return found ? found.v || 0 : 0;
        };

        sortedYears.forEach((year) => {
          // Finnhub metrics are absolute or in millions? Let's check:
          // Usually, annual series values are in millions.
          // Let's multiply series values by 1,000,000 to match FMP and Yahoo absolute values.
          const revenue = getValueForYear(annualSeries.revenue, year) * 1000000;
          const netIncome = getValueForYear(annualSeries.netIncome, year) * 1000000;
          const operatingIncome = getValueForYear(annualSeries.operatingIncome, year) * 1000000;
          const eps = getValueForYear(annualSeries.eps, year); // EPS is not in millions
          const freeCashFlow = getValueForYear(annualSeries.freeCashFlow, year) * 1000000;
          
          historical.push({
            year,
            revenue,
            grossProfit: 0, // Finnhub series doesn't always have grossProfit
            operatingIncome,
            netIncome,
            eps,
            freeCashFlow
          });
        });
      }

      // 3. Map Valuation Ratios
      // Finnhub profit margin is usually a percentage, e.g. 25.4. We divide by 100 to make it a fraction (0.254).
      const rawMargin = metricRaw?.metric?.netProfitMarginTTM || metricRaw?.metric?.netProfitMarginAnnual;
      const profitMargin = rawMargin ? rawMargin / 100 : undefined;

      const ratios: ValuationRatios = {
        peRatio: metricRaw?.metric?.peAnnual || metricRaw?.metric?.peBasicExclExtraTTM || 0,
        psRatio: metricRaw?.metric?.psTTM || metricRaw?.metric?.psAnnual || 0,
        pbRatio: metricRaw?.metric?.pbAnnual || metricRaw?.metric?.pbBookValuePerShareAnnual || 0,
        pegRatio: metricRaw?.metric?.pegTTM || 0,
        evToEbitda: metricRaw?.metric?.ebitdPerShareTTM ? 0 : 0, // Finnhub doesn't expose clean EV/EBITDA on basic metrics
        grossMargin: metricRaw?.metric?.grossMarginTTM ? metricRaw.metric.grossMarginTTM / 100 : 0,
        roe: metricRaw?.metric?.roeTTM ? metricRaw.metric.roeTTM / 100 : 0,
        debtToEquity: metricRaw?.metric?.totalDebtTotalEquity || 0,
        currentRatio: metricRaw?.metric?.currentRatioAnnual || 0,
        profitMargin,
        cash: metricRaw?.metric?.totalCash ? metricRaw.metric.totalCash * 1000000 : undefined,
        debt: metricRaw?.metric?.totalDebt ? metricRaw.metric.totalDebt * 1000000 : undefined
      };

      // 4. Map Estimates (Finnhub doesn't provide these on free search endpoints, so empty/0)
      const estimates: AnalystEstimate = {
        targetLow: 0,
        targetAvg: 0,
        targetHigh: 0,
        epsAvg: 0
      };

      const sources = [`https://finnhub.io/api/v1/stock/profile2?symbol=${cleanTicker}`];

      return {
        profile,
        historical,
        ratios,
        estimates,
        metrics: {}, // will be generated during merge
        sources
      };
    } catch (err) {
      console.error(`FinnhubProvider: Error fetching data for ${cleanTicker}:`, err);
      return null;
    }
  }
}
