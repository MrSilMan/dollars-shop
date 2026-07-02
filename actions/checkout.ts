"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CheckoutFormSchema, type CheckoutFormData } from "@/schemas/checkout.schema";
import { generateOrderNumber } from "@/lib/utils/order";
import { initiateEcoCashPayment } from "@/lib/payments/ecocash";
import { initiateInnBucksPayment } from "@/lib/payments/innbucks";
import { logger } from "@/lib/logger";
import { getCartItems, clearCart } from "./cart";
import { sendOrderConfirmationEmail, type OrderEmailData } from "@/lib/email";
import { generateReceiptPdf, resolveReceiptBranding, type ReceiptData } from "@/lib/pdf/receipt";

export type PaymentInitResult =
  | { success: true; method: "ECOCASH"; transactionId: string; amount: number }
  | { success: true; method: "INNBUCKS"; checkoutUrl: string; qrCode?: string; transactionRef: string; amount: number }
  | { success: true; method: "CASH_ON_DELIVERY"; orderNumber: string; amount: number }
  | { success: false; error: string };

export async function createOrder(data: CheckoutFormData): Promise<{ orderId: string; orderNumber: string } | { error: string }> {
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
  const discount = parsed.data.discountAmount ?? 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  try {
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      // Re-validate coupon inside the transaction to prevent TOCTOU races
      if (parsed.data.couponId) {
        const coupon = await tx.coupon.findUnique({ where: { id: parsed.data.couponId } });
        if (!coupon || !coupon.isActive) throw new Error("Coupon is no longer valid");
        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
          throw new Error("Coupon has reached its usage limit");
        }
        await tx.coupon.update({
          where: { id: parsed.data.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id ?? null,
          guestEmail: session ? null : parsed.data.email,
          guestPhone: session ? null : parsed.data.phone,
          paymentMethod: parsed.data.method as "ECOCASH" | "INNBUCKS" | "CASH_ON_DELIVERY",
          status: "PENDING",
          paymentStatus: "UNPAID",
          subtotal,
          deliveryFee,
          discount,
          total,
          couponId: parsed.data.couponId ?? null,
          couponCode: parsed.data.couponCode ?? null,
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
              variantSnapshot: item.variant ? `${item.variant.groupName}: ${item.variant.value}` : null,
            })),
          },
        },
      });

      // COD: check stock and decrement atomically inside the same transaction
      if (parsed.data.method === "CASH_ON_DELIVERY") {
        for (const item of cartItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true, name: true },
          });
          if (!product || product.stock < item.quantity) {
            throw new Error(`Insufficient stock for "${item.product.name}"`);
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return newOrder;
    });

    if (parsed.data.method === "CASH_ON_DELIVERY") {
      await clearCart();
    }

    logger.info("Order created", { orderId: order.id, orderNumber, total });

    // Only send confirmation email for COD — EcoCash/InnBucks orders are not yet paid
    if (parsed.data.method === "CASH_ON_DELIVERY") {
      const items = cartItems.map(item => ({
        name: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        price: Number(item.product.price),
        subtotal: Number(item.product.price) * item.quantity,
        variantSnapshot: item.variant ? `${item.variant.groupName}: ${item.variant.value}` : null,
      }));

      resolveReceiptBranding()
        .then((branding) => {
          const receiptData: ReceiptData = {
            orderNumber,
            createdAt: order.createdAt,
            paymentMethod: parsed.data.method,
            customerName: parsed.data.name,
            customerPhone: parsed.data.phone,
            items,
            subtotal,
            deliveryFee,
            discount,
            total,
            shippingAddress: {
              line1: parsed.data.line1,
              line2: parsed.data.line2,
              city: parsed.data.city,
              province: parsed.data.province,
              country: "Zimbabwe",
            },
            ...branding,
          };
          return generateReceiptPdf(receiptData);
        })
        .then((receiptPdf) => {
          const emailData: OrderEmailData = {
            orderNumber,
            customerName: parsed.data.name,
            customerEmail: parsed.data.email,
            items,
            subtotal,
            deliveryFee,
            discount,
            total,
            paymentMethod: parsed.data.method,
            shippingAddress: {
              line1: parsed.data.line1,
              line2: parsed.data.line2,
              city: parsed.data.city,
              province: parsed.data.province,
            },
            receiptPdf,
          };
          return sendOrderConfirmationEmail(emailData);
        })
        .catch(() => {});
    }

    return { orderId: order.id, orderNumber };
  } catch (error) {
    logger.error("Order creation failed", { error });
    if (error instanceof Error && (error.message.startsWith("Coupon") || error.message.startsWith("Insufficient"))) {
      return { error: error.message };
    }
    return { error: "Failed to create order" };
  }
}

export async function initiatePayment(
  orderId: string,
  customerPhone: string
): Promise<PaymentInitResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { success: false, error: "Order not found" };

  if (order.paymentMethod === "CASH_ON_DELIVERY") {
    return { success: true, method: "CASH_ON_DELIVERY", orderNumber: order.orderNumber, amount: Number(order.total) };
  }

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
