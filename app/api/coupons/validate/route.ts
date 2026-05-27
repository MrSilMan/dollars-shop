import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/actions/coupons";

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json();
  if (!code || typeof subtotal !== "number") {
    return NextResponse.json({ valid: false, error: "Missing code or subtotal" }, { status: 400 });
  }
  const result = await validateCoupon(code, subtotal);
  return NextResponse.json(result);
}
