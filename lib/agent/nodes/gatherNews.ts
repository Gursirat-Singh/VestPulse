import { AgentState } from "../state";
import { searchWeb } from "../../tools/webSearch";
import { withRetry } from "../../retry";
import { cached } from "../../cache/redis";
import Sentiment from "sentiment";

export async function gatherNews(state: typeof AgentState.State): Promise<Partial<typeof AgentState.State>> {
  const entity = state.resolvedEntity;
  if (!entity) {
    return { newsEvidence: null };
  }

  const tickerOrName = entity.ticker || entity.name;
  const dayBucket = Math.floor(Date.now() / (8 * 3600 * 1000)); // 8-hour bucket
  const cacheKey = `news:${tickerOrName.toLowerCase()}:${dayBucket}`;
  const TTL_8_HOURS = 8 * 3600;

  console.log(`[gatherNews] Gathering news for: ${entity.name}`);

  try {
    const evidence = await cached(cacheKey, TTL_8_HOURS, async () => {
      const query = `${entity.name} recent news business sentiment stock performance 2026`;
      
      const searchRes = await withRetry(() => searchWeb(query, 5), {
        retries: 2,
        baseDelayMs: 200,
      });

      const items = searchRes.results.map((r: any) => ({
        title: r.title,
        snippet: r.content || r.snippet || "",
        url: r.url,
        publishedDate: r.publishedDate || new Date().toISOString(),
      }));

      // Non-LLM sentiment calculation
      const sentimentAnalyzer = new Sentiment();
      const textToAnalyze = items.map((i) => `${i.title} ${i.snippet}`).join(" ");
      const sentimentResult = sentimentAnalyzer.analyze(textToAnalyze);

      return {
        items,
        heuristicSentiment: sentimentResult.comparative, // score / word count
      };
    });

    return {
      newsEvidence: evidence,
    };
  } catch (error: any) {
    console.error(`[gatherNews] Error gathering news for ${entity.name}:`, error);
    return {
      newsEvidence: null,
      degraded: [`Failed to gather news evidence for ${entity.name}: ${error.message || error}`],
    };
  }
}
