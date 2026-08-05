import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/admin/StatsCard";
import { OrdersTable } from "@/components/admin/OrdersTable";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Package,
  Users,
  ArrowRight,
  Activity,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { formatUSD, formatZWG } from "@/lib/utils/currency";
import { RevenueChart } from "./_components/RevenueChart";
import { canAccess, adminLandingPage } from "@/lib/permissions";

export const metadata: Metadata = { title: "Admin Dashboard | Dollar Shop" };

export default async function AdminDashboard() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "";
  if (role && !canAccess("dashboard", role)) {
    const dest = adminLandingPage(role);
    if (dest !== "/") redirect(dest);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Revenue is reported per wallet: USD orders sum their USD total; ZiG-settled
  // orders sum the ZWG collected (excluded from the USD figures and chart).
  const [usdRevenueAgg, zwgRevenueAgg, ordersToday, pendingOrders, lowStock, recentOrders, revenueData] =
    await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID", transactions: { none: { currency: "ZWG", status: "COMPLETED" } } },
      }),
      prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        where: { currency: "ZWG", status: "COMPLETED", order: { is: { paymentStatus: "PAID" } } },
      }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { stock: { lte: 10 }, isActive: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.$queryRaw<{ date: string; revenue: number }[]>`
        SELECT DATE(o."createdAt")::text as date, SUM(o.total)::float as revenue
        FROM orders o
        WHERE o."paymentStatus" = 'PAID'
          AND o."createdAt" >= NOW() - INTERVAL '30 days'
          AND NOT EXISTS (
            SELECT 1 FROM payment_transactions t
            WHERE t."orderId" = o.id AND t.currency = 'ZWG' AND t.status = 'COMPLETED'
          )
        GROUP BY DATE(o."createdAt")
        ORDER BY date ASC
      `.catch((err) => {
        console.error("Failed to load revenue chart data:", err);
        return [];
      }),
    ]);

  const usdRevenue = Number(usdRevenueAgg._sum.total ?? 0);
  const zwgRevenue = Number(zwgRevenueAgg._sum.amount ?? 0);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      title: "Revenue (USD)",
      value: formatUSD(usdRevenue),
      icon: DollarSign,
      color: "green" as const,
      change: "Paid in USD",
      changeType: "neutral" as const,
    },
    ...(zwgRevenue > 0
      ? [
          {
            title: "Revenue (ZiG)",
            value: formatZWG(zwgRevenue),
            icon: Coins,
            color: "teal" as const,
            change: "Paid in ZiG",
            changeType: "neutral" as const,
          },
        ]
      : []),
    {
      title: "Orders Today",
      value: ordersToday,
      icon: ShoppingBag,
      color: "blue" as const,
      change: ordersToday > 0 ? `${ordersToday} new today` : "None yet",
      changeType: ordersToday > 0 ? ("up" as const) : ("neutral" as const),
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
      color: "amber" as const,
      change: pendingOrders > 0 ? "Needs review" : "All caught up",
      changeType: pendingOrders > 0 ? ("down" as const) : ("neutral" as const),
    },
    {
      title: "Low Stock",
      value: lowStock,
      icon: AlertTriangle,
      color: lowStock > 0 ? ("red" as const) : ("green" as const),
      change: lowStock > 0 ? "Needs attention" : "All good",
      changeType: lowStock > 0 ? ("down" as const) : ("up" as const),
    },
  ];

  // On two-column phones a trailing odd card would leave a hole — let it span.
  const statsGridCls = [
    "grid grid-cols-2 gap-3 sm:gap-4",
    stats.length === 5 ? "lg:grid-cols-3 xl:grid-cols-5" : "lg:grid-cols-4",
    stats.length % 2 === 1 ? "max-lg:[&>*:last-child]:col-span-2" : "",
  ].join(" ");

  const quickActions = [
    { href: "/admin/products/new", label: "Add New Product", icon: Package,  colorCls: "bg-green-50 text-green-800" },
    { href: "/admin/orders",       label: "Manage Orders",   icon: ShoppingBag, colorCls: "bg-blue-50 text-blue-700" },
    { href: "/admin/customers",    label: "View Customers",  icon: Users,    colorCls: "bg-violet-50 text-violet-700" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-(--color-text-primary)">
            {greeting}, Admin
          </h1>
          <p className="text-sm text-(--color-text-muted) mt-0.5">
            {dateStr} &mdash; here&apos;s your store at a glance
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
        >
          <Package size={15} />
          Add Product
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className={statsGridCls}>
        {stats.map((s) => (
          <StatsCard key={s.title} {...s} />
        ))}
      </div>

      {/* ── Chart + Insights ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-(--color-border) p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="min-w-0">
              <h2 className="font-semibold text-base">Revenue Overview (USD)</h2>
              <p className="text-xs text-(--color-text-muted) mt-0.5 truncate">Last 30 days · USD-settled orders</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-(--color-text-muted) shrink-0">
              <span className="w-2 h-2 rounded-full bg-(--color-primary)" />
              Revenue
            </span>
          </div>
          {revenueData.length > 0 ? (
            <RevenueChart data={revenueData} />
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-center gap-2">
              <Activity size={32} className="text-(--color-border)" />
              <p className="text-sm text-(--color-text-muted)">No revenue data yet</p>
            </div>
          )}
        </div>

        {/* Insights panel */}
        <div className="bg-white rounded-2xl border border-(--color-border) p-4 sm:p-6 flex flex-col gap-5">

          {/* Quick actions */}
          <div>
            <p className="text-xs font-bold text-(--color-text-muted) uppercase tracking-widest mb-2">
              Quick Actions
            </p>
            <div className="space-y-1">
              {quickActions.map(({ href, label, icon: Icon, colorCls }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-(--color-surface-alt) transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorCls}`}>
                    <Icon size={15} />
                  </div>
                  <span className="text-sm font-medium flex-1">{label}</span>
                  <ArrowRight
                    size={13}
                    className="text-(--color-text-muted) opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-(--color-border)" />

          {/* Store health */}
          <div>
            <p className="text-xs font-bold text-(--color-text-muted) uppercase tracking-widest mb-3">
              Store Health
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-(--color-text-muted)">Pending orders</span>
                <span className={`font-bold ${pendingOrders > 5 ? "text-red-500" : "text-(--color-success)"}`}>
                  {pendingOrders}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-(--color-text-muted)">Low stock items</span>
                <span className={`font-bold ${lowStock > 0 ? "text-amber-500" : "text-(--color-success)"}`}>
                  {lowStock}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-(--color-text-muted)">Store status</span>
                <span className="font-bold text-(--color-success) flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-(--color-success) animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent orders ── */}
      <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-(--color-border) flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-base">Recent Orders</h2>
            <p className="text-xs text-(--color-text-muted) mt-0.5">Showing last 10 orders</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm text-(--color-primary) font-medium hover:underline"
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <OrdersTable orders={recentOrders.map((o) => ({ ...o, subtotal: Number(o.subtotal), deliveryFee: Number(o.deliveryFee), discount: Number(o.discount), total: Number(o.total) }))} />
      </div>
    </div>
  );
}
