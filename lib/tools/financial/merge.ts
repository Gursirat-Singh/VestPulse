import { FinancialData, FinancialProfile, HistoricalFinancial, ValuationRatios, AnalystEstimate } from "../../../types";

export interface CompletenessReport {
  score: number;
  populatedFields: number;
  totalFields: number;
  missingFields: string[];
}

// Helper to determine if a value is valid (non-null, non-undefined, non-empty, non-N/A, non-NaN, non-empty object/array)
export function isValidValue(val: any, isNumericFieldWithZeroInvalid: boolean = false): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === "number" && isNaN(val)) return false;
  if (typeof val === "string") {
    const clean = val.trim().toUpperCase();
    return clean !== "" && clean !== "N/A" && clean !== "UNDEFINED" && clean !== "NULL";
  }
  if (Array.isArray(val) && val.length === 0) return false;
  if (typeof val === "object" && Object.keys(val).length === 0) return false;
  if (isNumericFieldWithZeroInvalid && typeof val === "number" && val === 0) return false;
  return true;
}

// Helper to merge string fields by priority order
function getMergedString(pList: any[], selector: (p: any) => string | undefined): string {
  for (const p of pList) {
    const val = selector(p);
    if (isValidValue(val)) return val!;
  }
  return "";
}

// Helper to merge numeric fields by priority order
function getMergedNumeric(
  pList: any[],
  selector: (p: any) => number | undefined,
  isZeroInvalid: boolean = false
): number {
  for (const p of pList) {
    const val = selector(p);
    if (isValidValue(val, isZeroInvalid)) return val!;
  }
  return 0;
}

export function mergeFinancialMetrics(
  ...providers: (Partial<FinancialData> | null)[]
): FinancialData {
  const pList = providers.filter((p): p is Partial<FinancialData> => !!p);

  // 1. Merge Profile
  const profile: FinancialProfile = {
    companyName: getMergedString(pList, p => p.profile?.companyName),
    ticker: getMergedString(pList, p => p.profile?.ticker),
    price: getMergedNumeric(pList, p => p.profile?.price, true),
    marketCap: getMergedNumeric(pList, p => p.profile?.marketCap, true),
    range: getMergedString(pList, p => p.profile?.range),
    beta: getMergedNumeric(pList, p => p.profile?.beta, false),
    sector: getMergedString(pList, p => p.profile?.sector),
    industry: getMergedString(pList, p => p.profile?.industry),
    image: getMergedString(pList, p => p.profile?.image),
    website: getMergedString(pList, p => p.profile?.website),
    dividendYield: getMergedNumeric(pList, p => p.profile?.dividendYield, false),
    description: getMergedString(pList, p => p.profile?.description),
    employeeCount: getMergedNumeric(pList, p => p.profile?.employeeCount, false) || undefined
  };

  // 2. Merge Historical Financials (Align by year)
  const allYears = new Set<string>();
  pList.forEach(p => {
    if (p.historical) {
      p.historical.forEach((h) => {
        if (h.year) allYears.add(h.year);
      });
    }
  });

  const historical: HistoricalFinancial[] = [];
  Array.from(allYears).sort().forEach(year => {
    const yearRecords = pList.map(p => p.historical?.find((h) => h.year === year)).filter(Boolean);
    
    historical.push({
      year,
      revenue: getMergedNumeric(yearRecords, h => h.revenue, true),
      grossProfit: getMergedNumeric(yearRecords, h => h.grossProfit, false),
      operatingIncome: getMergedNumeric(yearRecords, h => h.operatingIncome, false),
      netIncome: getMergedNumeric(yearRecords, h => h.netIncome, true),
      eps: getMergedNumeric(yearRecords, h => h.eps, true),
      freeCashFlow: getMergedNumeric(yearRecords, h => h.freeCashFlow, false)
    });
  });

  // 3. Merge Ratios
  const ratios: ValuationRatios = {
    peRatio: getMergedNumeric(pList, p => p.ratios?.peRatio, true),
    psRatio: getMergedNumeric(pList, p => p.ratios?.psRatio, false),
    pbRatio: getMergedNumeric(pList, p => p.ratios?.pbRatio, false),
    pegRatio: getMergedNumeric(pList, p => p.ratios?.pegRatio, false),
    evToEbitda: getMergedNumeric(pList, p => p.ratios?.evToEbitda, false),
    grossMargin: getMergedNumeric(pList, p => p.ratios?.grossMargin, false),
    roe: getMergedNumeric(pList, p => p.ratios?.roe, false),
    debtToEquity: getMergedNumeric(pList, p => p.ratios?.debtToEquity, false),
    currentRatio: getMergedNumeric(pList, p => p.ratios?.currentRatio, false),
    profitMargin: getMergedNumeric(pList, p => p.ratios?.profitMargin, false) || undefined,
    cash: getMergedNumeric(pList, p => p.ratios?.cash, true) || undefined,
    debt: getMergedNumeric(pList, p => p.ratios?.debt, true) || undefined
  };

  // 4. Merge Estimates
  const estimates: AnalystEstimate = {
    targetLow: getMergedNumeric(pList, p => p.estimates?.targetLow, false),
    targetAvg: getMergedNumeric(pList, p => p.estimates?.targetAvg, false),
    targetHigh: getMergedNumeric(pList, p => p.estimates?.targetHigh, false),
    epsAvg: getMergedNumeric(pList, p => p.estimates?.epsAvg, false)
  };

  // 5. Merge Sources (Unique URLs)
  const sourcesSet = new Set<string>();
  pList.forEach(p => {
    if (p.sources) p.sources.forEach(src => sourcesSet.add(src));
  });
  const sources = Array.from(sourcesSet);

  // 6. Build flat metrics map for backward compatibility
  const latestHist = historical[historical.length - 1];
  let profitMargin = ratios.profitMargin;
  if (latestHist && !isValidValue(profitMargin) && latestHist.revenue && latestHist.netIncome) {
    profitMargin = latestHist.netIncome / latestHist.revenue;
  }

  let fiftyTwoWeekLow = 0;
  let fiftyTwoWeekHigh = 0;
  if (profile.range && profile.range !== "N/A") {
    const parts = profile.range.split("-");
    if (parts.length === 2) {
      fiftyTwoWeekLow = parseFloat(parts[0].trim());
      fiftyTwoWeekHigh = parseFloat(parts[1].trim());
    }
  }

  const flatMetrics: Record<string, string | number> = {
    companyName: profile.companyName,
    ticker: profile.ticker,
    price: profile.price,
    marketCap: profile.marketCap,
    range: profile.range,
    sector: profile.sector,
    industry: profile.industry,
    description: profile.description,
    employeeCount: profile.employeeCount || 0,
    peRatio: ratios.peRatio,
    psRatio: ratios.psRatio,
    pbRatio: ratios.pbRatio,
    pegRatio: ratios.pegRatio,
    evToEbitda: ratios.evToEbitda,
    grossMargin: ratios.grossMargin,
    roe: ratios.roe,
    debtToEquity: ratios.debtToEquity,
    currentRatio: ratios.currentRatio,
    profitMargin: profitMargin || 0,
    cash: ratios.cash || 0,
    debt: ratios.debt || 0,
    fiftyTwoWeekLow,
    fiftyTwoWeekHigh,
    revenue: latestHist?.revenue || 0,
    netIncome: latestHist?.netIncome || 0,
    operatingIncome: latestHist?.operatingIncome || 0,
    eps: latestHist?.eps || 0,
    freeCashFlow: latestHist?.freeCashFlow || 0
  };

  return {
    profile,
    historical,
    ratios,
    estimates,
    metrics: flatMetrics,
    sources
  };
}

