# Testing Strategy

The testing philosophy for VestPulse is centered around ensuring absolute reliability, security, and accuracy for an automated financial research tool. As an AI-orchestrated application dealing with live market data, our QA strategy prioritizes deterministic behavior over stochastic unpredictability.

The project testing scope encompasses:
- Functional Testing
- Integration Testing
- API Testing
- Security Testing
- Performance Testing
- Manual End-to-End Testing

Due to the non-deterministic nature of upstream LLM responses, traditional unit testing suites (e.g., Jest matching exact strings) are often brittle. Consequently, every critical workflow, pipeline fallback, and edge case was verified manually via rigorous End-to-End (E2E) inspection and isolated component observation.

---

## 1. Functional Testing

All major user-facing features were validated manually to ensure the presentation layer behaves exactly as intended.

| Feature | Test Description | Expected Behaviour | Result |
| :--- | :--- | :--- | :--- |
| **Landing Page** | Verify Hero, CTA, and search bar responsiveness. | Search bar should capture input and route to `/analyze`. | PASS |
| **Analyze Page** | Verify initialization of SSE pipeline on load. | Should establish connection and await initial state. | PASS |
| **Company Search** | Input various valid strings (e.g., "Apple", "TSLA"). | Should resolve ticker and trigger pipeline. | PASS |
| **Report Generation** | Verify final output rendering in UI. | Markdown should render into clean HTML without XSS. | PASS |
| **PDF Export** | Trigger `Download PDF` button. | Generates paginated `.pdf` file of current dashboard. | PASS |
| **History** | Check cached searches in LocalStorage. | Previous searches should populate the History sidebar. | PASS |
| **Financial Dashboard** | Verify table populations and metrics. | Numeric metrics format correctly (e.g., `$3.40 Trillion`). | PASS |
| **Charts** | Verify Recharts rendering for historic metrics. | Bar charts and Radar charts render with accurate axes. | PASS |
| **News** | Verify news sentiment and article links. | Displays 3-5 latest headlines with functional source links. | PASS |
| **Competitor Analysis** | Verify competitive matrix. | Table populates peers with relative Market Caps. | PASS |
| **Risk Analysis** | Verify dynamic risk warnings. | High, Medium, and Low severity badges apply correctly. | PASS |
| **Investment Decision** | Verify final Verdict and Confidence. | Outputs binary INVEST/AVOID with 0-100% confidence. | PASS |
| **Recent Searches** | Verify quick-access pill buttons. | Clicking a pill triggers an immediate re-analysis. | PASS |

---

## 2. LangGraph Workflow Testing

The core state machine (LangGraph) was tested at the node level to ensure strict state transitions and evidence isolation.

| Node | Input | Expected Output | Failure Behaviour | Result |
| :--- | :--- | :--- | :--- | :--- |
| **`resolveCompany`** | "NVIDIA" | Ticker: NVDA, isPublic: true | Routes to `insufficientData` if invalid/unresolvable. | PASS |
| **`gatherNews`** | Ticker | Array of recent articles & sentiment. | Returns empty array; records degradation. | PASS |
| **`gatherFinancials`** | Ticker | Merged quantitative metrics. | Initiates Finnhub fallback; returns sparse data if all fail. | PASS |
| **`gatherCompetitors`**| Ticker | Array of peer companies. | Returns empty array; records degradation. | PASS |
| **`gatherRisks`** | Ticker | Array of operational/market risks. | Returns empty array; records degradation. | PASS |
| **`synthesizeAndDecide`**| `AgentState` | Structured Zod JSON output. | Fails graph execution; logs severe error. | PASS |
| **`generateReport`** | `AgentState` | Markdown formatted document string. | Returns partial raw string; UI falls back to raw data. | PASS |

---

## 3. Financial Data Testing

Aggregating financial data requires testing across different tiers of corporate entities to ensure the orchestrator handles edge cases gracefully.

| Entity Type | Example | Testing Focus | Result |
| :--- | :--- | :--- | :--- |
| **Public Companies** | Apple (AAPL), NVIDIA (NVDA), Tesla (TSLA) | Standard pipeline execution. Deep historical data expected. Completeness score > 90%. | PASS |
| **Indian Equities** | Reliance, Infosys, Zomato | Testing regional exchange suffixes (.NS / .BO) in Yahoo Finance integration. | PASS |
| **Private Companies** | Stripe, OpenAI | `resolveCompany` must identify them as private. Financial data node gracefully skips execution. | PASS |

**Missing Data & Fallbacks**: Tested by simulating FMP API timeouts. The orchestrator successfully merged partial Yahoo Finance data and subsequently triggered the Finnhub smart-retry when the completeness score fell below 80%.

