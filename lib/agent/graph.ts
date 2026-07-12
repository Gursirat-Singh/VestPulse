import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState } from "./state";
import { resolveCompany } from "./nodes/resolveCompany";
import { gatherNews } from "./nodes/gatherNews";
import { gatherFinancials } from "./nodes/gatherFinancials";
import { gatherCompetitors } from "./nodes/gatherCompetitors";
import { gatherRisks } from "./nodes/gatherRisks";
import { synthesizeAndDecide } from "./nodes/synthesizeAndDecide";
import { generateReport } from "./nodes/generateReport";
import { insufficientData } from "./nodes/insufficientData";

// Construct the StateGraph
const workflow = new StateGraph(AgentState)
  // Register all nodes
  .addNode("resolveCompany", resolveCompany)
  .addNode("gatherNews", gatherNews)
  .addNode("gatherFinancials", gatherFinancials)
  .addNode("gatherCompetitors", gatherCompetitors)
  .addNode("gatherRisks", gatherRisks)
  .addNode("synthesizeAndDecide", synthesizeAndDecide)
  .addNode("generateReport", generateReport)
  .addNode("insufficientData", insufficientData);

// Set entry point
workflow.addEdge(START, "resolveCompany");

// Define conditional transitions from resolveCompany node
workflow.addConditionalEdges(
  "resolveCompany",
  (state) => {
    if (state.resolved) {
      return ["gatherNews", "gatherFinancials", "gatherCompetitors", "gatherRisks"];
    }
    return ["insufficientData"];
  },
  ["gatherNews", "gatherFinancials", "gatherCompetitors", "gatherRisks", "insufficientData"]
);

// Fan-in: Link all research nodes back to synthesizeAndDecide
workflow.addEdge("gatherNews", "synthesizeAndDecide");
workflow.addEdge("gatherFinancials", "synthesizeAndDecide");
workflow.addEdge("gatherCompetitors", "synthesizeAndDecide");
workflow.addEdge("gatherRisks", "synthesizeAndDecide");

// Continue the downstream analysis
workflow.addEdge("synthesizeAndDecide", "generateReport");
workflow.addEdge("generateReport", END);

// If unresolvable, terminate directly after insufficientData node
workflow.addEdge("insufficientData", END);

// Compile and export the graph
export const graph = workflow.compile();
