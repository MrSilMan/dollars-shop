"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { product: true } } },
  });
}

export async function getMyOrders() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
      // Non-USD settlements (e.g. ZiG) so the UI can show what was actually paid
      transactions: {
        where: { provider: "ECOCASH", currency: { not: "USD" }, status: { in: ["COMPLETED", "REFUNDED"] } },
        select: { currency: true, amount: true, exchangeRate: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
}
