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
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") return { error: "Unauthorized" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });
  if (!order) return { error: "Order not found" };

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  } catch (err) {
    logger.error("Order status update failed", { err, orderId });
    return { error: "Failed to update order status" };
  }

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
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") return { error: "Unauthorized" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });
  if (!order) return { error: "Order not found" };
  if (order.paymentMethod !== "CASH_ON_DELIVERY") return { error: "Not a Cash on Delivery order" };
  if (order.paymentStatus === "PAID") return { error: "Payment already marked as received" };

  const willMarkDelivered = order.status !== "DELIVERED" && order.status !== "CANCELLED" && order.status !== "REFUNDED";
  const resultingStatus = willMarkDelivered ? "DELIVERED" : order.status;

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        ...(willMarkDelivered ? { status: "DELIVERED" } : {}),
      },
    });
  } catch (err) {
    logger.error("COD payment update failed", { err, orderId });
    return { error: "Failed to update payment status" };
  }

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
      newStatus: resultingStatus,
      total,
    }).catch(err => logger.error("Status email failed", { err, orderId }));
  }

  if (customerPhone) {
    sendWhatsAppStatusUpdate({
      phone: customerPhone,
      orderNumber: order.orderNumber,
      status: resultingStatus,
      total,
    }).catch(err => logger.error("WhatsApp notification failed", { err, orderId }));
  }

  logger.info("COD payment marked as received", { orderId });
  return { success: true };
}
