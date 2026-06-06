import crypto from "crypto";
import { getCached, setCached } from "@/lib/redis";
import { logger } from "@/lib/logger";

export interface EcoCashPaymentRequest {
  merchantCode: string;
  merchantPin: string;
  merchantNumber: string;
  customerPhone: string;
  amount: number;
  reference: string;
  narrative: string;
}

export interface EcoCashPaymentResponse {
  status: "SENT" | "FAILED";
  pollUrl: string;
  transactionId: string;
}

const isSandbox = process.env.PAYMENT_MODE === "sandbox";

export async function initiateEcoCashPayment(
  req: EcoCashPaymentRequest
): Promise<EcoCashPaymentResponse> {
  if (isSandbox) {
    const txId = `SANDBOX-ECO-${Date.now()}`;
    logger.info("EcoCash sandbox payment initiated", { reference: req.reference, amount: req.amount });
    return {
      status: "SENT",
      pollUrl: `/api/payment/status/ecocash/${txId}`,
      transactionId: txId,
    };
  }

  try {
    const res = await fetch(`${process.env.ECOCASH_API_URL}/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantCode: req.merchantCode,
        merchantPin: req.merchantPin,
        merchantNumber: req.merchantNumber,
        subscriberMsisdn: req.customerPhone,
        amount: req.amount.toFixed(2),
        clientCorrelator: req.reference,
        transactionDescription: req.narrative,
        currencyCode: "USD",
      }),
    });

    if (!res.ok) {
      throw new Error(`EcoCash API error: ${res.status}`);
    }

    const data = await res.json();
    logger.info("EcoCash payment initiated", { reference: req.reference, transactionId: data.transactionId });

    return {
      status: "SENT",
      pollUrl: data.pollUrl,
      transactionId: data.transactionId,
    };
  } catch (error) {
    logger.error("EcoCash payment initiation failed", { error, reference: req.reference });
    return { status: "FAILED", pollUrl: "", transactionId: "" };
  }
}

export function verifyEcoCashWebhook(token: string): boolean {
  if (isSandbox) return true;
  const secret = process.env.ECOCASH_WEBHOOK_SECRET ?? "";
  if (!secret) return false;
  // Hash both to equal-length 32-byte buffers for timing-safe comparison
  const h1 = crypto.createHash("sha256").update(token).digest();
  const h2 = crypto.createHash("sha256").update(secret).digest();
  return crypto.timingSafeEqual(h1, h2);
}

export async function pollEcoCashStatus(
  transactionId: string
): Promise<"PENDING" | "PAID" | "FAILED" | "CANCELLED"> {
  const cacheKey = `payment:status:${transactionId}`;
  const cached = await getCached<"PENDING" | "PAID" | "FAILED" | "CANCELLED">(cacheKey);
  if (cached) return cached;

  if (isSandbox) {
    // Simulate success after 10 seconds in sandbox
    const status = "PAID";
    await setCached(cacheKey, status, 30);
    return status;
  }

  try {
    const res = await fetch(`${process.env.ECOCASH_API_URL}/status/${transactionId}`);
    if (!res.ok) return "PENDING";

    const data = await res.json();
    const status: "PENDING" | "PAID" | "FAILED" | "CANCELLED" =
      data.status === "TRX_RES_SUCCESS" ? "PAID"
      : data.status === "TRX_RES_FAILED" ? "FAILED"
      : data.status === "TRX_RES_CANCELLED" ? "CANCELLED"
      : "PENDING";

    await setCached(cacheKey, status, 30);
    return status;
  } catch {
    return "PENDING";
  }
}
