import { Annotation } from "@langchain/langgraph";
import { 
  ResolvedEntity, 
  NewsEvidence, 
  FinancialOrchestratorResult, 
  CompetitorEvidence, 
  RiskEvidence,
  SynthesisOutput
} from "../../types";

export const AgentState = Annotation.Root({
  companyName: Annotation<string>,
  resolved: Annotation<boolean>,
  resolvedEntity: Annotation<ResolvedEntity | null>,

  // raw evidence — no LLM has touched these yet
  newsEvidence: Annotation<NewsEvidence | null>,
  financialData: Annotation<FinancialOrchestratorResult | null>,
  competitorEvidence: Annotation<CompetitorEvidence | null>,
  riskEvidence: Annotation<RiskEvidence | null>,

  // output of the single (or dual, if LLM_CALL_BUDGET=2) LLM call
  synthesis: Annotation<SynthesisOutput | null>,

  finalReport: Annotation<string | null>,
  errors: Annotation<string[]>({ 
    reducer: (a, b) => a.concat(b), 
    default: () => [] 
  }),
  degraded: Annotation<string[]>({ 
    reducer: (a, b) => a.concat(b), 
    default: () => [] 
  }), // which nodes fell back to partial/cached data
});
