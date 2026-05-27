import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyOrders } from "@/actions/orders";
import { formatUSD, toNumber } from "@/lib/utils/currency";
import Link from "next/link";

export const metadata: Metadata = { title: "My Orders" };

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/orders");
  const orders = await getMyOrders();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account" className="text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors">← Account</Link>
        <h1 className="font-display text-2xl font-bold">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">📦</p>
          <p className="font-medium text-(--color-text-muted)">No orders yet</p>
          <Link href="/shop" className="inline-block bg-(--color-primary) text-white font-semibold px-6 py-2.5 rounded-full hover:bg-(--color-primary-dark) transition-colors text-sm">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-(--color-border) rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-(--color-border) bg-(--color-surface-alt)">
                <div>
                  <p className="price font-bold text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-(--color-text-muted)">{new Intl.DateTimeFormat("en-ZW", { dateStyle: "long" }).format(new Date(order.createdAt))}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status] ?? "bg-gray-100"}`}>
                    {order.status}
                  </span>
                  <p className="price font-bold text-(--color-primary)">{formatUSD(toNumber(order.total))}</p>
                </div>
              </div>
              <div className="px-5 py-3 space-y-1.5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-(--color-text-muted)">{item.productName} ×{item.quantity}</span>
                    <span className="price">{formatUSD(toNumber(item.subtotal))}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
