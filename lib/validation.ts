  import { z } from "zod";

  export function isMultipleCompanyQuery(input: string): boolean {
    // 1. Explicit separators
    if (/[,\/|]/.test(input)) return true;
    if (/\b(vs\.?|versus|and)\b/i.test(input)) return true;

    // 2. Multiple ticker-like words (2-5 uppercase letters)
    const words = input.trim().split(/\s+/);
    const tickers = words.filter(w => /^[A-Z]{2,5}$/.test(w));
    if (tickers.length > 1) return true;

    // 3. Known mega-cap tech combinations often used in multi-search
    const knownCompanies = [
      "apple", "tesla", "microsoft", "nvidia", "nvda", "google", 
      "meta", "amazon", "amd", "netflix", "alphabet", "infosys", "reliance"
    ];
    const lowerInput = input.toLowerCase();
    let foundCount = 0;
    for (const c of knownCompanies) {
      if (new RegExp(`\\b${c}\\b`).test(lowerInput)) {
        foundCount++;
      }
    }
    if (foundCount > 1) return true;

    return false;
  }

  export const companyInputSchema = z
    .string()
    .trim()
    .min(2, "Please enter a valid company name or stock ticker.")
    .max(100, "Please enter a valid company name or stock ticker.")
    .regex(/^[a-zA-Z0-9\s&'.,\-:()]+(\.[A-Za-z]{1,5})?$/, "Please enter a valid company name or stock ticker.")
    .refine((val) => !/\s{2,}/.test(val), "Please enter a valid company name or stock ticker.")
    .refine((val) => {
      const lower = val.toLowerCase();
      const blocklist = ["ignore", "instruction", "drop table", "select ", "delete from", "update "];
      return !blocklist.some((keyword) => lower.includes(keyword));
    }, "Please enter a valid company name or stock ticker.")
    .refine(
      (val) => !isMultipleCompanyQuery(val),
      "Please search for one company at a time.\n\nExamples:\n✓ Apple\n✓ Tesla\n✓ Reliance Industries\n✓ NVIDIA\n\nFuture versions of VestPulse will support side-by-side company comparison."
    );
