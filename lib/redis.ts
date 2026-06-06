import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

redis.on("error", () => {
  // suppress unhandled error event — command failures are already caught in getCached/setCached
});

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

async function scanKeys(pattern: string): Promise<string[]> {
  const keys: string[] = [];
  let cursor = "0";
  do {
    const [next, found] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = next;
    keys.push(...found);
  } while (cursor !== "0");
  return keys;
}

export async function invalidateProductCache(productSlug: string, categorySlug?: string) {
  const keys: string[] = [`product:${productSlug}`, "products:featured"];

  if (categorySlug) {
    const categoryKeys = await scanKeys(`products:category:${categorySlug}:*`);
    keys.push(...categoryKeys);
  }

  await Promise.all(keys.map((k) => redis.del(k)));
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
}

export async function setCached(key: string, value: unknown, ttlSeconds: number) {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // silently fail — cache is optional
  }
}

/** Fixed-window rate limiter. Returns true if the request is allowed. Fails open if Redis is unavailable. */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    return count <= limit;
  } catch {
    return true;
  }
}
