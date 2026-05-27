import "dotenv/config";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

const keys = await redis.keys("products:*");
const pkeys = await redis.keys("product:*");
const all = [...keys, ...pkeys];

console.log("Found", all.length, "cached keys:", all);
if (all.length > 0) {
  await redis.del(...all);
  console.log("Cleared", all.length, "cache entries");
} else {
  console.log("No product cache entries found");
}

await redis.quit();
