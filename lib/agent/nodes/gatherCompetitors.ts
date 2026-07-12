import { AgentState } from "../state";
import { searchWeb } from "../../tools/webSearch";
import { withRetry } from "../../retry";
import { cached } from "../../cache/redis";

export async function gatherCompetitors(state: typeof AgentState.State): Promise<Partial<typeof AgentState.State>> {
  const entity = state.resolvedEntity;
  if (!entity) {
    return { competitorEvidence: null };
  }

  const tickerOrName = entity.ticker || entity.name;
  const cacheKey = `competitors:${tickerOrName.toLowerCase()}`;
  const TTL_7_DAYS = 7 * 24 * 3600;

  console.log(`[gatherCompetitors] Gathering competitors for: ${entity.name}`);

  try {
    const evidence = await cached(cacheKey, TTL_7_DAYS, async () => {
      const query = `${entity.name} competitors competitive advantage market share key rivals`;
      
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
      competitorEvidence: evidence,
    };
  } catch (error: any) {
    console.error(`[gatherCompetitors] Error gathering competitors for ${entity.name}:`, error);
    return {
      competitorEvidence: null,
      degraded: [`Failed to gather competitor evidence for ${entity.name}: ${error.message || error}`],
    };
  }
}