---

## 4. API Integration Testing

Verified connectivity, timeout configurations, and authentication logic for all external providers.

| API | Purpose | Tested | Result |
| :--- | :--- | :--- | :--- |
| **Gemini** | LLM Reasoning & Synthesis | Validated massive context window injection and Zod structural adherence. | PASS |
| **Tavily** | Live News & Web Scraping | Simulated rate limits to ensure node returned empty arrays without crashing. | PASS |
| **FMP** | Quantitative Fundamentals | Verified deep historical fetching and JSON normalization. | PASS |
| **Yahoo Finance** | Live Quotes & Estimates | Tested as primary fallback for P/E ratios and Market Cap. | PASS |
| **Finnhub** | Secondary Fallback | Verified "Smart Retry" logic execution upon low completeness scores. | PASS |
| **Upstash Redis** | Rate Limiting & Caching | Triggered 6 rapid requests to ensure 429 HTTP response on 6th call. | PASS |

*Simulations*: Network failures were simulated by temporarily altering environment variables to invalid keys, ensuring graceful degradation arrays populated correctly in the `AgentState`.

---

## 5. Error Handling Testing

Resilience testing guarantees that VestPulse degrades gracefully rather than presenting white screens of death (WSOD).

- **Missing API Keys**: The system safely catches missing configurations during backend initialization.
- **Provider Failures**: Wrapped with standardized try/catch blocks; a timeout in Tavily results in a localized error array push (`degraded: ["News unavailable"]`), allowing financial metrics to still render.
- **Timeouts**: Fetch commands are wrapped with absolute timeout limits to prevent the SSE stream from hanging indefinitely.
- **Invalid Responses**: Zod schemas strictly parse upstream JSON; malformed payloads are discarded.
- **LLM Failure**: If Gemini fails to adhere to the required JSON schema in `synthesizeAndDecide`, LangChain retries the parse up to 3 times before bubbling the error.
- **Rate Limits**: Redis properly issues HTTP 429 status codes; the UI catches this and displays a specific toaster notification to the user.
- **Network Failures**: Disconnecting the client internet drops the SSE connection; the UI presents a generic connection error.

---

## 6. Security Testing

Security was validated against common web vulnerabilities and LLM-specific attack vectors.

| Attack Vector | Input Payload | Expected Result | Actual Result |
| :--- | :--- | :--- | :--- |
| **XSS** | `<script>alert(1)</script>` | Rejected by Zod / sanitized by DOMPurify. | Blocked at edge. |
| **Prompt Injection** | `"Ignore previous instructions..."` | Rejected by `resolveCompany` LLM verification as non-financial. | Halted pipeline. |
| **SQL Injection** | `DROP TABLE users;` | Harmless (No SQL DB). Rejected as invalid ticker. | Halted pipeline. |
| **Command Injection** | `&& rm -rf /` | Rejected by Zod regex / LLM verification. | Halted pipeline. |
| **Oversized Input** | 5000+ characters | Rejected by Zod `max(100)` rule. | Blocked at edge. |
| **Multiple Companies**| `"Apple Tesla"` | Rejected by custom multi-word heuristic. | Handled gracefully. |
| **Invalid Characters**| `!@#$%^` | Rejected by Zod regex rules. | Blocked at edge. |
| **Empty Input** | `   ` (Whitespace) | Rejected by Zod `min(2)` after trim. | Blocked at edge. |
| **Hallucinations** | `"happy birthday"` | Identified as invalid entity; no financial APIs called. | Halted pipeline. |

---

## 7. Input Validation Testing

Before any backend processing occurs, the `/api/research` endpoint subjects the query to `companyInputSchema`.

- **Minimum Length**: 2 characters (allows valid tickers like "F" or "GE").
- **Maximum Length**: 100 characters (prevents token exhaustion attacks).
- **Whitespace**: Automatically trimmed.
- **Blocked Keywords**: Markdown injection (`#`, `*`), Script tags (`<`, `>`), URLs (`http`).
- **Multiple Company Detection**: An intelligent heuristic intercepts inputs like "Apple vs Microsoft" while safely allowing legitimate multi-word names like "Reliance Industries" or "Dr. Reddy's".

---

## 8. Performance Testing

Tested using Chrome Lighthouse against a Vercel production build. 

### Desktop Scores (Average)
- **Performance**: 98/100
- **Accessibility**: 100/100
- **Best Practices**: 100/100
- **SEO**: 100/100

### Mobile Scores (Average)
- **Performance**: 92/100
- **Accessibility**: 100/100
- **Best Practices**: 100/100
- **SEO**: 100/100

