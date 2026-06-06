import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/actions/coupons";
import { checkRateLimit } from "@/lib/redis";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await checkRateLimit(`ratelimit:coupon-validate:${ip}`, 10, 60);
  if (!allowed) {
    return NextResponse.json({ valid: false, error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const { code, subtotal } = await req.json();
  if (!code || typeof subtotal !== "number") {
    return NextResponse.json({ valid: false, error: "Missing code or subtotal" }, { status: 400 });
  }
  const result = await validateCoupon(code, subtotal);
  return NextResponse.json(result);
}
