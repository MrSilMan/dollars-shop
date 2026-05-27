"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatUSD } from "@/lib/utils/currency";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number | string | { toNumber: () => number };
  createdAt: Date;
  user?: { name?: string | null; email: string } | null;
  guestEmail?: string | null;
}

const statusConfig: Record<string, { badge: string; dot: string }> = {
  PENDING:    { badge: "bg-amber-50 text-amber-700",   dot: "bg-amber-400" },
  CONFIRMED:  { badge: "bg-blue-50 text-blue-700",     dot: "bg-blue-400" },
  PROCESSING: { badge: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-400" },
  SHIPPED:    { badge: "bg-cyan-50 text-cyan-700",     dot: "bg-cyan-400" },
  DELIVERED:  { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-400" },
  CANCELLED:  { badge: "bg-red-50 text-red-600",       dot: "bg-red-400" },
  REFUNDED:   { badge: "bg-gray-100 text-gray-500",    dot: "bg-gray-400" },
};

const paymentConfig: Record<string, string> = {
  UNPAID:               "bg-gray-100 text-gray-600",
  PENDING_VERIFICATION: "bg-yellow-50 text-yellow-700",
  PAID:                 "bg-emerald-50 text-emerald-700",
  FAILED:               "bg-red-50 text-red-600",
  REFUNDED:             "bg-gray-100 text-gray-500",
};

export function OrdersTable({ orders, onRowClick }: { orders: Order[]; onRowClick?: (id: string) => void }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-(--color-surface-alt) flex items-center justify-center mb-3">
          <ShoppingBag size={24} className="text-(--color-text-muted)" />
        </div>
        <p className="font-semibold text-(--color-text-primary)">No orders yet</p>
        <p className="text-sm text-(--color-text-muted) mt-0.5">
          Orders will appear here once customers start buying
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-(--color-surface-alt)">
            {["Order", "Customer", "Status", "Payment", "Total", "Date"].map((h, i) => (
              <th
                key={h}
                className={`px-5 py-3 text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide ${i === 4 ? "text-right" : "text-left"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-(--color-border)">
          {orders.map((order) => {
            const st = statusConfig[order.status]  ?? { badge: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
            const pm = paymentConfig[order.paymentStatus] ?? "bg-gray-100 text-gray-600";

            return (
              <tr key={order.id} onClick={() => onRowClick?.(order.id)} className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-green-50/50" : "hover:bg-green-50/30"}`}>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/orders?id=${order.id}`}
                    className="font-semibold text-(--color-primary) hover:underline price text-xs tracking-wide"
                  >
                    {order.orderNumber}
                  </Link>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium text-(--color-text-primary) leading-tight">
                    {order.user?.name ?? "Guest"}
                  </p>
                  <p className="text-xs text-(--color-text-muted) mt-0.5">
                    {order.user?.email ?? order.guestEmail ?? ""}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${st.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                    {order.status}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${pm}`}>
                    {order.paymentStatus.replace(/_/g, " ")}
                  </span>
                  <p className="text-xs text-(--color-text-muted) mt-1 capitalize">
                    {order.paymentMethod?.toLowerCase()}
                  </p>
                </td>

                <td className="px-5 py-4 text-right">
                  <span className="price font-bold text-(--color-text-primary) text-sm">
                    {formatUSD(Number(order.total))}
                  </span>
                </td>

                <td className="px-5 py-4 text-(--color-text-muted) whitespace-nowrap text-xs">
                  {new Intl.DateTimeFormat("en-ZW", { dateStyle: "medium" }).format(
                    new Date(order.createdAt)
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
