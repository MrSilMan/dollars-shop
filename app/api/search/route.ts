import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/actions/products";
import { checkRateLimit } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await checkRateLimit(`ratelimit:search:${ip}`, 30, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await searchProducts(q);
  return NextResponse.json(results);
}
