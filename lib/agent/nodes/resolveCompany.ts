import { AgentState } from "../state";
import { withRetry } from "../../retry";
import { cached } from "../../cache/redis";
import { getLLM } from "../../llm";

export async function resolveCompany(
  state: typeof AgentState.State
): Promise<Partial<typeof AgentState.State>> {
  const query = state.companyName.trim();

  console.log(`[resolveCompany] Resolving "${query}"`);

  if (!query || query.length < 2) {
    return {
      resolved: false,
      resolvedEntity: null,
    };
  }

  const cacheKey = `resolve:${query.toLowerCase()}`;
  const TTL_30_DAYS = 30 * 24 * 60 * 60;

  try {
    const resolved = await cached(cacheKey, TTL_30_DAYS, async () => {
      const apiKey = process.env.FMP_API_KEY;

      if (!apiKey) {
        throw new Error("Missing FMP_API_KEY");
      }

      // Detect ticker vs company name
      const looksLikeTicker = /^[A-Z.-]{1,6}$/.test(query);

      let searchResults: any[] = [];

      const searchByEndpoint = async (endpoint: string) => {
        const url = `https://financialmodelingprep.com/stable/${endpoint}?query=${encodeURIComponent(query)}&apikey=${apiKey}`;
        return await withRetry(async () => {
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`FMP Search failed: ${res.status} ${res.statusText}`);
          }
          return (await res.json()) as any[];
        });
      };

      if (looksLikeTicker) {
        searchResults = await searchByEndpoint("search-symbol");
      }

      // If no results from symbol (e.g. they searched "NVIDIA" which is 6 caps but a name), or it didn't look like a ticker
      if (searchResults.length === 0) {
        searchResults = await searchByEndpoint("search-name");
      }

      console.log("[resolveCompany] Raw FMP results:", searchResults);

      if (searchResults.length > 0) {
        // Remove ETFs, leveraged products, inverse funds, etc.
        const filtered = searchResults.filter((company) => {
          const name = (company.name ?? "").toLowerCase();

          return ![
            "etf",
            "yield",
            "leveraged",
            "inverse",
            "daily target",
            "shares",
            "trust",
            "fund",
          ].some((keyword) => name.includes(keyword));
        });

        // Prefer major US exchanges
        const bestMatch =
          filtered.find((c) => c.exchange === "NASDAQ") ||
          filtered.find((c) => c.exchange === "NYSE") ||
          filtered.find((c) =>
            c.exchangeFullName?.toUpperCase().includes("NASDAQ")
          ) ||
          filtered.find((c) =>
            c.exchangeFullName?.toUpperCase().includes("NEW YORK")
          ) ||
          filtered[0] ||
          searchResults[0];

        if (bestMatch) {
          console.log(
            `[resolveCompany] Selected: ${bestMatch.name} (${bestMatch.symbol})`
          );

          return {
            resolved: true,
            resolvedEntity: {
              name: bestMatch.name,
              ticker: bestMatch.symbol,
              isPublic: true,
            },
          };
        }
      }

      // Reject obvious gibberish
      const hasLetters = /[a-zA-Z]/.test(query);
      const isGibberish =
        !hasLetters ||
        (query.length > 12 && !query.includes(" "));

      if (isGibberish) {
        return {
          resolved: false,
          resolvedEntity: null,
        };
      }

      // Verify with LLM if this is actually a legitimate private company/startup
      // or just a random phrase (e.g. "happy birthday", "hello world").
      try {
        console.log(`[resolveCompany] FMP lookup failed. Verifying "${query}" via LLM...`);
        const llm = getLLM();
        const verificationPrompt = `You are a strict data validation assistant.
Does the input "${query}" represent a real, known company, startup, or business entity?
Inputs like "happy birthday", "hello world", "asdf" or random conversational sentences are NOT companies.
Answer ONLY with "YES" if it is a company, or "NO" if it is not.`;
        
        const llmResponse = await llm.invoke(verificationPrompt);
        const text = (llmResponse.content as string).trim().toUpperCase();
        
        if (!text.includes("YES")) {
          console.log(`[resolveCompany] LLM rejected "${query}" as a real company.`);
          return {
            resolved: false,
            resolvedEntity: null,
          };
        }
      } catch (err) {
        console.warn("[resolveCompany] LLM verification failed, proceeding with fallback assumption.", err);
      }

      // Assume it's a private company
      console.log("[resolveCompany] Treating as private company");

      return {
        resolved: true,
        resolvedEntity: {
          name: query,
          ticker: undefined,
          isPublic: false,
        },
      };
    });

    console.log(
      `[resolveCompany] Final: ${resolved.resolvedEntity?.name} (${resolved.resolvedEntity?.ticker ?? "PRIVATE"})`
    );

    return resolved;
  } catch (error: any) {
    console.error("[resolveCompany] Error:", error);

    return {
      resolved: false,
      resolvedEntity: null,
      errors: [
        `Failed to resolve company "${query}": ${
          error.message ?? String(error)
        }`,
      ],
    };
  }
}