import { getLLM } from "../../llm";
import { AgentState } from "../state";
import { INSUFFICIENT_DATA_PROMPT } from "../prompts";

/**
 * insufficientData node:
 * Handles fallback cases when a company cannot be resolved or does not have sufficient public profile
 * to execute the standard research tasks.
 */
export async function insufficientData(state: typeof AgentState.State): Promise<Partial<typeof AgentState.State>> {
  console.log(`[insufficientData] Handled insufficient data path for query: "${state.companyName}"`);
  
  try {
    const llm = getLLM();
    const prompt = INSUFFICIENT_DATA_PROMPT.replace("{companyName}", state.companyName);
    
    const response = await llm.invoke(prompt);
    
    return {
      resolved: false,
      finalReport: response.content as string,
    };
  } catch (error: any) {
    console.error("[insufficientData] Node execution error:", error);
    return {
      resolved: false,
      finalReport: `Could not resolve or research the company: "${state.companyName}". Please try a different name or public stock ticker.`,
      errors: [`Insufficient data handler failed: ${error.message || error}`],
    };
  }
}
