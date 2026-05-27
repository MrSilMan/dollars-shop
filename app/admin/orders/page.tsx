import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { ShoppingBag, Clock, CreditCard, DollarSign } from "lucide-react";
import { formatUSD } from "@/lib/utils/currency";
import { OrderFilters } from "./_components/OrderFilters";

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
    include: { user: { select: { name: true, email: true } } },
    take: 200,
  });

  const orders = allOrders.filter((o) => {
    const term = searchStr.toLowerCase();
    const matchesSearch =
      !searchStr ||
      o.orderNumber.toLowerCase().includes(term) ||
      o.user?.name?.toLowerCase().includes(term) ||
      o.user?.email.toLowerCase().includes(term) ||
      o.guestEmail?.toLowerCase().includes(term);
    const matchesStatus  = !statusStr  || o.status        === statusStr;
    const matchesPayment = !paymentStr || o.paymentStatus === paymentStr;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const pendingCount  = allOrders.filter((o) => o.status        === "PENDING").length;
  const paidCount     = allOrders.filter((o) => o.paymentStatus === "PAID").length;
  const totalRevenue  = allOrders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const summaryItems = [
    { label: "Total Orders",   value: allOrders.length,       icon: ShoppingBag,  cls: "bg-slate-50  text-slate-700"  },
    { label: "Pending",        value: pendingCount,            icon: Clock,        cls: "bg-amber-50  text-amber-700"  },
    { label: "Paid",           value: paidCount,               icon: CreditCard,   cls: "bg-emerald-50 text-emerald-700" },
    { label: "Total Revenue",  value: formatUSD(totalRevenue), icon: DollarSign,   cls: "bg-green-50  text-green-800"  },
  ];

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── Header ── */}
      <div>
        <h1 className="font-display text-2xl font-bold text-(--color-text-primary)">Orders</h1>
        <p className="text-sm text-(--color-text-muted) mt-0.5">
          Monitor and manage all customer orders &mdash; {allOrders.length} total
        </p>
      </div>

      {/* ── Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryItems.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${cls} border border-current/10`}>
            <Icon size={16} className="shrink-0 opacity-70" />
            <div className="min-w-0">
              <p className="text-xl font-bold leading-none truncate">{value}</p>
              <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
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
        <div className="px-6 py-4 border-b border-(--color-border) flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-base">
              {statusStr || paymentStr || searchStr ? "Filtered Orders" : "All Orders"}
            </h2>
            <p className="text-xs text-(--color-text-muted) mt-0.5">
              Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <OrdersTable orders={orders.map((o) => ({ ...o, total: Number(o.total) }))} />
      </div>
    </div>
  );
}
