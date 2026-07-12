# Design Decisions

Software engineering is fundamentally the practice of making informed trade-offs. There is rarely a perfect architecture; rather, there are decisions made to optimize for specific constraints such as time-to-market, cost, performance, and maintainability.

This document serves as an Architecture Decision Record (ADR) for **VestPulse**. It details the rationale behind every major technical choice made during the development of this AI-powered investment research platform, evaluating the selected technologies against their alternatives.

---

## 1. Why Next.js

VestPulse is built using Next.js (App Router) instead of a traditional separated stack (React SPA + Express), the MERN stack, Vite, or NestJS.

### Rationale
- **Unified Codebase**: Next.js allows for the frontend UI and backend API routes to coexist in a single repository. This drastically reduces the cognitive load of managing separate repositories, CORS configurations, and duplicated TypeScript interfaces.
- **Serverless API Routes**: The LangGraph execution and SSE stream are hosted securely on Next.js API Routes (`/api/research`). This protects sensitive API keys (Gemini, FMP, Tavily) from being exposed to the client.
- **App Router & Server Components**: While the interactive dashboard requires client-side state (`"use client"`), the overarching layout and structure benefit from server-side rendering, providing excellent initial load performance.
- **Vercel Integration**: Next.js offers zero-configuration deployment to Vercel, which natively supports streaming serverless functions essential for our Server-Sent Events architecture.

### Tradeoffs
- **Pros**: Outstanding Developer Experience (DX), seamless deployment, built-in API routes.
- **Cons**: Vendor lock-in (Vercel-optimized features), steeper learning curve compared to Vite for simple SPAs.

---

## 2. Why LangGraph

The AI orchestration is managed by LangGraph.js rather than plain LangChain, a custom orchestration script, or a massive single-prompt workflow.

### Rationale
- **Deterministic State Management**: Financial research requires precise execution. LangGraph provides a Directed Acyclic Graph (DAG) architecture where each step (node) explicitly reads and mutates a strictly typed `AgentState`. 
- **Parallel Execution**: LangGraph natively supports executing multiple nodes concurrently. Once the company is resolved, the graph fans out to gather news, financials, competitors, and risks simultaneously.
- **Resilience and Retries**: Node-based execution allows individual API calls (e.g., fetching from FMP) to fail and be caught locally without crashing the entire LLM chain.
- **Cyclic Potential**: While the current graph is mostly acyclic, LangGraph provides the foundation to easily introduce loops in the future (e.g., an agent reflecting on its own output and self-correcting).

### Tradeoffs
- **Pros**: Explicit state transitions, highly observable execution, native parallelism.
- **Cons**: High initial boilerplate, complex mental model compared to a linear script.

---

## 3. Why Gemini

Google's Gemini model (via `@langchain/google-genai`) is the core reasoning engine, preferred over OpenAI's GPT-4, Anthropic's Claude, or Groq.

### Rationale
- **Structured Outputs**: Gemini excels at adhering to strict JSON schemas (`withStructuredOutput`), which is critical for mapping the final synthesis into the deterministic React UI.
- **Speed and Context Window**: Financial research involves analyzing thousands of lines of JSON data and news articles. Gemini processes this massive context window rapidly.
- **Cost Efficiency**: The Gemini API offers an exceptionally generous free tier for developers, drastically lowering the operational cost of building and testing agentic systems compared to OpenAI or Anthropic.

### Tradeoffs
- **Pros**: Free tier availability, rapid inference, excellent long-context reasoning.
- **Cons**: Less established ecosystem tooling compared to OpenAI.

---

## 4. Why Multiple Financial Providers

Relying exclusively on a single financial API (e.g., just FMP) is a critical anti-pattern in quantitative analysis due to missing data points on newly listed IPOs, regional limitations, and API rate limits.

