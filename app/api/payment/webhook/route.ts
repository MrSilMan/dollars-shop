import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { verifyInnBucksWebhook } from "@/lib/payments/innbucks";

export async function POST(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider");
  const body = await req.json();

  try {
    if (provider === "innbucks") {
      const signature = req.headers.get("x-innbucks-signature") ?? "";
      const valid = await verifyInnBucksWebhook(body, signature);
      if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const reference = body.reference ?? body.clientCorrelator;
    if (!reference) return NextResponse.json({ error: "No reference" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { orderNumber: reference } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const isPaid =
      provider === "ecocash"
        ? body.transactionOperationStatus === "Charged"
        : body.status === "SUCCESS";

    if (isPaid) {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "PAID", status: "CONFIRMED", paymentRef: body.transactionId ?? body.transactionRef },
        });

        const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      });

      logger.info("Payment webhook processed", { orderId: order.id, provider, reference });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook processing failed", { error, provider });
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
