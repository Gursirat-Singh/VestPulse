"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAggregatedFinancialData = fetchAggregatedFinancialData;
const fmp_1 = require("./providers/fmp");
const yahoo_1 = require("./providers/yahoo");
const finnhub_1 = require("./providers/finnhub");
const merge_1 = require("./merge");
const fmp = new fmp_1.FmpProvider();
const yahoo = new yahoo_1.YahooProvider();
const finnhub = new finnhub_1.FinnhubProvider();
const ALL_19_FIELDS = [
    "Company Name", "Ticker", "Market Cap", "Current Price", "Sector", "Industry",
    "Description", "Employee Count", "52 Week Low", "52 Week High", "PE Ratio",
    "ROE", "Cash", "Debt", "Revenue", "Net Income", "Operating Income", "EPS", "Profit Margin"
];
function getSafeEmptyFinancials(ticker) {
    return {
        profile: {
            companyName: "",
            ticker,
            price: 0,
            marketCap: 0,
            range: "N/A",
            beta: 0,
            sector: "",
            industry: "",
            image: "",
            website: "",
            dividendYield: 0,
            description: ""
        },
        historical: [],
        ratios: {
            peRatio: 0,
            psRatio: 0,
            pbRatio: 0,
            pegRatio: 0,
            evToEbitda: 0,
            grossMargin: 0,
            roe: 0,
            debtToEquity: 0,
            currentRatio: 0
        },
        estimates: {
            targetLow: 0,
            targetAvg: 0,
            targetHigh: 0,
            epsAvg: 0
        },
        metrics: {},
        sources: []
    };
}
async function fetchAggregatedFinancialData(ticker) {
    const cleanTicker = ticker.trim().toUpperCase();
    try {
        // 1. Concurrent Fetch primary providers: FMP and Yahoo Finance
        const [fmpResult, yahooResult] = await Promise.allSettled([
            fmp.fetchData(cleanTicker),
            yahoo.fetchData(cleanTicker)
        ]);
        let fmpData = null;
        let yahooData = null;
        if (fmpResult.status === "fulfilled" && fmpResult.value) {
            fmpData = fmpResult.value;
        }
        if (yahooResult.status === "fulfilled" && yahooResult.value) {
            yahooData = yahooResult.value;
        }
        // 2. Initial Merge & Quality Check
        let mergedData = (0, merge_1.mergeFinancialMetrics)(fmpData, yahooData);
        let completenessReport = (0, merge_1.calculateCompletenessScore)(mergedData);
        const providersUsed = [];
        if (fmpData)
            providersUsed.push("FMP");
        if (yahooData)
            providersUsed.push("Yahoo Finance");
        let finnhubData = null;
        // 3. Smart Retry logic: Fetch Finnhub if completeness score is below 80%
        if (completenessReport.score < 80 && process.env.FINNHUB_API_KEY) {
            console.log(`Aggregator: Completeness (${completenessReport.score}%) < 80% for ${cleanTicker}. Attempting Smart Retry via Finnhub...`);
            try {
                finnhubData = await finnhub.fetchData(cleanTicker);
                if (finnhubData) {
                    providersUsed.push("Finnhub");
                    // Merge with Finnhub as tertiary source
                    mergedData = (0, merge_1.mergeFinancialMetrics)(fmpData, yahooData, finnhubData);
                    completenessReport = (0, merge_1.calculateCompletenessScore)(mergedData);
                }
            }
            catch (fErr) {
                console.error(`Aggregator: Smart Retry via Finnhub failed for ${cleanTicker}`, fErr);
            }
        }
        // Individual coverages for logging
        const fmpScore = fmpData ? (0, merge_1.calculateCompletenessScore)((0, merge_1.mergeFinancialMetrics)(fmpData)) : null;
        const yahooScore = yahooData ? (0, merge_1.calculateCompletenessScore)((0, merge_1.mergeFinancialMetrics)(yahooData)) : null;
        const finnhubScore = finnhubData ? (0, merge_1.calculateCompletenessScore)((0, merge_1.mergeFinancialMetrics)(finnhubData)) : null;
        // 4. Orchestrator Logging
        console.log(`\n==============================`);
        console.log(`Financial Orchestrator`);
        console.log(`==============================`);
        console.log(`Resolving: ${cleanTicker}`);
        if (fmpScore) {
            console.log(`FMP`);
            console.log(`Coverage ${fmpScore.score}%`);
            if (fmpScore.missingFields.length > 0) {
                console.log(`Missing: ${fmpScore.missingFields.slice(0, 6).join(", ")}${fmpScore.missingFields.length > 6 ? "..." : ""}`);
            }
        }
        else {
            console.log(`FMP: Coverage 0% (Unavailable)`);
        }
        if (yahooScore) {
            console.log(`Yahoo`);
            console.log(`Coverage ${yahooScore.score}%`);
            if (fmpScore) {
                const filledByYahoo = fmpScore.missingFields.filter(f => !yahooScore.missingFields.includes(f));
                if (filledByYahoo.length > 0) {
                    console.log(`Filled: ${filledByYahoo.slice(0, 6).join(", ")}${filledByYahoo.length > 6 ? "..." : ""}`);
                }
            }
        }
        else {
            console.log(`Yahoo: Coverage 0% (Unavailable)`);
        }
        if (finnhubScore) {
            console.log(`Finnhub`);
            console.log(`Coverage ${finnhubScore.score}%`);
            if (fmpScore || yahooScore) {
                const prevMerged = (0, merge_1.mergeFinancialMetrics)(fmpData, yahooData);
                const prevScore = (0, merge_1.calculateCompletenessScore)(prevMerged);
                const filledByFinnhub = prevScore.missingFields.filter(f => !finnhubScore.missingFields.includes(f));
                if (filledByFinnhub.length > 0) {
                    console.log(`Filled: ${filledByFinnhub.join(", ")}`);
                }
            }
        }
        console.log(`Merged Coverage`);
        console.log(`${completenessReport.score}%`);
        console.log(`Final Provider Count`);
        console.log(`${providersUsed.length}`);
        console.log(`Research Continuing...`);
        console.log(`==============================\n`);
        return {
            metrics: mergedData,
            completeness: completenessReport.score,
            providersUsed,
            missingFields: completenessReport.missingFields
        };
    }
    catch (err) {
        console.error(`Orchestrator: Fatal error during financial data aggregation for ${cleanTicker}`, err);
        return {
            metrics: getSafeEmptyFinancials(cleanTicker),
            completeness: 0,
            providersUsed: [],
            missingFields: ALL_19_FIELDS
        };
    }
}
