"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/actions/admin/orders";
import { formatUSD } from "@/lib/utils/currency";
import { X, Loader2, Package } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  price: number | { toNumber: () => number };
  subtotal: number | { toNumber: () => number };
  variantSnapshot?: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number | { toNumber: () => number };
  subtotal: number | { toNumber: () => number };
  deliveryFee: number | { toNumber: () => number };
  discount: number | { toNumber: () => number };
  couponCode?: string | null;
  shippingAddress: Record<string, string>;
  createdAt: Date;
  items: OrderItem[];
  user?: { name?: string | null; email: string } | null;
  guestEmail?: string | null;
}

const STATUSES = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;
type S = typeof STATUSES[number];

const statusColors: Record<string, string> = {
  PENDING:    "bg-amber-50 text-amber-700",
  CONFIRMED:  "bg-blue-50 text-blue-700",
  PROCESSING: "bg-indigo-50 text-indigo-700",
  SHIPPED:    "bg-cyan-50 text-cyan-700",
  DELIVERED:  "bg-emerald-50 text-emerald-700",
  CANCELLED:  "bg-red-50 text-red-600",
  REFUNDED:   "bg-gray-100 text-gray-500",
};

function n(v: number | { toNumber: () => number }) {
  return typeof v === "number" ? v : v.toNumber();
}

export function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusChange = async (newStatus: S) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const result = await updateOrderStatus(order.id, newStatus);
    setLoading(false);
    if ("error" in result) { setError(result.error ?? null); return; }
    setStatus(newStatus);
    setSuccess(`Status updated to ${newStatus}. Customer notified via email & WhatsApp.`);
    router.refresh();
  };

  const addr = order.shippingAddress ?? {};

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-(--color-border) px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-(--color-text-muted) font-mono">{order.orderNumber}</p>
            <h2 className="font-bold text-base">Order Details</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 hover:bg-(--color-surface-alt) rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status updater */}
          <div className="bg-(--color-surface-alt) rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-(--color-text-muted) mb-3">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  disabled={loading || status === s}
                  onClick={() => handleStatusChange(s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-colors disabled:opacity-50
                    ${status === s
                      ? "border-(--color-primary) bg-(--color-primary) text-white"
                      : "border-(--color-border) hover:border-primary/50 bg-white"
                    }`}
                >
                  {loading && status !== s ? <Loader2 size={10} className="animate-spin inline mr-1" /> : null}
                  {s}
                </button>
              ))}
            </div>
            {success && <p className="text-xs text-emerald-600 mt-2">{success}</p>}
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          </div>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[status] ?? "bg-gray-100 text-gray-600"}`}>
              {status}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
              {order.paymentStatus.replace(/_/g, " ")}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
              {order.paymentMethod.replace(/_/g, " ").toLowerCase()}
            </span>
          </div>

          {/* Customer */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-(--color-text-muted) mb-2">Customer</p>
            <p className="font-medium">{addr.name ?? order.user?.name ?? "Guest"}</p>
            <p className="text-sm text-(--color-text-muted)">{order.user?.email ?? order.guestEmail ?? addr.email}</p>
            {addr.phone && <p className="text-sm text-(--color-text-muted)">{addr.phone}</p>}
          </div>

          {/* Shipping address */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-(--color-text-muted) mb-2">Delivery Address</p>
            <p className="text-sm leading-relaxed">
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
              {addr.city}, {addr.province}, Zimbabwe
            </p>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-(--color-text-muted) mb-2">Items</p>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex items-start gap-3 py-2 border-b border-(--color-border) last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-(--color-surface-alt) flex items-center justify-center shrink-0">
                    <Package size={14} className="text-(--color-text-muted)" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{item.productName}</p>
                    {item.variantSnapshot && <p className="text-xs text-(--color-text-muted)">{item.variantSnapshot}</p>}
                    <p className="text-xs text-(--color-text-muted)">{item.productSku} · ×{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">{formatUSD(n(item.subtotal))}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-(--color-surface-alt) rounded-xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-(--color-text-muted)">
              <span>Subtotal</span><span>{formatUSD(n(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-(--color-text-muted)">
              <span>Delivery</span><span>{n(order.deliveryFee) === 0 ? "FREE" : formatUSD(n(order.deliveryFee))}</span>
            </div>
            {n(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>-{formatUSD(n(order.discount))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-(--color-border) pt-2 mt-1">
              <span>Total</span>
              <span className="text-(--color-primary)">{formatUSD(n(order.total))}</span>
            </div>
          </div>

          <p className="text-xs text-(--color-text-muted)">
            Placed {new Intl.DateTimeFormat("en-ZW", { dateStyle: "long", timeStyle: "short" }).format(new Date(order.createdAt))}
          </p>
        </div>
      </div>
    </div>
  );
}
