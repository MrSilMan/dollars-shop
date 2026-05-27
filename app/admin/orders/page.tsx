import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const metadata: Metadata = { title: "Orders — Admin" };

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
    take: 100,
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <h1 className="font-display text-2xl font-bold">Orders ({orders.length})</h1>
      <OrdersTable orders={orders.map((o) => ({ ...o, total: Number(o.total) }))} />
    </div>
  );
}
