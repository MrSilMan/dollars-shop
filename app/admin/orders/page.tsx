import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ShoppingBag, Clock, CreditCard, DollarSign, Coins } from "lucide-react";
import { formatUSD, formatZWG } from "@/lib/utils/currency";
import { OrderFilters } from "./_components/OrderFilters";
import { OrdersClient } from "./_components/OrdersClient";

export const metadata: Metadata = { title: "Orders — Admin | Dollar Shop" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { search = "", status = "", payment = "" } = await searchParams;
  const searchStr  = Array.isArray(search)  ? (search[0]  ?? "") : search;
  const statusStr  = Array.isArray(status)  ? (status[0]  ?? "") : status;
  const paymentStr = Array.isArray(payment) ? (payment[0] ?? "") : payment;

  const allOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
      transactions: {
        where: { provider: "ECOCASH", currency: { not: "USD" }, status: { in: ["COMPLETED", "REFUNDED"] } },
        select: { currency: true, amount: true, exchangeRate: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
    take: 200,
  });

  const orders = allOrders.filter((o) => {
    const term = searchStr.toLowerCase();
    const shippingName = (o.shippingAddress as { name?: string } | null)?.name;
    const matchesSearch =
      !searchStr ||
      o.orderNumber.toLowerCase().includes(term) ||
      o.user?.name?.toLowerCase().includes(term) ||
      o.user?.email.toLowerCase().includes(term) ||
      o.guestEmail?.toLowerCase().includes(term) ||
      shippingName?.toLowerCase().includes(term);
    const matchesStatus  = !statusStr  || o.status        === statusStr;
    const matchesPayment = !paymentStr || o.paymentStatus === paymentStr;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const pendingCount  = allOrders.filter((o) => o.status        === "PENDING").length;
  const paidCount     = allOrders.filter((o) => o.paymentStatus === "PAID").length;

  // Revenue is separated by the currency the money was actually collected in:
  // USD orders count their USD total; ZiG orders count the ZWG amount that
  // landed in the ZiG wallet (not its USD equivalent).
  let usdRevenue = 0;
  let zwgRevenue = 0;
  for (const o of allOrders) {
    if (o.paymentStatus !== "PAID") continue;
    const settled = o.transactions[0];
    if (settled && settled.currency === "ZWG") zwgRevenue += Number(settled.amount);
    else usdRevenue += Number(o.total);
  }

  const summaryItems = [
    { label: "Total Orders",  value: allOrders.length,        icon: ShoppingBag, cls: "bg-slate-50   text-slate-700",   bar: "from-slate-400"   },
    { label: "Pending",       value: pendingCount,            icon: Clock,       cls: "bg-amber-50   text-amber-700",   bar: "from-amber-500"   },
    { label: "Paid",          value: paidCount,               icon: CreditCard,  cls: "bg-emerald-50 text-emerald-700", bar: "from-emerald-500" },
    { label: "Revenue (USD)", value: formatUSD(usdRevenue),   icon: DollarSign,  cls: "bg-green-50   text-green-800",   bar: "from-green-800"   },
    ...(zwgRevenue > 0
      ? [{ label: "Revenue (ZiG)", value: formatZWG(zwgRevenue), icon: Coins, cls: "bg-teal-50 text-teal-800", bar: "from-teal-500" }]
      : []),
  ];
  // Odd counts leave a hole in the two-column phone grid — let the last tile span.
  const summaryGridCls = [
    "grid grid-cols-2 gap-2.5 sm:gap-3",
    zwgRevenue > 0 ? "sm:grid-cols-3 xl:grid-cols-5" : "sm:grid-cols-4",
    summaryItems.length % 2 === 1 ? "max-sm:[&>*:last-child]:col-span-2" : "",
  ].join(" ");

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── Header ── */}
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-(--color-text-primary)">Orders</h1>
        <p className="text-sm text-(--color-text-muted) mt-0.5">
          Monitor and manage all customer orders &mdash; {allOrders.length} total
        </p>
      </div>

      {/* ── Summary ── */}
      <div className={summaryGridCls}>
        {summaryItems.map(({ label, value, icon: Icon, cls, bar }) => (
          <div
            key={label}
            className="relative overflow-hidden flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-white border border-(--color-border) px-3 py-3 sm:px-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className={`absolute inset-x-0 top-0 h-0.75 bg-linear-to-r ${bar} to-transparent`} />
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
              <Icon size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold leading-none tracking-tight tabular-nums truncate" title={String(value)}>
                {value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-(--color-text-muted) mt-1 truncate">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-(--color-border) p-4">
        <Suspense fallback={<div className="h-10 rounded-xl bg-(--color-surface-alt) animate-pulse" />}>
          <OrderFilters
            initialSearch={searchStr}
            initialStatus={statusStr}
            initialPayment={paymentStr}
            total={allOrders.length}
            filtered={orders.length}
          />
        </Suspense>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-(--color-border) flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-base">
              {statusStr || paymentStr || searchStr ? "Filtered Orders" : "All Orders"}
            </h2>
            <p className="text-xs text-(--color-text-muted) mt-0.5">
              Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <OrdersClient orders={orders.map((o) => ({
            ...o,
            total: Number(o.total),
            subtotal: Number(o.subtotal),
            deliveryFee: Number(o.deliveryFee),
            discount: Number(o.discount),
            shippingAddress: o.shippingAddress as Record<string, string>,
            items: o.items.map(i => ({
              ...i,
              price: Number(i.price),
              subtotal: Number(i.subtotal),
            })),
            payment: o.transactions[0]
              ? {
                  currency: o.transactions[0].currency,
                  amount: Number(o.transactions[0].amount),
                  exchangeRate: o.transactions[0].exchangeRate ? Number(o.transactions[0].exchangeRate) : null,
                }
              : null,
          }))} />
      </div>
    </div>
  );
}
