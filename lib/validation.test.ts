import { isMultipleCompanyQuery } from "./validation";

const validCases = [
  "Apple",
  "Tesla",
  "NVIDIA",
  "Reliance Industries",
  "Tata Consultancy Services",
  "Bank of America",
  "Berkshire Hathaway",
  "Mahindra & Mahindra",
  "Dr. Reddy's Laboratories",
  "Larsen & Toubro",
  "AT&T",
  "M&M",
  "Alphabet Inc",
];

const invalidCases = [
  "Apple Tesla",
  "Apple Microsoft",
  "Tesla NVDA",
  "Apple, Tesla",
  "Apple / Tesla",
  "Apple vs Tesla",
  "Apple versus Tesla",
  "Tesla and NVIDIA",
  "Reliance Industries, Infosys",
  "Apple | Tesla",
  "AAPL MSFT",
  "NVDA AMD",
  "Google Meta Amazon",
];

let failed = false;

console.log("=== Testing Valid Cases (Should be false) ===");
validCases.forEach((tc) => {
  const result = isMultipleCompanyQuery(tc);
  if (result !== false) {
    console.error(`❌ FAILED (expected false, got true): "${tc}"`);
    failed = true;
  } else {
    console.log(`✅ PASSED: "${tc}"`);
  }
});

console.log("\n=== Testing Invalid Cases (Should be true) ===");
invalidCases.forEach((tc) => {
  const result = isMultipleCompanyQuery(tc);
  if (result !== true) {
    console.error(`❌ FAILED (expected true, got false): "${tc}"`);
    failed = true;
  } else {
    console.log(`✅ PASSED: "${tc}"`);
  }
});

if (failed) {
  process.exit(1);
} else {
  console.log("\n🎉 ALL TESTS PASSED!");
}
