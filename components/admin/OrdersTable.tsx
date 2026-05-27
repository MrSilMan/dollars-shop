import Link from "next/link";
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

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const paymentColors: Record<string, string> = {
  UNPAID: "bg-gray-100 text-gray-600",
  PENDING_VERIFICATION: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

export function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-(--color-border)">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-(--color-border) bg-(--color-surface-alt)">
            <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Order</th>
            <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Customer</th>
            <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Status</th>
            <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Payment</th>
            <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Total</th>
            <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--color-border)">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-(--color-surface-alt) transition-colors">
              <td className="px-4 py-3">
                <Link href={`/admin/orders?id=${order.id}`} className="font-medium text-(--color-primary) hover:underline price">
                  {order.orderNumber}
                </Link>
              </td>
              <td className="px-4 py-3 text-(--color-text-muted)">
                {order.user?.name ?? order.user?.email ?? order.guestEmail ?? "Guest"}
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status] ?? "bg-gray-100"}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full w-fit ${paymentColors[order.paymentStatus] ?? "bg-gray-100"}`}>
                    {order.paymentStatus.replace("_", " ")}
                  </span>
                  <span className="text-xs text-(--color-text-muted)">{order.paymentMethod}</span>
                </div>
              </td>
              <td className="px-4 py-3 price font-semibold">{formatUSD(Number(order.total))}</td>
              <td className="px-4 py-3 text-(--color-text-muted) whitespace-nowrap">
                {new Intl.DateTimeFormat("en-ZW", { dateStyle: "medium" }).format(new Date(order.createdAt))}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-10 text-(--color-text-muted)">No orders yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
