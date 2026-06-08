import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils/order";
import { initiatePayment, type PaymentInitResult } from "@/actions/checkout";
import { logger } from "@/lib/logger";
import { getBotCartItems, clearBotCart, botCartTotal } from "./cart";
import type { CheckoutDraft } from "./session";

export type CompleteCheckoutDraft = Required<
  Pick<CheckoutDraft, "name" | "email" | "phone" | "line1" | "city" | "province" | "method">
> &
  Pick<CheckoutDraft, "line2" | "paymentNumber">;

export type BotOrderResult =
  | { success: true; orderNumber: string; payment: PaymentInitResult }
  | { success: false; error: string };

/** Last-9-digits comparison so "0772566468" and "263772566468" (or "+263…") are recognised as the same number. */
function phonesMatch(a: string, b: string): boolean {
  const digitsA = a.replace(/\D/g, "").slice(-9);
  const digitsB = b.replace(/\D/g, "").slice(-9);
  return digitsA.length === 9 && digitsA === digitsB;
}

export async function createBotOrder(waPhone: string, draft: CompleteCheckoutDraft): Promise<BotOrderResult> {
  const cartItems = await getBotCartItems(waPhone);
  if (cartItems.length === 0) return { success: false, error: "Your cart is empty" };

  const DELIVERY_FEE = parseFloat(process.env.DELIVERY_FEE_USD ?? "3.00");
  const FREE_THRESHOLD = parseFloat(process.env.FREE_DELIVERY_THRESHOLD_USD ?? "15.00");

  const subtotal = botCartTotal(cartItems);
  const deliveryFee = subtotal >= FREE_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = Math.max(0, subtotal + deliveryFee);

  try {
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          guestEmail: draft.email,
          guestPhone: draft.phone,
          paymentMethod: draft.method,
          status: "PENDING",
          paymentStatus: "UNPAID",
          subtotal,
          deliveryFee,
          discount: 0,
          total,
          shippingAddress: {
            name: draft.name,
            email: draft.email,
            phone: draft.phone,
            line1: draft.line1,
            line2: draft.line2 ?? null,
            city: draft.city,
            province: draft.province,
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

      if (draft.method === "CASH_ON_DELIVERY") {
        for (const item of cartItems) {
          const product = await tx.product.findUnique({ where: { id: item.productId }, select: { stock: true, name: true } });
          if (!product || product.stock < item.quantity) {
            throw new Error(`Insufficient stock for "${item.product.name}"`);
          }
          await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        }
      }

      return newOrder;
    });

    const payment = await initiatePayment(order.id, draft.paymentNumber ?? draft.phone);
    if (!payment.success) {
      return { success: false, error: payment.error };
    }

    await clearBotCart(waPhone);
    logger.info("WhatsApp bot order created", { orderId: order.id, orderNumber, total });

    return { success: true, orderNumber, payment };
  } catch (error) {
    logger.error("WhatsApp bot order creation failed", { error });
    if (error instanceof Error && error.message.startsWith("Insufficient")) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create order" };
  }
}

export async function findOrderForTracking(orderNumber: string, waPhone: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: orderNumber.trim().toUpperCase() },
    include: { user: { select: { phone: true } } },
  });
  if (!order) return null;

  const ownerPhone = order.guestPhone ?? order.user?.phone;
  if (!ownerPhone || !phonesMatch(ownerPhone, waPhone)) return null;

  return order;
}
