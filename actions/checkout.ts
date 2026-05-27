"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CheckoutFormSchema, type CheckoutFormData } from "@/schemas/checkout.schema";
import { generateOrderNumber } from "@/lib/utils/order";
import { initiateEcoCashPayment } from "@/lib/payments/ecocash";
import { initiateInnBucksPayment } from "@/lib/payments/innbucks";
import { logger } from "@/lib/logger";
import { getCartItems, clearCart } from "./cart";

export type PaymentInitResult =
  | { success: true; method: "ECOCASH"; transactionId: string; amount: number }
  | { success: true; method: "INNBUCKS"; checkoutUrl: string; qrCode?: string; transactionRef: string; amount: number }
  | { success: false; error: string };

export async function createOrder(data: CheckoutFormData): Promise<{ orderId: string } | { error: string }> {
  const parsed = CheckoutFormSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid form data" };

  const session = await auth();
  const cartItems = await getCartItems();
  if (cartItems.length === 0) return { error: "Cart is empty" };

  const DELIVERY_FEE = parseFloat(process.env.DELIVERY_FEE_USD ?? "3.00");
  const FREE_THRESHOLD = parseFloat(process.env.FREE_DELIVERY_THRESHOLD_USD ?? "15.00");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const deliveryFee = subtotal >= FREE_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  try {
    const orderNumber = await generateOrderNumber();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id ?? null,
        guestEmail: session ? null : parsed.data.email,
        guestPhone: session ? null : parsed.data.phone,
        paymentMethod: parsed.data.method as "ECOCASH" | "INNBUCKS",
        subtotal,
        deliveryFee,
        total,
        shippingAddress: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          line1: parsed.data.line1,
          line2: parsed.data.line2 ?? null,
          city: parsed.data.city,
          province: parsed.data.province,
          country: "Zimbabwe",
        },
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productSku: item.product.sku,
            price: item.product.price,
            quantity: item.quantity,
            subtotal: Number(item.product.price) * item.quantity,
          })),
        },
      },
    });

    logger.info("Order created", { orderId: order.id, orderNumber, total });
    return { orderId: order.id };
  } catch (error) {
    logger.error("Order creation failed", { error });
    return { error: "Failed to create order" };
  }
}

export async function initiatePayment(
  orderId: string,
  customerPhone: string
): Promise<PaymentInitResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { success: false, error: "Order not found" };

  try {
    if (order.paymentMethod === "ECOCASH") {
      const result = await initiateEcoCashPayment({
        merchantCode: process.env.ECOCASH_MERCHANT_CODE!,
        merchantPin: process.env.ECOCASH_MERCHANT_PIN!,
        merchantNumber: process.env.ECOCASH_MERCHANT_NUMBER!,
        customerPhone,
        amount: Number(order.total),
        reference: order.orderNumber,
        narrative: `Dollar Shop Order ${order.orderNumber}`,
      });

      if (result.status === "FAILED") return { success: false, error: "Failed to send payment request" };

      await prisma.order.update({
        where: { id: orderId },
        data: { paymentRef: result.transactionId, paymentStatus: "PENDING_VERIFICATION" },
      });

      return {
        success: true,
        method: "ECOCASH",
        transactionId: result.transactionId,
        amount: Number(order.total),
      };
    }

    if (order.paymentMethod === "INNBUCKS") {
      const result = await initiateInnBucksPayment({
        merchantId: process.env.INNBUCKS_MERCHANT_ID!,
        merchantSecret: process.env.INNBUCKS_MERCHANT_SECRET!,
        customerPhone,
        amount: Number(order.total),
        currency: "USD",
        reference: order.orderNumber,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook?provider=innbucks`,
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { paymentRef: result.transactionRef, paymentStatus: "PENDING_VERIFICATION" },
      });

      return {
        success: true,
        method: "INNBUCKS",
        checkoutUrl: result.checkoutUrl,
        qrCode: result.qrCode,
        transactionRef: result.transactionRef,
        amount: Number(order.total),
      };
    }

    return { success: false, error: "Unknown payment method" };
  } catch (error) {
    logger.error("Payment initiation failed", { error, orderId });
    return { success: false, error: "Payment initiation failed" };
  }
}

export async function finalizeOrder(orderId: string) {
  await clearCart();
  return { orderId };
}
