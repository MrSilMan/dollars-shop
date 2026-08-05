import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { verifyInnBucksWebhook } from "@/lib/payments/innbucks";
import { confirmEcoCashPayment, markOrderPaid } from "@/lib/payments/fulfillment";

const VALID_PROVIDERS = ["innbucks", "ecocash"] as const;

export async function POST(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider");

  if (!provider || !(VALID_PROVIDERS as readonly string[]).includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (provider === "ecocash") {
      // EcoCash does not sign its notifications, so the payload is never
      // trusted: the clientCorrelator is only a hint that triggers a
      // server-side Query Transaction call, which decides the real outcome.
      const clientCorrelator =
        typeof body.clientCorrelator === "string" ? body.clientCorrelator : null;
      if (!clientCorrelator) {
        return NextResponse.json({ error: "No clientCorrelator" }, { status: 400 });
      }

      const status = await confirmEcoCashPayment(clientCorrelator);
      if (status === null) {
        return NextResponse.json({ error: "Unknown transaction" }, { status: 404 });
      }

      logger.info("EcoCash webhook processed", { clientCorrelator, status });
      return NextResponse.json({ received: true });
    }

    // InnBucks — authenticated by HMAC signature, payload is trusted
    const signature = req.headers.get("x-innbucks-signature") ?? "";
    const valid = await verifyInnBucksWebhook(body, signature);
    if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    const reference = (body.reference ?? body.clientCorrelator) as string | undefined;
    if (!reference) return NextResponse.json({ error: "No reference" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { orderNumber: reference } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (body.status === "SUCCESS") {
      const paymentRef = (body.transactionId ?? body.transactionRef) as string | undefined;
      await markOrderPaid(order.id, paymentRef);
      logger.info("InnBucks webhook processed", { orderId: order.id, reference });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook processing failed", { error, provider });
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