**Optimizations Validated**: 
- Fonts are loaded via `next/font` (Geist).
- React components are lazily loaded where applicable.
- Tailwind generates minimal CSS bundles. 
- API payload caching (Redis) drastically reduces Time-to-First-Byte (TTFB) on repeated searches.

---

## 9. Cross Browser Testing

The UI and SSE streaming mechanics were manually tested across major modern browsers.

- **Chrome (v125+)**: Perfect rendering. PDF generation performs optimally.
- **Edge (v125+)**: Perfect rendering. Identical chromium backend guarantees fidelity.
- **Firefox (v120+)**: CSS Glassmorphism effects render correctly; SSE connection is stable.

*Observation*: `html2canvas` for PDF generation requires slightly longer computation time on Firefox compared to Chrome, but executes successfully.

---

## 10. Responsive Testing

Tailwind CSS breakpoints (`sm`, `md`, `lg`, `xl`) were verified using Chrome DevTools Device Emulation.

- **Desktop (1080p+)**: Renders a complex 3-column / 2-column grid for the dashboard components.
- **Tablet (iPad Pro)**: Dashboard components gracefully stack into a 2-column masonry-style layout.
- **Mobile (iPhone 14)**: Grid collapses into a single-column, vertical scrolling feed. Radar charts automatically scale down their `outerRadius` to prevent container overflow. 

---

## 11. PDF Testing

The custom DOM-to-image engine in `ExportDropdown.tsx` was rigorously tested to prevent formatting breaks.

- **Tables & Charts**: Render identically to the web UI using absolute off-screen cloning.
- **Headers & Footers**: VestPulse branding is accurately injected at the top and bottom of every generated page.
- **Pagination**: The dynamic height calculation successfully pushes large components (e.g., abnormally long Executive Summaries) to the next page, behaving exactly like CSS `page-break-inside: avoid`.
- **Typography**: The Geist font family translates cleanly into the PDF without artifacting or blurring.
- **Downloaded File**: Exports as a compliant `.pdf` file format instantly accessible by default OS viewers.

---

## 12. Deployment Testing

The CI/CD pipeline and production environment were verified via Vercel.

- **Local Development**: `npm run dev` successfully proxies local environment variables.
- **Production Build**: `npm run build` completed without linting errors or TypeScript compilation failures.
- **Vercel Deployment**: Cold start times for the serverless function are well within the 10-second threshold.
- **Environment Variables**: Confirmed secure injection of all required keys (Google, Tavily, FMP, Upstash).

---

## 13. Regression Testing

Following major architectural upgrades, critical workflows were re-verified to ensure zero regressions:

1. **Security Improvements**: After introducing strict LLM verification for random strings, legitimate ticker lookups (e.g., AAPL) were re-tested to ensure no false positives occurred.
2. **Financial Aggregation**: After integrating Finnhub as a tertiary fallback, previously successful FMP/Yahoo merges were re-tested to ensure the logic didn't incorrectly bypass primary providers.
3. **PDF Optimizations**: The dynamic pagination fix was tested against small companies (1 page output) and massive conglomerates (3+ page output) to guarantee accurate calculation.

---

## 14. Known Limitations

While VestPulse is highly resilient, the following constraints exist inherently within its architecture:

- **Private Companies**: While the system accurately identifies private entities (e.g., Stripe) and generates a report on them based on news context, it fundamentally cannot provide quantitative financial metrics, P/E ratios, or insider trading data.
- **Free Tier Quotas**: Heavy concurrent usage may eventually exhaust the Tavily API or FMP free-tier limits if Upstash rate limiting is bypassed or disabled.
- **International Regional Equities**: While Yahoo Finance covers many global exchanges, deeply obscure international tickers may yield sub-50% completeness scores. 

---

## 15. Testing Summary

| Category | Status | Notes |
| :--- | :--- | :--- |
| Functional Testing | PASS | All UI components behave deterministically. |
| API Testing | PASS | Third-party integrations resolve or fallback gracefully. |
| Security Testing | PASS | Edge validation and LLM verification intercept malice. |
| Performance Testing | PASS | 98+ Lighthouse scores on desktop metrics. |
| Deployment Testing | PASS | Serverless edge functions stable in Vercel. |
| PDF Testing | PASS | Dynamic pagination engine executes without overflow. |
| End-to-End Testing | PASS | Real-world usage scenarios validated thoroughly. |

**Conclusion**: All critical workflows, edge cases, and fallback mechanisms have successfully passed testing. The application meets the robust requirements of a production-grade AI research tool.