### Rationale
- **Aggregation and Fallback**: VestPulse queries Financial Modeling Prep (FMP) and Yahoo Finance concurrently.
- **Merge Strategy**: A custom orchestrator deeply merges the payloads and evaluates the result against a 19-field matrix (P/E, Market Cap, Revenue, etc.) to generate a completeness score.
- **Smart Retry**: If the merged completeness score falls below 80%, the system gracefully degrades by invoking a secondary fallback to **Finnhub** to fill in the missing gaps.

### Tradeoffs
- **Pros**: Extremely high data reliability, minimizes LLM hallucination due to missing data.
- **Cons**: Increased latency from multiple network requests, complex parsing and normalization logic required to align different API schemas.

---

## 5. Why Server Sent Events (SSE)

The communication between the React frontend and the LangGraph backend utilizes Server-Sent Events (SSE) instead of WebSockets, Long Polling, or standard HTTP requests.

### Rationale
- **Unidirectional Streaming**: LangGraph execution takes 15-30 seconds. WebSockets require bidirectional overhead, which is unnecessary since the client only needs to receive progress updates.
- **Simplicity**: SSE operates over standard HTTP/1.1 or HTTP/2, seamlessly traversing firewalls and avoiding complex WebSocket handshake configurations.
- **Progressive Unlocking**: As SSE pushes `event: status` and `event: result` chunks, the UI progressively unlocks dashboard panels, preventing the user from staring at a static loading spinner.

### Tradeoffs
- **Pros**: Native browser support (`ReadableStream`), no heavy WebSocket infrastructure, perfect for LLM streaming.
- **Cons**: Strictly unidirectional (server to client).

---

## 6. Why Redis

Upstash Redis is implemented for caching and rate limiting.

### Rationale
- **Cost Optimization**: Financial API calls and LLM tokens are expensive. By caching the `AgentState` results and raw API responses, repeated queries for popular stocks (e.g., Apple, Tesla) resolve instantly.
- **TTL Strategy**: Financial fundamentals and news are cached with a 24-hour Time-To-Live (TTL). Intra-day volatility does not fundamentally change long-term investment research metrics.
- **Rate Limiting**: Protects the API against abuse by utilizing Upstash's sliding-window algorithm, restricting users to 5 requests per minute.

### Tradeoffs
- **Pros**: Serverless compatibility, ultra-low latency, protects infrastructure.
- **Cons**: Slight risk of serving slightly stale data during active market hours.

---

## 7. Why TailwindCSS

TailwindCSS was selected over CSS Modules, Styled Components, or Bootstrap.

### Rationale
- **Utility-First Speed**: Allows for rapid iteration directly within React components without context-switching to CSS files.
- **Maintainability**: Eliminates the problem of dead CSS code and naming collisions.
- **Design System**: Integrates seamlessly with our custom glassmorphism requirements, absolute positioning for the PDF rendering engine, and dark-theme configurations.

### Tradeoffs
- **Pros**: Highly performant, extremely fast development cycle.
- **Cons**: Cluttered JSX markup.

---

## 8. Why Recharts

Recharts is the charting library used to visualize the financial fundamentals (BarCharts, LineCharts, RadarCharts, PieCharts).

### Rationale
- **React Native Compatibility**: Built specifically for React using composable components, making it highly declarative.
- **Dashboard Focus**: Provides excellent out-of-the-box defaults for axes, tooltips, and responsive containers which scale perfectly for our dashboard layout.

### Tradeoffs
- **Pros**: Easy to integrate, highly customizable, declarative syntax.
- **Cons**: Heavier bundle size compared to canvas-based libraries like Chart.js.

---

## 9. Why PDF Export

The platform dynamically generates a downloadable PDF of the research dashboard.

### Rationale
- **Professional Utility**: Financial analysts and retail investors frequently need to share findings offline, attach them to emails, or present them to committees.
- **Internship / Recruiter Usability**: Proves the application is a production-grade tool capable of generating tangible, shareable artifacts.
- **Implementation**: Generating PDFs client-side using `html2canvas` and `jspdf` avoids heavy server-side puppeteer headless browser setups, saving significant backend compute costs.

---

