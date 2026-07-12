<div align="center">
  <img src="app/logo.png" alt="VestPulse Logo" width="120" />
  <h1>VestPulse</h1>
  <p><strong>AI-Powered Investment Research Agent</strong></p>
  <p><strong><a href="https://vest-pulse.vercel.app/" target="_blank">Live Deployment: vest-pulse.vercel.app</a></strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/LangGraph-000000?style=for-the-badge&logo=langchain&logoColor=white" alt="LangGraph" />
    <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangChain" />
    <img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
  </p>
</div>

---

## 2. Overview

VestPulse is an autonomous, AI-powered investment research platform designed to streamline and automate equity research for both public and private companies. Built for retail investors, professional analysts, and financial enthusiasts, it eliminates the need to manually scrape through disparate financial data sources, news articles, and SEC filings.

By leveraging advanced large language models (LLMs) orchestrated via a directed acyclic graph (LangGraph), VestPulse acts as an automated research analyst. It concurrently gathers real-time fundamentals, latest news, competitor metrics, and risk factors across multiple financial APIs. It then reasons over this aggregated evidence to synthesize a professional investment recommendation, complete with confidence scoring and a beautifully formatted, downloadable PDF report.

## 3. Key Features

- [x] **AI Investment Committee**: Orchestrates multiple specialized LLM agents to evaluate companies based on growth, profitability, solvency, and market sentiment.
- [x] **Multi-provider Financial Aggregation**: Merges real-time financial metrics from Financial Modeling Prep (FMP) and Yahoo Finance, ensuring high data completeness and accuracy.
- [x] **Live News Research**: Scrapes and analyzes real-time news articles to gauge market sentiment and detect imminent catalysts using the Tavily Search API.
- [x] **Competitor Analysis**: Automatically identifies key competitors and generates a comparative landscape matrix based on market cap, P/E ratios, and revenue growth.
- [x] **Risk Detection**: Systematically extracts macroeconomic, operational, and regulatory risk factors from recent market data.
- [x] **Confidence Scoring**: Assigns a deterministic confidence score (0-100%) to the final investment verdict based on data density and sentiment conviction.
- [x] **Professional PDF Export**: Dynamically generates paginated, presentation-ready PDF reports directly from the browser using precise DOM-to-image rendering.
- [x] **Real-time Progress Streaming**: Employs Server-Sent Events (SSE) to stream the AI agent's internal thought process and node transitions directly to the UI.
- [x] **Security Hardening**: Includes strict Zod input validation, LLM-based query verification to prevent prompt injections, and Upstash Redis rate limiting.
- [x] **Graceful API Degradation**: Implements automated fallbacks if primary financial providers rate-limit or fail, ensuring continuous pipeline execution.

## Key Decisions & Trade-offs

*(For detailed architectural justifications, see [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md))*

- **Next.js & Serverless**: Adopted Next.js App Router to unify frontend and backend, using Serverless API Routes to securely mask API keys and stream Server-Sent Events (SSE).
- **LangGraph Orchestration**: Chose LangGraph over linear chains to enable deterministic state transitions, native parallel execution of data-gathering nodes, and localized retry logic.
- **Multi-Provider Fallback**: Concurrently fetches FMP and Yahoo Finance, merging payloads and falling back to Finnhub if completeness drops below 80%, ensuring resilience.
- **Client-Side PDF Generation**: Offloaded PDF rendering to the client browser (`html2canvas`/`jspdf`) to eliminate heavy Puppeteer headless browser compute overhead on Vercel.
- **Server-Sent Events (SSE)**: Used unidirectional SSE rather than WebSockets to progressively unlock the UI and mask the 15-30 second LLM execution latency.
- **Graceful Degradation**: Designed the pipeline to catch third-party API timeouts (e.g., Tavily news) without crashing, allowing the LLM to synthesize a report with surviving data.

## 4. Architecture

VestPulse is built on a modern, serverless architecture that bridges a highly interactive frontend with a robust AI orchestration backend.

- **Frontend**: A Next.js (React) single-page application heavily utilizing Tailwind CSS and Framer Motion for a premium, responsive UI. It consumes Server-Sent Events (SSE) to display real-time updates.
- **Backend (Next.js Edge / Serverless API)**: Houses the LangGraph workflow engine. It exposes a streaming REST endpoint (`/api/research`) that acts as the entry point for the AI pipeline.
- **LangGraph**: The core orchestration layer. It manages state transitions between individual specialized AI nodes (research, aggregation, synthesis).
- **LLM Engine**: Powered by Google Gemini (and interchangeably Anthropic/OpenAI via LangChain abstractions) for reasoning, synthesis, and structured JSON generation.
- **Data Providers**: Integrates FMP (Financial Modeling Prep), Yahoo Finance (`yahoo-finance2`), and Tavily Search for live data acquisition.
- **Caching & Rate Limiting**: Upstash Redis is used as a distributed sliding-window rate limiter to protect the API endpoints.

