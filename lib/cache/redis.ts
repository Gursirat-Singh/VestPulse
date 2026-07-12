import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = Redis.fromEnv();
  } catch (err) {
    console.error("Failed to initialize Redis from env:", err);
  }
} else {
  console.warn("UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing. Caching will be bypassed.");
}

export async function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  if (!redis) {
    return fn();
  }
  try {
    const hit = await redis.get<T>(key);
    if (hit) {
      console.log(`[Cache Hit] Key: ${key}`);
      return hit;
    }
  } catch (err) {
    console.error(`[Cache Error] Failed to read key ${key}:`, err);
  }

  const value = await fn();

  try {
    await redis.set(key, value, { ex: ttlSeconds });
    console.log(`[Cache Miss & Set] Key: ${key}, TTL: ${ttlSeconds}s`);
  } catch (err) {
    console.error(`[Cache Error] Failed to set key ${key}:`, err);
  }

  return value;
}
