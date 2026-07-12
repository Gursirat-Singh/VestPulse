"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YahooProvider = void 0;
const yahoo_finance2_1 = require("yahoo-finance2");
// Instantiate yahooFinance with suppressNotices option
const yahooFinance = new yahoo_finance2_1.default({ suppressNotices: ["yahooSurvey"] });
class YahooProvider {
    name = "YahooFinance";
    async fetchData(ticker) {
        const cleanTicker = ticker.trim().toUpperCase();
        console.log(`\n========== YahooProvider Fetching Data (${cleanTicker}) ==========`);
        try {
            // Fetch quote summary and annual fundamentals in parallel
            const [quoteResult, fundamentalsResult] = await Promise.allSettled([
                yahooFinance.quoteSummary(cleanTicker, {
                    modules: [
                        "price",
                        "summaryProfile",
                        "financialData",
                        "defaultKeyStatistics",
                        "summaryDetail"
                    ]
                }),
                yahooFinance.fundamentalsTimeSeries(cleanTicker, {
                    period1: "2020-01-01",
                    period2: new Date().toISOString().substring(0, 10),
                    type: "annual",
                    module: "all"
                })
            ]);
            let quote = null;
            let fundamentalsRaw = [];
            if (quoteResult.status === "fulfilled" && quoteResult.value) {
                quote = quoteResult.value;
            }
            else if (quoteResult.status === "rejected") {
                console.warn(`YahooProvider: Failed to fetch quote summary for ${cleanTicker}`, quoteResult.reason);
            }
            if (fundamentalsResult.status === "fulfilled" && Array.isArray(fundamentalsResult.value)) {
                fundamentalsRaw = fundamentalsResult.value;
            }
            else if (fundamentalsResult.status === "rejected") {
                console.warn(`YahooProvider: Failed to fetch fundamentals for ${cleanTicker}`, fundamentalsResult.reason);
            }
            // If we couldn't get any quote summary, we don't have enough to build the profile
            if (!quote) {
                console.warn(`YahooProvider: No quote summary available for ${cleanTicker}`);
                return null;
            }
            // 1. Build Profile
            const low = quote.summaryDetail?.fiftyTwoWeekLow;
            const high = quote.summaryDetail?.fiftyTwoWeekHigh;
            const range = (low !== undefined && high !== undefined) ? `${low}-${high}` : "N/A";
            const profile = {
                companyName: quote.price?.shortName || quote.price?.longName || "",
                ticker: cleanTicker,
                price: quote.financialData?.currentPrice || quote.price?.regularMarketPrice || 0,
                marketCap: quote.price?.marketCap || 0,
                range,
                beta: quote.defaultKeyStatistics?.beta || quote.summaryDetail?.beta || 0,
                sector: quote.summaryProfile?.sector || "",
                industry: quote.summaryProfile?.industry || "",
                image: "", // Yahoo doesn't host logo images directly in this endpoint
                website: quote.summaryProfile?.website || "",
                dividendYield: quote.summaryDetail?.dividendYield || quote.financialData?.dividendYield || 0,
                description: quote.summaryProfile?.longBusinessSummary || ""
            };
            // 2. Build Historical financials
            const historical = [];
            fundamentalsRaw.forEach((item) => {
                if (item && item.date) {
                    const dateObj = new Date(item.date);
                    const year = isNaN(dateObj.getTime()) ? "" : dateObj.getFullYear().toString();
                    // Only keep year records if they contain some actual numerical data
                    const hasData = item.totalRevenue !== undefined ||
                        item.netIncome !== undefined ||
                        item.freeCashFlow !== undefined ||
                        item.grossProfit !== undefined ||
                        item.operatingIncome !== undefined;
                    if (year && hasData) {
                        historical.push({
                            year,
                            revenue: item.totalRevenue || 0,
                            grossProfit: item.grossProfit || 0,
                            operatingIncome: item.operatingIncome || 0,
                            netIncome: item.netIncome || 0,
                            eps: item.dilutedEPS || item.basicEPS || 0,
                            freeCashFlow: item.freeCashFlow || 0
                        });
                    }
                }
            });
            // Sort chronological, oldest to newest
            historical.sort((a, b) => a.year.localeCompare(b.year));
            // 3. Build Ratios
            const ratios = {
                peRatio: quote.summaryDetail?.trailingPE || quote.summaryDetail?.forwardPE || quote.defaultKeyStatistics?.forwardPE || 0,
                psRatio: quote.summaryDetail?.priceToSalesTrailing12Months || 0,
                pbRatio: quote.defaultKeyStatistics?.priceToBook || 0,
                pegRatio: quote.defaultKeyStatistics?.pegRatio || 0,
                evToEbitda: quote.defaultKeyStatistics?.enterpriseToEbitda || 0,
                grossMargin: quote.financialData?.grossMargins || 0,
                roe: quote.financialData?.returnOnEquity || 0,
                debtToEquity: quote.financialData?.debtToEquity || 0,
                currentRatio: quote.financialData?.currentRatio || 0
            };
            // 4. Build Estimates
            const parsedEstimates = {
                targetLow: quote.financialData?.targetLowPrice || 0,
                targetAvg: quote.financialData?.targetMeanPrice || 0,
                targetHigh: quote.financialData?.targetHighPrice || 0,
                epsAvg: quote.defaultKeyStatistics?.forwardEps || 0
            };
            // Fallback target prices based on range if missing
            if (!parsedEstimates.targetLow && range !== "N/A") {
                const parts = range.split("-");
                if (parts.length === 2) {
                    const rLow = parseFloat(parts[0]);
                    const rHigh = parseFloat(parts[1]);
                    if (!isNaN(rLow) && !isNaN(rHigh)) {
                        parsedEstimates.targetLow = rLow;
                        parsedEstimates.targetHigh = rHigh * 1.25;
                        parsedEstimates.targetAvg = (rLow + rHigh) / 2;
                    }
                }
            }
            // Collect URLs that returned data successfully as sources
            const sources = [];
            if (quote) {
                sources.push(`https://finance.yahoo.com/quote/${cleanTicker}`);
            }
            return {
                profile,
                historical,
                ratios,
                estimates: parsedEstimates,
                sources
            };
        }
        catch (err) {
            console.error(`YahooProvider: Financial fetch failed for ${cleanTicker}`, err);
            return null;
        }
    }
}
exports.YahooProvider = YahooProvider;