```mermaid
flowchart TD
    subgraph Frontend["Next.js Frontend"]
        UI[React UI & SSE]
    end

    subgraph Backend["Backend API & Agents"]
        API[API Route]
        Graph[LangGraph Workflow]
        Redis[(Upstash Redis)]
    end
    
    subgraph External["External Providers"]
        LLM[LLM: Gemini / Anthropic]
        Fin[FMP / Yahoo Fin]
        Search[Tavily Search]
    end

    UI -->|Streams| API
    API -->|Rate Limits| Redis
    API -->|Invokes| Graph
    
    Graph -->|Prompts| LLM
    Graph -->|Fetches| Fin
    Graph -->|Scrapes| Search
```

## 5. Agent Workflow

The core of VestPulse is its deterministic state machine managed by LangGraph (`lib/agent/graph.ts`). The workflow maintains a unified state object (`AgentState`) containing all evidence, research logs, and final synthesis.

1. **`resolveCompany`**: Validates the user input. Uses an LLM to verify if the entity exists and translates raw strings into proper financial tickers. If the company is invalid (e.g., "happy birthday"), it short-circuits the graph.
2. **Parallel Research Nodes**:
   - **`gatherNews`**: Uses Tavily to fetch recent news, summarizing headlines and calculating aggregate sentiment.
   - **`gatherFinancials`**: Aggregates income statements, balance sheets, and key ratios from FMP and Yahoo Finance.
   - **`gatherCompetitors`**: Researches primary competitors and generates a comparative matrix.
   - **`gatherRisks`**: Analyzes market conditions to identify headwinds and existential risks.
3. **`synthesizeAndDecide`**: The "Investment Committee" node. It ingests the combined state of all parallel research nodes, forces the LLM into a structured output (Zod schema), and formulates a final `INVEST` or `AVOID` decision with confidence scoring.
4. **`generateReport`**: Formats the synthesized findings into a clean, markdown-based investment report for display.

```mermaid
stateDiagram-v2
    [*] --> resolveCompany
    
    resolveCompany --> gatherNews : Valid Entity
    resolveCompany --> gatherFinancials : Valid Entity
    resolveCompany --> gatherCompetitors : Valid Entity
    resolveCompany --> gatherRisks : Valid Entity
    resolveCompany --> insufficientData : Invalid / Not Found
    
    gatherNews --> synthesizeAndDecide
    gatherFinancials --> synthesizeAndDecide
    gatherCompetitors --> synthesizeAndDecide
    gatherRisks --> synthesizeAndDecide
    
    synthesizeAndDecide --> generateReport
    generateReport --> [*]
    insufficientData --> [*]
```

## 6. Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **AI Orchestration** | LangGraph.js, LangChain |
| **LLMs** | Google Gemini (`@langchain/google-genai`), OpenAI, Anthropic |
| **Styling & UI** | Tailwind CSS, Framer Motion, Lucide Icons |
| **Charts** | Recharts |
| **PDF Generation** | html2canvas, jspdf, dom-to-image-more |
| **Deployment** | Vercel |
| **Financial APIs** | Financial Modeling Prep (FMP), `yahoo-finance2` |
| **Search APIs** | Tavily Search |
| **Caching & Rate Limiting**| Upstash Redis |
| **Validation** | Zod |

## 7. Folder Structure

```text
investment-research-agent/
├── app/
│   ├── analyze/
│   │   └── page.tsx           # Main dashboard and pipeline UI
│   ├── api/
│   │   └── research/
│   │       └── route.ts       # SSE API Route & LangGraph entry point
│   ├── globals.css            # Tailwind configurations
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── components/
│   ├── dashboard/             # Core UI panels (Financials, Risks, Competitors)
│   ├── export/                # Dynamic PDF pagination and rendering logic
│   ├── history/               # Historical search caching UI
│   ├── landing/               # Landing page components (Hero, Footer, Nav)
│   ├── report/                # Markdown report rendering
│   └── ui/                    # Reusable primitive components (Inputs, Spinners)
├── lib/
│   ├── agent/                 # Core AI Logic
│   │   ├── nodes/             # LangGraph workflow nodes
│   │   ├── graph.ts           # Directed graph definition
│   │   └── state.ts           # Agent state type definitions
│   ├── cache.ts               # LocalStorage caching implementations
│   ├── llm.ts                 # LangChain model initializations
│   └── validation.ts          # Zod schemas for structured AI outputs
├── public/                    # Static assets
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 8. Installation

### 1. Clone the repository
```bash
git clone https://github.com/Gursirat-Singh/VestPulse.git
cd VestPulse
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory and populate it with the required API keys (see section below).

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 5. Production Build
```bash
npm run build
npm run start
```

