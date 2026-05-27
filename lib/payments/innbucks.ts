import crypto from "crypto";
import { logger } from "@/lib/logger";

export interface InnBucksPaymentRequest {
  merchantId: string;
  merchantSecret: string;
  customerPhone: string;
  amount: number;
  currency: "USD" | "ZiG";
  reference: string;
  callbackUrl: string;
}

const isSandbox = process.env.PAYMENT_MODE === "sandbox";

export async function initiateInnBucksPayment(
  req: InnBucksPaymentRequest
): Promise<{ checkoutUrl: string; transactionRef: string; qrCode?: string }> {
  if (isSandbox) {
    const txRef = `SANDBOX-INN-${Date.now()}`;
    logger.info("InnBucks sandbox payment initiated", { reference: req.reference, amount: req.amount });
    return {
      checkoutUrl: `/checkout/innbucks-sandbox?ref=${txRef}`,
      transactionRef: txRef,
      qrCode: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWE2MjMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNCI+U2FuZGJveCBRUjwvdGV4dD48L3N2Zz4=`,
    };
  }

  try {
    const signature = crypto
      .createHmac("sha256", req.merchantSecret)
      .update(`${req.merchantId}:${req.reference}:${req.amount}`)
      .digest("hex");

    const res = await fetch(`${process.env.INNBUCKS_API_URL}/payment/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Merchant-ID": req.merchantId,
        "X-Signature": signature,
      },
      body: JSON.stringify({
        phoneNumber: req.customerPhone,
        amount: req.amount,
        currency: req.currency,
        reference: req.reference,
        callbackUrl: req.callbackUrl,
      }),
    });

    if (!res.ok) throw new Error(`InnBucks API error: ${res.status}`);

    const data = await res.json();
    return {
      checkoutUrl: data.checkoutUrl,
      transactionRef: data.transactionRef,
      qrCode: data.qrCode,
    };
  } catch (error) {
    logger.error("InnBucks payment initiation failed", { error, reference: req.reference });
    throw error;
  }
}

export async function verifyInnBucksWebhook(
  payload: unknown,
  signature: string
): Promise<boolean> {
  if (isSandbox) return true;

  const secret = process.env.INNBUCKS_MERCHANT_SECRET!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
