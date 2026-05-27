import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { verifyInnBucksWebhook } from "@/lib/payments/innbucks";
import { verifyEcoCashWebhook } from "@/lib/payments/ecocash";
import { sendPaymentReceivedEmail, type OrderEmailData } from "@/lib/email";

export async function POST(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider");
  const body = await req.json();

  try {
    if (provider === "innbucks") {
      const signature = req.headers.get("x-innbucks-signature") ?? "";
      const valid = await verifyInnBucksWebhook(body, signature);
      if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (provider === "ecocash") {
      const token = req.headers.get("x-ecocash-token") ?? "";
      if (!verifyEcoCashWebhook(token)) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    const reference = body.reference ?? body.clientCorrelator;
    if (!reference) return NextResponse.json({ error: "No reference" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { orderNumber: reference } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Idempotency: if already paid, acknowledge without reprocessing
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ received: true });
    }

    const isPaid =
      provider === "ecocash"
        ? body.transactionOperationStatus === "Charged"
        : body.status === "SUCCESS";

    if (isPaid) {
      const items = await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "PAID", status: "CONFIRMED", paymentRef: body.transactionId ?? body.transactionRef },
        });

        const orderItems = await tx.orderItem.findMany({ where: { orderId: order.id } });
        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        return orderItems;
      });

      logger.info("Payment webhook processed", { orderId: order.id, provider, reference });

      // Fire payment-confirmed email (non-blocking)
      const addr = order.shippingAddress as { name?: string; email?: string; line1?: string; line2?: string; city?: string; province?: string };
      const customerEmail = addr.email ?? order.guestEmail;
      if (customerEmail) {
        const emailData: OrderEmailData = {
          orderNumber: order.orderNumber,
          customerName: addr.name ?? "Customer",
          customerEmail,
          items: items.map(i => ({ name: i.productName, quantity: i.quantity, price: Number(i.price), variantSnapshot: i.variantSnapshot })),
          subtotal: Number(order.subtotal),
          deliveryFee: Number(order.deliveryFee),
          discount: Number(order.discount),
          total: Number(order.total),
          paymentMethod: order.paymentMethod,
          shippingAddress: { line1: addr.line1 ?? "", line2: addr.line2, city: addr.city ?? "", province: addr.province ?? "" },
        };
        sendPaymentReceivedEmail(emailData).catch(() => {});
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook processing failed", { error, provider });
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
