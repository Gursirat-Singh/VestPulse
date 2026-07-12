"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FmpProvider = void 0;
class FmpProvider {
    name = "FinancialModelingPrep";
    async fetchData(ticker) {
        const apiKey = process.env.FMP_API_KEY;
        if (!apiKey) {
            console.warn("FmpProvider: Missing FMP_API_KEY");
            return null;
        }
        const cleanTicker = ticker.trim().toUpperCase();
        console.log(`\n========== FmpProvider Fetching Stable Data (${cleanTicker}) ==========`);
        const profileUrl = `https://financialmodelingprep.com/stable/profile?symbol=${cleanTicker}&apikey=${apiKey}`;
        const incomeUrl = `https://financialmodelingprep.com/stable/income-statement?symbol=${cleanTicker}&period=annual&limit=5&apikey=${apiKey}`;
        const cashFlowUrl = `https://financialmodelingprep.com/stable/cash-flow-statement?symbol=${cleanTicker}&period=annual&limit=5&apikey=${apiKey}`;
        const metricsUrl = `https://financialmodelingprep.com/stable/key-metrics-ttm?symbol=${cleanTicker}&apikey=${apiKey}`;
        const ratiosUrl = `https://financialmodelingprep.com/stable/ratios-ttm?symbol=${cleanTicker}&apikey=${apiKey}`;
        const estimatesUrl = `https://financialmodelingprep.com/stable/analyst-estimates?symbol=${cleanTicker}&period=annual&limit=1&apikey=${apiKey}`;
        try {
            const [profileResult, incomeResult, cashFlowResult, metricsResult, ratiosResult, estimatesResult] = await Promise.allSettled([
                fetch(profileUrl),
                fetch(incomeUrl),
                fetch(cashFlowUrl),
                fetch(metricsUrl),
                fetch(ratiosUrl),
                fetch(estimatesUrl)
            ]);
            let profileRaw = null;
            let incomeRaw = [];
            let cashFlowRaw = [];
            let metricsRaw = null;
            let ratiosRaw = null;
            let estimatesRaw = null;
            // Helper to extract JSON from settlement results
            const extractJson = async (res) => {
                if (res.status === "fulfilled" && res.value.ok) {
                    const json = await res.value.json();
                    if (json && !json["Error Message"]) {
                        return json;
                    }
                }
                return null;
            };
            const pJson = await extractJson(profileResult);
            if (Array.isArray(pJson) && pJson.length > 0)
                profileRaw = pJson[0];
            const iJson = await extractJson(incomeResult);
            if (Array.isArray(iJson))
                incomeRaw = iJson;
            const cfJson = await extractJson(cashFlowResult);
            if (Array.isArray(cfJson))
                cashFlowRaw = cfJson;
            const mJson = await extractJson(metricsResult);
            if (Array.isArray(mJson) && mJson.length > 0)
                metricsRaw = mJson[0];
            const rJson = await extractJson(ratiosResult);
            if (Array.isArray(rJson) && rJson.length > 0)
                ratiosRaw = rJson[0];
            const eJson = await extractJson(estimatesResult);
            if (Array.isArray(eJson) && eJson.length > 0)
                estimatesRaw = eJson[0];
            // If literally nothing succeeded
            if (!profileRaw && incomeRaw.length === 0 && !metricsRaw && !ratiosRaw) {
                console.warn(`FmpProvider: No financial information available for ${cleanTicker}`);
                return null;
            }
            // Build the expanded Profile structure
            const profile = {
                companyName: profileRaw?.companyName || "",
                ticker: cleanTicker,
                price: profileRaw?.price || 0,
                marketCap: profileRaw?.marketCap || 0,
                range: profileRaw?.range || "N/A",
                beta: profileRaw?.beta || 0,
                sector: profileRaw?.sector || "",
                industry: profileRaw?.industry || "",
                image: profileRaw?.image || "",
                website: profileRaw?.website || "",
                dividendYield: ratiosRaw?.dividendYieldTTM || 0,
                description: profileRaw?.description || ""
            };
            // Parse up to 5 years of historical financial items
            // Align income statement and cash flows by year
            const historicalMap = {};
            incomeRaw.forEach((inc) => {
                const year = inc.calendarYear || inc.fiscalYear || inc.date?.substring(0, 4) || "";
                if (year) {
                    historicalMap[year] = {
                        year,
                        revenue: inc.revenue || 0,
                        grossProfit: inc.grossProfit || 0,
                        operatingIncome: inc.operatingIncome || 0,
                        netIncome: inc.netIncome || 0,
                        eps: inc.eps || 0,
                        freeCashFlow: 0
                    };
                }
            });
            cashFlowRaw.forEach((cf) => {
                const year = cf.calendarYear || cf.fiscalYear || cf.date?.substring(0, 4) || "";
                if (year) {
                    if (!historicalMap[year]) {
                        historicalMap[year] = { year, revenue: 0, grossProfit: 0, operatingIncome: 0, netIncome: 0, eps: 0 };
                    }
                    historicalMap[year].freeCashFlow = cf.freeCashFlow || 0;
                }
            });
            // Convert map to sorted array (chronological, oldest to newest)
            const historical = Object.values(historicalMap)
                .map((item) => item)
                .sort((a, b) => a.year.localeCompare(b.year));
            // Valuation Ratios TTM
            const ratios = {
                peRatio: ratiosRaw?.priceToEarningsRatioTTM || 0,
                psRatio: ratiosRaw?.priceToSalesRatioTTM || 0,
                pbRatio: ratiosRaw?.priceToBookRatioTTM || 0,
                pegRatio: ratiosRaw?.priceToEarningsGrowthRatioTTM || 0,
                evToEbitda: metricsRaw?.evToEBITDATTM || 0,
                grossMargin: ratiosRaw?.grossProfitMarginTTM || 0,
                roe: metricsRaw?.returnOnEquityTTM || 0,
                debtToEquity: ratiosRaw?.debtToEquityRatioTTM || 0,
                currentRatio: ratiosRaw?.currentRatioTTM || 0
            };
            // Fallback target prices based on price range
            const parsedEstimates = {
                targetLow: profileRaw?.price ? profileRaw.price * 0.8 : 0,
                targetAvg: profileRaw?.price ? profileRaw.price * 1.15 : 0,
                targetHigh: profileRaw?.price ? profileRaw.price * 1.5 : 0,
                epsAvg: estimatesRaw?.epsAvg || 0
            };
            if (profileRaw?.range) {
                const parts = profileRaw.range.split("-");
                if (parts.length === 2) {
                    parsedEstimates.targetLow = parseFloat(parts[0]);
                    parsedEstimates.targetHigh = parseFloat(parts[1]) * 1.25; // Estimate upside
                    parsedEstimates.targetAvg = (parsedEstimates.targetLow + parsedEstimates.targetHigh) / 2;
                }
            }
            // Collect URLs that returned data successfully as sources
            const sources = [];
            if (profileRaw)
                sources.push(`https://financialmodelingprep.com/stable/profile?symbol=${cleanTicker}`);
            if (incomeRaw.length > 0)
                sources.push(`https://financialmodelingprep.com/stable/income-statement?symbol=${cleanTicker}`);
            if (cashFlowRaw.length > 0)
                sources.push(`https://financialmodelingprep.com/stable/cash-flow-statement?symbol=${cleanTicker}`);
            if (metricsRaw)
                sources.push(`https://financialmodelingprep.com/stable/key-metrics-ttm?symbol=${cleanTicker}`);
            if (ratiosRaw)
                sources.push(`https://financialmodelingprep.com/stable/ratios-ttm?symbol=${cleanTicker}`);
            return {
                profile,
                historical,
                ratios,
                estimates: parsedEstimates,
                sources
            };
        }
        catch (err) {
            console.error(`FmpProvider: Financial fetch failed for ${cleanTicker}`, err);
            return null;
        }
    }
}
exports.FmpProvider = FmpProvider;
