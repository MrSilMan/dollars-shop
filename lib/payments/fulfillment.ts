import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { isSandbox, queryEcoCashTransaction } from "@/lib/payments/ecocash";
import { sendPaymentReceivedEmail, type OrderEmailData } from "@/lib/email";
import { generateReceiptPdf, resolveReceiptBranding, type ReceiptData } from "@/lib/pdf/receipt";

export type PaymentConfirmStatus = "PAID" | "FAILED" | "PENDING";

/**
 * Atomically mark an order as paid, decrement stock, and fire the receipt
 * email. Safe to call concurrently (webhook + status poll): the guarded
 * updateMany ensures side effects run exactly once.
 */
export async function markOrderPaid(orderId: string, paymentRef?: string | null): Promise<"PAID" | "ALREADY_PAID"> {
  const items = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: orderId, paymentStatus: { not: "PAID" } },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        ...(paymentRef ? { paymentRef } : {}),
      },
    });
    if (updated.count === 0) return null;

    const orderItems = await tx.orderItem.findMany({ where: { orderId } });
    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    return orderItems;
  });

  if (!items) return "ALREADY_PAID";

  logger.info("Order marked paid", { orderId, paymentRef });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return "PAID";

  const addr = order.shippingAddress as { name?: string; email?: string; phone?: string; line1?: string; line2?: string; city?: string; province?: string; country?: string };
  const customerEmail = addr.email ?? order.guestEmail;
  if (customerEmail) {
    const receiptItems = items.map(i => ({
      name: i.productName,
      sku: i.productSku,
      quantity: i.quantity,
      price: Number(i.price),
      subtotal: Number(i.price) * i.quantity,
      variantSnapshot: i.variantSnapshot,
    }));

    resolveReceiptBranding()
      .then((branding) => {
        const receiptData: ReceiptData = {
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          paymentMethod: order.paymentMethod,
          fulfillmentType: order.fulfillmentType,
          customerName: addr.name ?? "Customer",
          customerPhone: addr.phone,
          items: receiptItems,
          subtotal: Number(order.subtotal),
          deliveryFee: Number(order.deliveryFee),
          discount: Number(order.discount),
          total: Number(order.total),
          shippingAddress: {
            line1: addr.line1 ?? "",
            line2: addr.line2,
            city: addr.city ?? "",
            province: addr.province ?? "",
            country: addr.country ?? "Zimbabwe",
          },
          ...branding,
        };
        return generateReceiptPdf(receiptData);
      })
      .then((receiptPdf) => {
        const emailData: OrderEmailData = {
          orderNumber: order.orderNumber,
          customerName: addr.name ?? "Customer",
          customerEmail,
          items: receiptItems,
          subtotal: Number(order.subtotal),
          deliveryFee: Number(order.deliveryFee),
          discount: Number(order.discount),
          total: Number(order.total),
          paymentMethod: order.paymentMethod,
          fulfillmentType: order.fulfillmentType,
          shippingAddress: { line1: addr.line1 ?? "", line2: addr.line2, city: addr.city ?? "", province: addr.province ?? "" },
          receiptPdf,
        };
        return sendPaymentReceivedEmail(emailData);
      })
      .catch((err) => logger.error("Payment receipt email failed", { err, orderId }));
  }

  return "PAID";
}

// Sandbox transactions auto-complete this long after initiation, so the
// checkout widget shows a realistic pending phase.
const SANDBOX_APPROVAL_DELAY_MS = 8_000;

/**
 * Confirm an EcoCash payment by its clientCorrelator.
 *
 * The webhook and the client status poll both funnel through here. The
 * outcome is decided exclusively by querying the EcoCash API server-side and
 * verifying amount + currency against what we charged — webhook bodies are
 * treated as untrusted hints. Returns null for unknown correlators.
 */
export async function confirmEcoCashPayment(clientCorrelator: string): Promise<PaymentConfirmStatus | null> {
  const txn = await prisma.paymentTransaction.findUnique({
    where: { clientCorrelator },
    include: { order: { select: { id: true, paymentStatus: true } } },
  });
  if (!txn || txn.provider !== "ECOCASH") return null;

  if (txn.status === "COMPLETED" || txn.order.paymentStatus === "PAID") return "PAID";
  if (txn.status === "FAILED") return "FAILED";
  if (txn.status === "REFUNDED") return "FAILED";

  if (isSandbox) {
    if (Date.now() - txn.createdAt.getTime() < SANDBOX_APPROVAL_DELAY_MS) return "PENDING";
    await prisma.paymentTransaction.update({
      where: { id: txn.id },
      data: { status: "COMPLETED", providerRef: `SANDBOX-${clientCorrelator}` },
    });
    await markOrderPaid(txn.orderId, `SANDBOX-${clientCorrelator}`);
    return "PAID";
  }

  const query = await queryEcoCashTransaction(txn.msisdn, clientCorrelator);

  if (query.status === "COMPLETED") {
    const expected = Number(txn.amount);
    const amountMatches = query.amount === null || Math.abs(query.amount - expected) < 0.01;
    const currencyMatches = query.currency === null || query.currency === txn.currency;
    if (!amountMatches || !currencyMatches) {
      // Money moved but not what we asked for — hold for manual
      // reconciliation rather than confirming or failing the order.
      logger.error("EcoCash amount/currency mismatch — manual reconciliation required", {
        clientCorrelator,
        expected,
        expectedCurrency: txn.currency,
        charged: query.amount,
        chargedCurrency: query.currency,
      });
      await prisma.paymentTransaction.update({
        where: { id: txn.id },
        data: { failureReason: `Mismatch: charged ${query.amount} ${query.currency}, expected ${expected} ${txn.currency}` },
      });
      return "PENDING";
    }

    await prisma.paymentTransaction.update({
      where: { id: txn.id },
      data: { status: "COMPLETED", providerRef: query.ecocashReference },
    });
    await markOrderPaid(txn.orderId, query.ecocashReference ?? clientCorrelator);
    return "PAID";
  }

  if (query.status === "FAILED") {
    await prisma.paymentTransaction.update({
      where: { id: txn.id },
      data: { status: "FAILED", failureReason: "Rejected or cancelled by subscriber" },
    });
    await prisma.order.updateMany({
      where: { id: txn.orderId, paymentStatus: "PENDING_VERIFICATION" },
      data: { paymentStatus: "FAILED" },
    });
    return "FAILED";
  }

  return "PENDING";
}
