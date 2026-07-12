type RetryOptions = { retries?: number; baseDelayMs?: number; onRetry?: (err: unknown, attempt: number) => void };

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { retries = 3, baseDelayMs = 500, onRetry } = opts;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      onRetry?.(err, attempt);
      if (attempt === retries) break;
      
      // Try to read standard retry-after headers from fetch or axios response errors
      const retryAfterHeader = err?.response?.headers?.["retry-after"] || err?.headers?.["retry-after"];
      const delay = retryAfterHeader
        ? Number(retryAfterHeader) * 1000
        : baseDelayMs * 2 ** attempt + Math.random() * 250; // exponential backoff + jitter
      
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
