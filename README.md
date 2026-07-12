# AI Investment Research Agent

## Overview
An autonomous, production-grade AI Investment Research Agent built as a single deployable Next.js 14+ App Router application. The app leverages LangGraph.js to orchestrate concurrent research nodes. It has been highly optimized to reduce Gemini LLM API calls from 7 down to a single call (or two calls) per run through deterministic data-fetching nodes, structured multi-schema extraction, client retries with jitter, in-memory circuit breaking, and Redis caching keyed by evidence hashes.

The UI progress checklist is completely decoupled from the graph's internal nodes, preserving the same 8-step visual pacing while benefiting from up to 7x reduction in API consumption and significantly lower latency.

## How to Run It

### 1. Clone & Install
```bash
git clone <repository-url>
cd investment-research-agent
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the project and populate it with your keys:
```ini
LLM_PROVIDER=gemini            # "openai" | "anthropic" | "gemini"
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key # Optional fallback
MODEL_NAME=gemini-1.5-flash    # or gpt-4o-mini / claude-3-5-sonnet

TAVILY_API_KEY=your-tavily-api-key
FMP_API_KEY=your-fmp-api-key    # Financial Modeling Prep API Key (free tier works)

# Optimization config
LLM_CALL_BUDGET=1                  # "1" (single combined call) or "2" (two-step qualitative + decision)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
GEMINI_MAX_RETRIES=3
GEMINI_CIRCUIT_BREAKER_THRESHOLD=3
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view and test the application.

### 4. Vercel Deployment
Deploy directly to Vercel:
1. Push the code to a GitHub repository.
2. Link the repository on the Vercel Dashboard.
3. Configure all environment variables in Vercel Project Settings.
4. Deploy the project.

---

## How It Works

### LangGraph.js Topology
The optimized topology separates data-gathering from LLM reasoning:
```
                     [START]
                        │
             resolveCompany (deterministic)
            /               \
    (resolved)             (unresolved)
     /   │   \   \              \
    /    │    \   \       insufficientData
   /     │     \   \            │
news financials comps risks   [END]
   \     │     /   /
    \    │    /   /
   synthesizeAndDecide (LLM call - 1 or 2 runs)
         │
   generateReport (deterministic interpolation)
         │
       [END]
```

1. **`resolveCompany`**: Deterministic ticker resolution querying FMP Search API instead of LLM. Resolves names to tickers with local checks, caching results for 30 days.
2. **Conditional Routing**:
   - **Resolved**: Fans out to 4 parallel nodes (`gatherNews`, `gatherFinancials`, `gatherCompetitors`, `gatherRisks`) to gather and synthesize metrics.
   - **Unresolved**: Routes to `insufficientData` to explain data limitations and terminates.
3. **Parallel Research Nodes (Fully Deterministic)**:
   - `gatherNews`: Fetches Tavily news (cached for 8-hour buckets) and runs local lexicon-based sentiment analysis (`sentiment` package) to obtain a numeric score.
   - `gatherFinancials`: Queries FMP Profile, Income Statement, and Key Metrics. Employs caching for 24 hours. Gracefully skips private companies without crashing.
   - `gatherCompetitors`: Fetches raw competitor results from Tavily (cached for 7 days).
   - `gatherRisks`: Scans Tavily for operational, regulatory, and market risks (cached for 48 hours).
4. **`synthesizeAndDecide`**: The single reasoning node. It coalesces all raw news, competitor, financial, and risk evidence into one LLM call using `SynthesisOutputSchema`. Supports a two-call mode (`LLM_CALL_BUDGET=2`) if qualitative extraction and decisions need separation.
5. **`generateReport`**: Completely deterministic. Interpolates the structured outputs from `synthesizeAndDecide` into a markdown document at zero LLM cost.

---

## Key Decisions & Trade-offs

- **7x Reduction in LLM Calls**: By deferring text summarization and decision-making to a single, combined LLM node (`synthesizeAndDecide`), the API budget is reduced to just 1 Gemini call per run (or 2 under Two-Call mode), avoiding free-tier rate limits.
- **Evidence-Hash Caching**: LLM synthesis is cached in Upstash Redis, keyed by a SHA256 hash of all collected research evidence (`synthesis:{ticker}:{evidenceHash}`). If none of the underlying evidence changes, the LLM call is bypassed entirely on repeat runs.
- **Resilient Retry Wrapper & Circuit Breaker**: All network requests use a unified `withRetry` helper with exponential backoff and jitter. If Gemini reports 3 consecutive failures, the circuit breaker opens for 60 seconds, forcing the node to degrade gracefully to raw research files instead of making users wait through timeout loops.
- **SSE decoupling**: By utilizing custom RunnableConfig events inside the graph execution, the UI is able to render 8 distinct progress indicators even though the internal LangGraph has fewer nodes, maintaining pacing and user feedback.

---

## Example Runs

### Run 1: Large Public Company (NVIDIA)
- **Verdict**: `INVEST`
- **Confidence**: `88%`
- **One-Line Verdict**: NVIDIA remains the dominant leader in AI hardware and software systems with a massive ecosystem moat.
- **Key Supporting Points**:
  - Uncontested leadership in high-performance AI GPUs.
  - Strong gross margin (>70%) reflecting strong pricing power.
  - CUDA software ecosystem creates high switching costs.
- **Key Risks**:
  - Increasing competition from custom ASICs and AMD.
  - Semiconductor trade restrictions.

---

## What We Would Improve with More Time
1. **Persistence & History**: Add a PostgreSQL/Supabase DB to store past reports.
2. **Backtesting Engine**: Compare the agent's historical recommendations against actual market returns.
3. **Multi-Model Evaluation**: Prompt both Claude 3.5 Sonnet and GPT-4o concurrently.

---
*Note: AI build chat transcripts are included in [docs/chat-transcripts/](file:///C:/Users/gursi/Desktop/AI%20RESEARCH%20AGENT/investment-research-agent/docs/chat-transcripts/).*
