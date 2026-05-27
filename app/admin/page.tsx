import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/admin/StatsCard";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { DollarSign, ShoppingBag, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { formatUSD } from "@/lib/utils/currency";
import { RevenueChart } from "./_components/RevenueChart";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalRevenue, ordersToday, pendingOrders, lowStock, recentOrders, revenueData] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { stock: { lte: 10 }, isActive: true } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    // Last 30 days revenue per day
    prisma.$queryRaw<{ date: string; revenue: number }[]>`
      SELECT DATE(created_at)::text as date, SUM(total)::float as revenue
      FROM orders
      WHERE payment_status = 'PAID' AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `.catch(() => []),
  ]);

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <Link href="/admin/products/new" className="bg-(--color-primary) hover:bg-(--color-primary-dark) text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          + Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" value={formatUSD(Number(totalRevenue._sum.total ?? 0))} icon={DollarSign} color="var(--color-success)" />
        <StatsCard title="Orders Today" value={ordersToday} icon={ShoppingBag} color="var(--color-primary)" />
        <StatsCard title="Pending Orders" value={pendingOrders} icon={Clock} color="var(--color-accent)" />
        <StatsCard title="Low Stock Items" value={lowStock} icon={AlertTriangle} color="#EF4444" change={lowStock > 0 ? "Needs attention" : "All good"} changeType={lowStock > 0 ? "down" : "up"} />
      </div>

      {/* Revenue chart */}
      {revenueData.length > 0 && (
        <div className="bg-white rounded-2xl border border-(--color-border) p-5">
          <h2 className="font-semibold mb-4">Revenue — Last 30 Days</h2>
          <RevenueChart data={revenueData} />
        </div>
      )}

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-(--color-primary) hover:underline">View all →</Link>
        </div>
        <OrdersTable orders={recentOrders.map(o => ({ ...o, total: Number(o.total) }))} />
      </div>
    </div>
  );
}
