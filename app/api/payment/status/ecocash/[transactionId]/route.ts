import { NextResponse } from "next/server";
import { confirmEcoCashPayment, type PaymentConfirmStatus } from "@/lib/payments/fulfillment";
import { getCached, setCached } from "@/lib/redis";

// transactionId is the clientCorrelator of the charge attempt
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params;

  // Throttle upstream queries: pending results are cached briefly so
  // aggressive polling (or multiple tabs) doesn't hammer the EcoCash API.
  const cacheKey = `payment:ecocash:${transactionId}`;
  const cached = await getCached<PaymentConfirmStatus>(cacheKey);
  if (cached === "PENDING") return NextResponse.json({ status: "PENDING" });

  const status = await confirmEcoCashPayment(transactionId);
  if (status === null) {
    return NextResponse.json({ status: "FAILED", error: "Unknown transaction" }, { status: 404 });
  }

  if (status === "PENDING") await setCached(cacheKey, status, 4);
  return NextResponse.json({ status });
}