export function calculateCompletenessScore(data: FinancialData): CompletenessReport {
  const fields: { name: string; value: any; isZeroInvalid: boolean }[] = [];

  // Profile fields
  fields.push({ name: "Company Name", value: data.profile?.companyName, isZeroInvalid: false });
  fields.push({ name: "Ticker", value: data.profile?.ticker, isZeroInvalid: false });
  fields.push({ name: "Market Cap", value: data.profile?.marketCap, isZeroInvalid: true });
  fields.push({ name: "Current Price", value: data.profile?.price, isZeroInvalid: true });
  fields.push({ name: "Sector", value: data.profile?.sector, isZeroInvalid: false });
  fields.push({ name: "Industry", value: data.profile?.industry, isZeroInvalid: false });
  fields.push({ name: "Description", value: data.profile?.description, isZeroInvalid: false });
  fields.push({ name: "Employee Count", value: data.profile?.employeeCount, isZeroInvalid: false });

  // 52 week range parsing
  let fiftyTwoWeekLow: number | undefined;
  let fiftyTwoWeekHigh: number | undefined;
  if (data.profile?.range && data.profile.range !== "N/A") {
    const parts = data.profile.range.split("-");
    if (parts.length === 2) {
      fiftyTwoWeekLow = parseFloat(parts[0].trim());
      fiftyTwoWeekHigh = parseFloat(parts[1].trim());
    }
  }
  fields.push({ name: "52 Week Low", value: fiftyTwoWeekLow, isZeroInvalid: false });
  fields.push({ name: "52 Week High", value: fiftyTwoWeekHigh, isZeroInvalid: false });

  // Ratios fields
  fields.push({ name: "PE Ratio", value: data.ratios?.peRatio, isZeroInvalid: true });
  fields.push({ name: "ROE", value: data.ratios?.roe, isZeroInvalid: false });
  fields.push({ name: "Cash", value: data.ratios?.cash, isZeroInvalid: true });
  fields.push({ name: "Debt", value: data.ratios?.debt, isZeroInvalid: true });

  // Historical fields (latest year)
  const latestHist = data.historical && data.historical.length > 0
    ? data.historical[data.historical.length - 1]
    : null;

  fields.push({ name: "Revenue", value: latestHist?.revenue, isZeroInvalid: true });
  fields.push({ name: "Net Income", value: latestHist?.netIncome, isZeroInvalid: true });
  fields.push({ name: "Operating Income", value: latestHist?.operatingIncome, isZeroInvalid: false });
  fields.push({ name: "EPS", value: latestHist?.eps, isZeroInvalid: true });

  // Profit Margin field
  let profitMargin = data.ratios?.profitMargin;
  if (!isValidValue(profitMargin) && latestHist?.revenue && latestHist?.netIncome) {
    profitMargin = latestHist.netIncome / latestHist.revenue;
  }
  fields.push({ name: "Profit Margin", value: profitMargin, isZeroInvalid: false });

  let populatedFields = 0;
  const missingFields: string[] = [];

  fields.forEach((f) => {
    if (isValidValue(f.value, f.isZeroInvalid)) {
      populatedFields++;
    } else {
      missingFields.push(f.name);
    }
  });

  const totalFields = fields.length;
  const score = totalFields > 0 ? Math.round((populatedFields / totalFields) * 100) : 0;

  return {
    score,
    populatedFields,
    totalFields,
    missingFields
  };
}
