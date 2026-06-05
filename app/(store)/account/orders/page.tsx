import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyOrders } from "@/actions/orders";
import { formatUSD, toNumber } from "@/lib/utils/currency";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle,
  Settings2,
  Truck,
  CheckCheck,
  XCircle,
  ShoppingBag,
  ArrowLeft,
  TrendingUp,
  ReceiptText,
} from "lucide-react";

export const metadata: Metadata = { title: "My Orders | Dollar Shop" };

const statusConfig: Record<
  string,
  { label: string; badge: string; border: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    border: "border-l-amber-400",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    border: "border-l-blue-400",
    icon: CheckCircle,
  },
  PROCESSING: {
    label: "Processing",
    badge: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
    border: "border-l-indigo-400",
    icon: Settings2,
  },
  SHIPPED: {
    label: "Shipped",
    badge: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",
    border: "border-l-cyan-400",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    badge: "bg-green-50 text-green-700 ring-1 ring-green-200",
    border: "border-l-green-500",
    icon: CheckCheck,
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-red-50 text-red-600 ring-1 ring-red-200",
    border: "border-l-red-400",
    icon: XCircle,
  },
};

const fallbackConfig = {
  label: "Unknown",
  badge: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
  border: "border-l-gray-300",
  icon: Package,
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/orders");
  const orders = await getMyOrders();

  const totalSpent = orders.reduce((s, o) => s + toNumber(o.total), 0);
  const activeOrders = orders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status)
  ).length;

  return (
    <div className="min-h-screen bg-(--color-bg)">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="w-9 h-9 rounded-xl bg-white border border-(--color-border) flex items-center justify-center text-(--color-text-muted) hover:text-(--color-primary) hover:border-(--color-primary) transition-all shadow-sm"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-(--color-text-primary)">
                My Orders
              </h1>
              <p className="text-xs text-(--color-text-muted) mt-0.5">
                {orders.length} {orders.length === 1 ? "order" : "orders"} placed
              </p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        {orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: ReceiptText,
                label: "Total Orders",
                value: String(orders.length),
                accent: "bg-violet-50 text-violet-600",
              },
              {
                icon: Clock,
                label: "Active",
                value: String(activeOrders),
                accent: "bg-amber-50 text-amber-600",
              },
              {
                icon: TrendingUp,
                label: "Total Spent",
                value: formatUSD(totalSpent),
                accent: "bg-green-50 text-green-700",
              },
            ].map(({ icon: Icon, label, value, accent }) => (
              <div
                key={label}
                className="bg-white border border-(--color-border) rounded-2xl px-4 py-3.5 shadow-sm"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${accent}`}>
                  <Icon size={15} />
                </div>
                <p className="price text-base font-bold text-(--color-text-primary)">{value}</p>
                <p className="text-xs text-(--color-text-muted) mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Orders list */}
        {orders.length === 0 ? (
          <div className="bg-white border border-(--color-border) rounded-3xl px-6 py-16 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-(--color-primary-light) flex items-center justify-center mx-auto">
              <Package size={28} className="text-(--color-primary)" />
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-(--color-text-primary)">No orders yet</p>
              <p className="text-sm text-(--color-text-muted)">
                Your order history will appear here once you make a purchase.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              <ShoppingBag size={15} />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const sc = statusConfig[order.status] ?? fallbackConfig;
              const StatusIcon = sc.icon;
              const formattedDate = new Intl.DateTimeFormat("en-ZW", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(order.createdAt));

              return (
                <div
                  key={order.id}
                  className={`bg-white border border-(--color-border) border-l-4 ${sc.border} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
                >
                  {/* Order header */}
                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-(--color-primary-light) flex items-center justify-center shrink-0">
                        <ShoppingBag size={16} className="text-(--color-primary)" />
                      </div>
                      <div className="min-w-0">
                        <p className="price text-sm font-bold text-(--color-text-primary)">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-(--color-text-muted) mt-0.5">
                          {formattedDate}
                          {order.items.length > 0 && (
                            <> · {order.items.length} item{order.items.length !== 1 ? "s" : ""}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.badge}`}>
                        <StatusIcon size={11} />
                        {sc.label}
                      </span>
                      <p className="price text-sm font-bold text-(--color-primary)">
                        {formatUSD(toNumber(order.total))}
                      </p>
                    </div>
                  </div>

                  {/* Order items */}
                  {order.items.length > 0 && (
                    <div className="border-t border-(--color-border) mx-5 pt-3 pb-4 space-y-1.5">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-(--color-text-muted) flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-(--color-border) shrink-0" />
                            {item.productName}
                            <span className="text-(--color-text-muted) font-medium">
                              ×{item.quantity}
                            </span>
                          </span>
                          <span className="price text-(--color-text-primary) font-medium tabular-nums">
                            {formatUSD(toNumber(item.subtotal))}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
