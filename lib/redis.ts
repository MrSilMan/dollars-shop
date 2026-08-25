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

export async function invalidateProductCache(productSlug: string, categorySlug?: string | string[]) {
  // categories:images and categories:counts are derived from products, so they
  // go stale too.
  const keys: string[] = [
    `product:${productSlug}`,
    "products:featured",
    "categories:images",
    "categories:counts",
  ];

  const categorySlugs = Array.isArray(categorySlug) ? categorySlug : categorySlug ? [categorySlug] : [];
  for (const slug of new Set(categorySlugs)) {
    const categoryKeys = await scanKeys(`products:category:${slug}:*`);
    keys.push(...categoryKeys);
  }

  await Promise.all(keys.map((k) => redis.del(k)));
}

/**
 * Drop what the storefront caches about categories themselves — the derived
 * aggregates plus the paginated listing for each slug that changed. Renames
 * pass both the old and new slug so neither listing survives the edit.
 */
export async function invalidateCategoryCache(categorySlugs: string[] = []) {
  const keys: string[] = ["categories:images", "categories:counts"];

  for (const slug of new Set(categorySlugs.filter(Boolean))) {
    const categoryKeys = await scanKeys(`products:category:${slug}:*`);
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

function blurKey(imageUrl: string) {
  return `image:blur:${imageUrl}`;
}

/** Persist a tiny base64 blur placeholder for an image URL. No TTL — uploaded files are immutable. */
export async function setImageBlur(imageUrl: string, blurDataURL: string) {
  try {
    await redis.set(blurKey(imageUrl), blurDataURL);
  } catch {
    // silently fail — blur placeholder is a progressive enhancement
  }
}

/** Look up cached blur placeholders for a batch of image URLs. Missing entries are simply omitted. */
export async function getImageBlurMap(imageUrls: string[]): Promise<Record<string, string>> {
  const urls = [...new Set(imageUrls)].filter(Boolean);
  if (urls.length === 0) return {};
  try {
    const values = await redis.mget(urls.map(blurKey));
    const map: Record<string, string> = {};
    urls.forEach((url, i) => {
      const v = values[i];
      if (v) map[url] = v;
    });
    return map;
  } catch {
    return {};
  }
}
