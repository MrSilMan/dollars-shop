"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import { sendWhatsAppStatusUpdate } from "@/lib/notifications/whatsapp";
import { logger } from "@/lib/logger";

const VALID_STATUSES = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;
type OrderStatus = typeof VALID_STATUSES[number];

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") return { error: "Unauthorized" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });
  if (!order) return { error: "Order not found" };

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  revalidatePath("/admin/orders");

  const customerEmail = order.user?.email ?? order.guestEmail;
  const customerName  = (order.shippingAddress as { name?: string })?.name ?? order.user?.name ?? "Customer";
  const customerPhone = (order.shippingAddress as { phone?: string })?.phone ?? order.user?.phone ?? order.guestPhone;
  const total         = Number(order.total);

  // Fire notifications without blocking
  if (customerEmail) {
    sendOrderStatusUpdateEmail({
      orderNumber: order.orderNumber,
      customerName,
      customerEmail,
      newStatus,
      total,
    }).catch(err => logger.error("Status email failed", { err, orderId }));
  }

  if (customerPhone) {
    sendWhatsAppStatusUpdate({
      phone: customerPhone,
      orderNumber: order.orderNumber,
      status: newStatus,
      total,
    }).catch(err => logger.error("WhatsApp notification failed", { err, orderId }));
  }

  logger.info("Order status updated", { orderId, newStatus });
  return { success: true };
}

export async function markCODPaymentReceived(orderId: string) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") return { error: "Unauthorized" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });
  if (!order) return { error: "Order not found" };
  if (order.paymentMethod !== "CASH_ON_DELIVERY") return { error: "Not a Cash on Delivery order" };
  if (order.paymentStatus === "PAID") return { error: "Payment already marked as received" };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "PAID",
      ...(order.status !== "DELIVERED" && order.status !== "CANCELLED" && order.status !== "REFUNDED"
        ? { status: "DELIVERED" }
        : {}),
    },
  });

  revalidatePath("/admin/orders");

  const customerEmail = order.user?.email ?? order.guestEmail;
  const customerName  = (order.shippingAddress as { name?: string })?.name ?? order.user?.name ?? "Customer";
  const customerPhone = (order.shippingAddress as { phone?: string })?.phone ?? order.user?.phone ?? order.guestPhone;
  const total         = Number(order.total);

  if (customerEmail) {
    sendOrderStatusUpdateEmail({
      orderNumber: order.orderNumber,
      customerName,
      customerEmail,
      newStatus: "DELIVERED",
      total,
    }).catch(err => logger.error("Status email failed", { err, orderId }));
  }

  if (customerPhone) {
    sendWhatsAppStatusUpdate({
      phone: customerPhone,
      orderNumber: order.orderNumber,
      status: "DELIVERED",
      total,
    }).catch(err => logger.error("WhatsApp notification failed", { err, orderId }));
  }

  logger.info("COD payment marked as received", { orderId });
  return { success: true };
}
