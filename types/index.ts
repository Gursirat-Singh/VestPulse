export interface ResolvedEntity {
  name: string;
  ticker?: string;
  isPublic: boolean;
}

export interface NewsItem {
  title: string;
  snippet: string;
  url: string;
  publishedDate?: string;
}

export interface NewsEvidence {
  items: NewsItem[];
  heuristicSentiment: number;
}

// Structured financial metrics
export interface FinancialProfile {
  companyName: string;
  ticker: string;
  price: number;
  marketCap: number;
  range: string;
  beta: number;
  sector: string;
  industry: string;
  image: string;
  website: string;
  dividendYield: number;
  description: string;
  employeeCount?: number;
}

export interface HistoricalFinancial {
  year: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  freeCashFlow: number;
}

export interface ValuationRatios {
  peRatio: number;
  psRatio: number;
  pbRatio: number;
  pegRatio: number;
  evToEbitda: number;
  grossMargin: number;
  roe: number;
  debtToEquity: number;
  currentRatio: number;
  profitMargin?: number;
  cash?: number;
  debt?: number;
}

export interface AnalystEstimate {
  targetLow: number;
  targetAvg: number;
  targetHigh: number;
  epsAvg: number;
}

export interface FinancialData {
  summary?: string;
  profile?: FinancialProfile;
  historical?: HistoricalFinancial[];
  ratios?: ValuationRatios;
  estimates?: AnalystEstimate;
  metrics: Record<string, string | number>; // Keep this for backward compatibility
  sources: string[];
}

export interface FinancialOrchestratorResult {
  metrics: FinancialData;
  completeness: number;
  providersUsed: string[];
  missingFields: string[];
}


export interface CompetitorItem {
  title: string;
  snippet: string;
  url: string;
}

export interface CompetitorEvidence {
  items: CompetitorItem[];
}

export interface RiskItem {
  title: string;
  snippet: string;
  url: string;
}

export interface RiskEvidence {
  items: RiskItem[];
}

export interface FactorScore {
  score: number;
  explanation: string;
  evidence: string;
  source: string;
}

export interface SynthesisOutput {
  newsSummary: string;
  newsSentiment: "positive" | "neutral" | "negative";
  competitiveSummary: string;
  competitors: string[];
  riskSummary: string;
  keyRisks: string[];
  financialCommentary: string;

  decision: "INVEST" | "PASS";
  confidence: number;
  confidenceReason: string;
  oneLineVerdict: string;
  keyPositives: string[];
  reasoning: string;

  // New fields for Multi-Factor Investment Framework & Explainable AI
  investmentScore: number;
  recommendation: "Strong Buy" | "Invest" | "Hold" | "Avoid" | "Strong Avoid";
  contradictionDetected: boolean;
  contradictionExplanation: string;
  businessQuality: FactorScore;
  financialHealth: FactorScore;
  growthPotential: FactorScore;
  valuation: FactorScore;
  competitiveMoat: FactorScore;
  marketSentiment: FactorScore;
  riskProfile: FactorScore;
}

// Frontend layout types
export interface NewsResearch {
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  sources: string[];
}

export interface CompetitiveLandscape {
  summary: string;
  competitors: string[];
  sources: string[];
}

export interface RiskFactors {
  summary: string;
  risks: string[];
  sources: string[];
}

export interface AgentStateData {
  companyName: string;
  resolved: boolean;
  resolvedEntity: ResolvedEntity | null;
  newsResearch: NewsResearch | null;
  financialData: FinancialOrchestratorResult | null;
  competitiveLandscape: CompetitiveLandscape | null;
  riskFactors: RiskFactors | null;
  decision: "INVEST" | "PASS" | null;
  confidence: number | null;
  oneLineVerdict: string | null;
  keyPositives: string[];
  keyRisks: string[];
  reasoning: string | null;
  finalReport: string | null;
  errors: string[];
}

export interface SSEEvent {
  node: string;
  message: string;
}