## 10. Why Parallel Research

Instead of sequential execution (fetch news, then fetch financials, then fetch competitors), the LangGraph nodes execute concurrently.

### Rationale
- **Performance**: Fetching from 4 different external providers sequentially would take roughly 4-8 seconds. Fanning out executing them in parallel resolves the entire data-gathering phase in the time it takes the slowest API to respond (~1.5 seconds).
- **Decoupled Logic**: News scraping does not depend on financial metrics, meaning they are perfectly suited for parallelization.

---

## 11. Why Graceful Degradation

The system is designed to never completely fail if a non-critical component goes offline.

### Rationale
- **Resilience**: If the Tavily Search API goes down, the `gatherNews` node catches the error, appends it to the `degraded` array in state, and continues. The LLM is instructed to evaluate the company based on financials alone.
- **UX Transparency**: The frontend reads the `degraded` array and alerts the user that a specific component (e.g., News) is unavailable, while still rendering the rest of the dashboard perfectly.

---

## 12. Security Decisions

| Security Mechanism | Implementation | Rationale |
| :--- | :--- | :--- |
| **Input Validation** | Zod schema on API Route | Prevents excessively long strings, HTML, and XML payloads from hitting the LLM or DB. |
| **Prompt Injection Protection** | LLM Verification in `resolveCompany` | Rejects inputs like "Ignore previous instructions" by ensuring the input maps to a valid public equity. |
| **Rate Limiting** | Upstash Redis | Prevents malicious actors from exhausting API quotas. |
| **Markdown Sanitization** | `isomorphic-dompurify` | Mitigates XSS vulnerabilities by stripping malicious scripts from LLM-generated markdown before rendering. |

---

## 13. UX Decisions

- **Progress Streaming**: Showing a static spinner for 20 seconds is terrible UX. By streaming internal LangGraph node transitions ("Scanning recent news coverage...", "Synthesizing research..."), the user perceives the wait time as active work.
- **Glassmorphism & Dark Theme**: Provides a premium, institutional-grade aesthetic common in modern fintech applications.
- **Dynamic Pagination**: The PDF engine recursively calculates DOM bounding boxes to ensure charts and paragraphs are never awkwardly split across page breaks.

---

## 14. Performance Decisions

- **Dynamic Imports**: Large components like `Recharts` and `PDFReportView` are likely lazily loaded or optimized by Next.js to reduce initial bundle size.
- **Parallel API Resolution**: As detailed in section 10, the fan-out architecture slashes network latency.
- **Off-screen Rendering**: The PDF generation engine builds the report in an absolute positioned `-9999px` off-screen div, preventing layout thrashing on the main visible dashboard.

---

## 15. Decisions NOT Taken

Several common features were explicitly excluded to maintain a tight project scope and focus on the core value proposition (AI reasoning).

- **Authentication & Databases**: Implementing NextAuth and PostgreSQL was skipped. The application acts as a stateless utility. This removes infrastructure overhead and complies with strict data privacy since no user data is stored.
- **Real-time Streaming Market Data**: WebSockets streaming live tick-by-tick stock prices were avoided. VestPulse is for long-term fundamental investment research, not high-frequency day trading.
- **Vector Database / RAG**: We do not store 10-K filings in a vector database like Pinecone. The APIs provide sufficient fundamental data without the added latency and complexity of semantic search.

---

## 16. Lessons Learned

- **LLM Hallucinations**: Prompt engineering alone is insufficient to stop hallucinations in financial contexts. Forcing the LLM into a structured output (`z.object`) and strictly tying it to an aggregated `AgentState` is the only way to ensure mathematical accuracy.
- **API Fragility**: Relying on third-party financial APIs taught the absolute necessity of defensive programming. Implementing the Finnhub fallback logic drastically increased system reliability.
- **Agentic Systems**: Managing state in autonomous agents can quickly become spaghetti code. LangGraph's explicit node-and-edge architecture provided the rigorous framework necessary to debug complex parallel executions.