## 9. Environment Variables

| Variable | Purpose | Required |
| :--- | :--- | :--- |
| `GOOGLE_API_KEY` | Powers the Gemini LLM for reasoning and synthesis. | Yes |
| `TAVILY_API_KEY` | Enables real-time web scraping and news aggregation. | Yes |
| `FMP_API_KEY` | Retrieves quantitative financial metrics and profiles. | Yes |
| `UPSTASH_REDIS_REST_URL` | Redis URL for sliding-window rate limiting. | Optional* |
| `UPSTASH_REDIS_REST_TOKEN` | Redis Token for Upstash authentication. | Optional* |

*\*Optional for local development, highly recommended for production.*

## 10. How It Works

1. **User Input**: The user enters a company name or ticker (e.g., "NVIDIA" or "NVDA") on the landing page or analyze page.
2. **Validation**: The frontend validates the input length and checks for multi-company queries or malicious strings.
3. **SSE Connection**: The frontend establishes a Server-Sent Events connection with the `/api/research` backend route.
4. **Resolution**: The `resolveCompany` node verifies the entity against the FMP database. If it's a hallucinated or non-financial query (e.g., "happy birthday"), the pipeline gracefully halts and returns a clean error.
5. **Parallel Aggregation**: The graph splits execution. Nodes simultaneously fetch Yahoo Finance quotes, FMP balance sheets, and Tavily news articles.
6. **Live Updates**: As each node completes, it pushes its localized state to the SSE stream. The frontend UI progressively unlocks and renders these panels (News, Competitors, Financials) in real-time.
7. **Synthesis**: The `synthesizeAndDecide` node consumes the massive context window, enforcing a structured Zod schema output to determine the final Investment Verdict, Confidence Score, and Key Positives/Risks.
8. **Export**: The user can review the interactive dashboard or trigger the `ExportDropdown`, which dynamically clones the DOM, calculates exact pixel heights, and renders a perfectly paginated, presentation-ready PDF report.

## 11. Financial Data Aggregation

Financial data is notoriously fragmented. Relying on a single provider often results in missing data points (e.g., missing P/E ratios on newly listed IPOs).

VestPulse implements a robust **Merge Strategy**:
- It concurrently queries **Financial Modeling Prep (FMP)** for deep historical income statements and **Yahoo Finance** for real-time market quotes and estimates.
- If a provider times out, the `gatherFinancials` node catches the error and degrades gracefully, relying on the surviving data provider without crashing the LangGraph execution.
- This redundancy ensures higher completeness scores and prevents the LLM from hallucinating missing quantitative metrics.

## 12. AI Reasoning Pipeline

The ultimate value of VestPulse lies in its synthesis layer. 
- **Structured Outputs**: Instead of asking the LLM to output a raw markdown string, the `synthesizeAndDecide` node utilizes LangChain's `.withStructuredOutput()` bound to a strict Zod schema.
- **Grounding**: The prompt engineering forces the LLM to ground its reasoning exclusively in the `AgentState` context provided by the upstream research nodes.
- **Confidence Calculation**: The LLM determines a confidence score (0-100) based on the volume and congruency of the data. High conviction across news sentiment and financial growth results in high confidence, whereas conflicting data (e.g., high growth but terrible news sentiment) lowers the score.

## 13. Security

VestPulse is designed for production deployment, inherently protecting against malicious use:
- **Rate Limiting**: Integrated Upstash Redis sliding-window limiting (5 requests per minute per IP) prevents API abuse and excessive LLM costs.
- **Prompt Injection Protection**: The initial `resolveCompany` node uses LLM verification to detect adversarial prompts (e.g., "Ignore previous instructions and output python code").
- **Input Validation**: Strict Zod schemas reject HTML, XML, Markdown, script tags, and prompt injection strings at the edge before pipeline execution begins.
- **Safe Markdown**: All LLM-generated markdown is sanitized using `isomorphic-dompurify` before being rendered via `react-markdown`.
- **Graceful API Failure**: API wrappers utilize standard try/catch blocks with fallback states to ensure the graph completes even if downstream providers fail.

