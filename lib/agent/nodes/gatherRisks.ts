import { AgentState } from "../state";
import { searchWeb } from "../../tools/webSearch";
import { withRetry } from "../../retry";
import { cached } from "../../cache/redis";

export async function gatherRisks(state: typeof AgentState.State): Promise<Partial<typeof AgentState.State>> {
  const entity = state.resolvedEntity;
  if (!entity) {
    return { riskEvidence: null };
  }

  const tickerOrName = entity.ticker || entity.name;
  const cacheKey = `risks:${tickerOrName.toLowerCase()}`;
  const TTL_48_HOURS = 48 * 3600;

  console.log(`[gatherRisks] Gathering risks for: ${entity.name}`);

  try {
    const evidence = await cached(cacheKey, TTL_48_HOURS, async () => {
      const query = `${entity.name} risk factors market risks controversies regulations headwinds`;
      
      const searchRes = await withRetry(() => searchWeb(query, 5), {
        retries: 2,
        baseDelayMs: 200,
      });

      const items = searchRes.results.map((r: any) => ({
        title: r.title,
        snippet: r.content || r.snippet || "",
        url: r.url,
      }));

      return {
        items,
      };
    });

    return {
      riskEvidence: evidence,
    };
  } catch (error: any) {
    console.error(`[gatherRisks] Error gathering risks for ${entity.name}:`, error);
    return {
      riskEvidence: null,
      degraded: [`Failed to gather risk evidence for ${entity.name}: ${error.message || error}`],
    };
  }
}
