interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
}

export async function searchWeb(query: string, maxResults = 5): Promise<SearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("Missing TAVILY_API_KEY environment variable.");
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        max_results: maxResults,
        include_answer: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[webSearch] Tavily search API failed: ${response.statusText} - ${errorText}`);
      throw new Error(`Tavily search service is temporarily unavailable.`);
    }

    const data = (await response.json()) as SearchResponse;
    return data;
  } catch (error: any) {
    console.error("Error in searchWeb tool:", error);
    throw error;
  }
}
