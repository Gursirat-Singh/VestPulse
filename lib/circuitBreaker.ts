let failureCount = 0;
let lastFailureTime = 0;
const FAILURE_THRESHOLD = Number(process.env.GEMINI_CIRCUIT_BREAKER_THRESHOLD || "3");
const COOLDOWN_MS = 60000; // 60s

export const circuitBreaker = {
  recordSuccess() {
    failureCount = 0;
  },
  recordFailure(error?: any) {
    if (error) {
       const msg = String(error?.message || error).toLowerCase();
       if (msg.includes("parse") || msg.includes("validation") || msg.includes("400")) {
          return; // Ignore user-induced errors
       }
       if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
          return;
       }
    }
    failureCount++;
    lastFailureTime = Date.now();
  },
  isOpen(): boolean {
    if (failureCount >= FAILURE_THRESHOLD) {
      const elapsed = Date.now() - lastFailureTime;
      if (elapsed < COOLDOWN_MS) {
        return true;
      }
      // Cooldown passed, reset half-open
      failureCount = 0;
    }
    return false;
  }
};
