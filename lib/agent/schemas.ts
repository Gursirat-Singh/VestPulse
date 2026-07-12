import { z } from "zod";


export const QualitativeOutputSchema = z.object({
  newsSummary: z.string(),
  newsSentiment: z.enum(["positive", "neutral", "negative"]),
  competitiveSummary: z.string(),
  competitors: z.array(z.string()),
  riskSummary: z.string(),
  keyRisks: z.array(z.string()).min(2).max(5),
});

const FactorScoreSchema = z.object({
  score: z.number().min(0).max(100),
  explanation: z.string(),
  evidence: z.string(),
  source: z.string(),
});

export const DecisionOutputSchema = z.object({
  decision: z.enum(["INVEST", "PASS"]),
  confidence: z.number().min(0).max(100),
  confidenceReason: z.string(),
  oneLineVerdict: z.string(),
  keyPositives: z.array(z.string()).min(2).max(5),
  financialCommentary: z.string(),
  reasoning: z.string(),
  investmentScore: z.number().min(0).max(100),
  recommendation: z.enum(["Strong Buy", "Invest", "Hold", "Avoid", "Strong Avoid"]),
  contradictionDetected: z.boolean(),
  contradictionExplanation: z.string(),
  businessQuality: FactorScoreSchema,
  financialHealth: FactorScoreSchema,
  growthPotential: FactorScoreSchema,
  valuation: FactorScoreSchema,
  competitiveMoat: FactorScoreSchema,
  marketSentiment: FactorScoreSchema,
  riskProfile: FactorScoreSchema,
});

export const SynthesisOutputSchema = z.object({
  newsSummary: z.string(),
  newsSentiment: z.enum(["positive", "neutral", "negative"]),
  competitiveSummary: z.string(),
  competitors: z.array(z.string()),
  riskSummary: z.string(),
  keyRisks: z.array(z.string()).min(2).max(5),
  financialCommentary: z.string(),

  decision: z.enum(["INVEST", "PASS"]),
  confidence: z.number().min(0).max(100),
  confidenceReason: z.string(),
  oneLineVerdict: z.string(),
  keyPositives: z.array(z.string()).min(2).max(5),
  reasoning: z.string(),

  investmentScore: z.number().min(0).max(100),
  recommendation: z.enum(["Strong Buy", "Invest", "Hold", "Avoid", "Strong Avoid"]),
  contradictionDetected: z.boolean(),
  contradictionExplanation: z.string(),
  businessQuality: FactorScoreSchema,
  financialHealth: FactorScoreSchema,
  growthPotential: FactorScoreSchema,
  valuation: FactorScoreSchema,
  competitiveMoat: FactorScoreSchema,
  marketSentiment: FactorScoreSchema,
  riskProfile: FactorScoreSchema,
});