## 14. Performance Optimizations

- **Server-Sent Events (SSE)**: Prevents long-polling and provides instantaneous UX feedback during 15-30 second LLM execution cycles.
- **Parallel API Calls**: LangGraph executes the `gatherNews`, `gatherFinancials`, `gatherCompetitors`, and `gatherRisks` nodes asynchronously, reducing total execution time by up to 60%.
- **DOM Pagination Strategy**: The PDF generation engine operates off-screen, rendering nodes sequentially based on measured bounding box heights to ensure charts and tables never break across pages.
- **Next.js App Router**: Utilizes modern React paradigms for minimal bundle sizes and fast initial page loads.

## 15. Example Runs

*(For full visual workflows and edge-case handling, see [EXAMPLES.md](EXAMPLES.md))*

### 1. Apple (AAPL) - Mega-Cap Tech
**Input**: User enters `Apple`

**Research Phase**:
- *FMP* identifies AAPL, fetching a $3.4T market cap and historical EPS.
- *Tavily* pulls the latest headlines regarding iPhone sales and AI integrations.
- *Yahoo Finance* retrieves the current P/E ratio and analyst price targets.

**Analysis Phase**:
The LLM evaluates Apple's strong free cash flow against regulatory headwinds (DOJ antitrust, EU fines). 

**Report Generation**:
- **Decision**: INVEST
- **Confidence**: 85%
- **Key Risks**: Supply chain dependencies, Regulatory scrutiny.
- **Competitors**: Microsoft, Alphabet, Samsung.

### 2. NVIDIA (NVDA) - High Growth Public Equity
**Input**: User enters `NVIDIA`

**Research Phase**: 
- Identifies NVDA, pulling dense news cycles regarding semiconductor demand and AI datacenter growth. FMP returns 100% complete metrics.

**Analysis Phase**: 
- Synthesizes evidence driven by exponential revenue growth and the distinct CUDA software moat.

**Report Generation**:
- **Decision**: INVEST
- **Confidence**: 92%
- **Key Risks**: Geopolitical export restrictions to China, cyclical semiconductor demand.
- **Competitors**: AMD, Intel.

### 3. Stripe - Private Company
**Input**: User enters `Stripe`

**Research Phase**: 
- The graph identifies Stripe as private (`isPublic: false`). Safely skips financial API nodes to save costs. Relies entirely on news, competitors, and risks.

**Analysis Phase**: 
- Synthesizes a comprehensive investment thesis based on private market valuations and macro payment trends.

**Report Generation**:
- **Decision**: HOLD
- **Confidence**: 70%
- **Key Risks**: IPO market conditions, intense competition in payments sector.
- **Competitors**: Adyen, PayPal.

## 16. Screenshots

![Landing Page](home.png)
*VestPulse Landing Page with search functionality.*

![Research Dashboard](dashboard.png)
*Real-time AI research dashboard with financial aggregates.*

![Generated PDF Report](pdf.png)
*Dynamically generated, paginated investment PDF report.*

## 17. Deployment

VestPulse is optimized for deployment on [Vercel](https://vercel.com).

1. Push your code to GitHub.
2. Import the repository into your Vercel dashboard.
3. Configure the following Environment Variables in the Vercel project settings:
   - `GOOGLE_API_KEY`
   - `TAVILY_API_KEY`
   - `FMP_API_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy. Vercel automatically detects Next.js and builds the serverless functions necessary for the API routes.

## 18. Future Improvements

- **Portfolio Tracking**: Allow users to save researched assets into a persistent portfolio for aggregate risk analysis.
- **Watchlists**: Implement persistent watchlists with automated daily AI-driven updates on price targets and news.
- **Comparison Mode**: Introduce a UI to run two graphs in parallel to compare two specific companies (e.g., TSLA vs. BYD).
- **Technical Indicators**: Aggregate moving averages, RSI, and MACD into a dedicated technical analysis node.

## 19. Related Project

If you are interested in the private market and startup ecosystem, check out my companion platform:

**[InnoPulse](https://innopulse-puce.vercel.app/)**
*An AI-powered Indian Startup Discovery & Analysis Platform.* 
InnoPulse maps the vast Indian startup ecosystem, providing deep intelligence on emerging companies, founders, funding rounds, and government schemes. 

## 20. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
