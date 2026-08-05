"use client";

import { useState } from "react";
import { updateOrderStatus, markCODPaymentReceived, refundEcoCashOrder } from "@/actions/admin/orders";
import { formatUSD, formatZWG } from "@/lib/utils/currency";
import { X, Loader2, Package, BanknoteIcon, Undo2 } from "lucide-react";
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
  fulfillmentType?: string;
  shippingAddress: Record<string, string>;
  createdAt: Date;
  items: OrderItem[];
  user?: { name?: string | null; email: string } | null;
  guestEmail?: string | null;
  payment?: { currency: string; amount: number; exchangeRate: number | null } | null;
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
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
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

  const handleMarkPaid = async () => {
    setPayLoading(true);
    setError(null);
    setSuccess(null);
    const result = await markCODPaymentReceived(order.id);
    setPayLoading(false);
    if ("error" in result) { setError(result.error ?? null); return; }
    setPaymentStatus("PAID");
    setStatus("DELIVERED");
    setSuccess("Cash payment confirmed. Order marked as Delivered.");
    router.refresh();
  };

  const [refundLoading, setRefundLoading] = useState(false);

  const handleRefund = async () => {
    if (!window.confirm(`Refund ${formatUSD(n(order.total))} to the customer's EcoCash wallet? This cannot be undone.`)) return;
    setRefundLoading(true);
    setError(null);
    setSuccess(null);
    const result = await refundEcoCashOrder(order.id);
    setRefundLoading(false);
    if ("error" in result) { setError(result.error ?? null); return; }
    setPaymentStatus("REFUNDED");
    setStatus("REFUNDED");
    setSuccess("Refund sent to the customer's EcoCash wallet.");
    router.refresh();
  };

  const addr = order.shippingAddress ?? {};
  const isPickup = order.fulfillmentType === "PICKUP";

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

          {/* COD cash collection */}
          {order.paymentMethod === "CASH_ON_DELIVERY" && paymentStatus !== "PAID" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-amber-800">Cash not yet collected</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {isPickup ? "Confirm once the customer pays at the counter." : "Confirm once driver hands over the cash."}
                </p>
              </div>
              <button
                type="button"
                disabled={payLoading}
                onClick={handleMarkPaid}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50 shrink-0"
              >
                {payLoading ? <Loader2 size={12} className="animate-spin" /> : <BanknoteIcon size={12} />}
                Mark as Paid
              </button>
            </div>
          )}

          {/* EcoCash refund */}
          {order.paymentMethod === "ECOCASH" && paymentStatus === "PAID" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-red-800">Paid via EcoCash</p>
                <p className="text-xs text-red-600 mt-0.5">Reverse the payment back to the customer&apos;s wallet.</p>
              </div>
              <button
                type="button"
                disabled={refundLoading}
                onClick={handleRefund}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 shrink-0"
              >
                {refundLoading ? <Loader2 size={12} className="animate-spin" /> : <Undo2 size={12} />}
                Refund {formatUSD(n(order.total))}
              </button>
            </div>
          )}

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[status] ?? "bg-gray-100 text-gray-600"}`}>
              {status}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
              {paymentStatus.replace(/_/g, " ")}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
              {order.paymentMethod.replace(/_/g, " ").toLowerCase()}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isPickup ? "bg-violet-50 text-violet-700" : "bg-sky-50 text-sky-700"}`}>
              {isPickup ? "Collect in store" : "Delivery"}
            </span>
          </div>

          {/* Customer */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-(--color-text-muted) mb-2">Customer</p>
            <p className="font-medium">{addr.name ?? order.user?.name ?? "Guest"}</p>
            <p className="text-sm text-(--color-text-muted)">{order.user?.email ?? order.guestEmail ?? addr.email}</p>
            {addr.phone && <p className="text-sm text-(--color-text-muted)">{addr.phone}</p>}
          </div>

          {/* Shipping address / collection point */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-(--color-text-muted) mb-2">
              {isPickup ? "Collection Point" : "Delivery Address"}
            </p>
            <p className="text-sm leading-relaxed">
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
              {addr.city}, {addr.province}, Zimbabwe
            </p>
            {isPickup && (
              <p className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 mt-2">
                Customer collects in store — nothing to dispatch. Mark as <strong>SHIPPED</strong> once it&apos;s packed
                and waiting at the counter, then <strong>DELIVERED</strong> when they pick it up.
              </p>
            )}
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
              <span>{isPickup ? "Collection" : "Delivery"}</span><span>{n(order.deliveryFee) === 0 ? "FREE" : formatUSD(n(order.deliveryFee))}</span>
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
            {order.payment?.currency === "ZWG" && (
              <div className="flex justify-between items-center border-t border-(--color-border) pt-2 mt-1 text-teal-700">
                <span className="font-medium">
                  Paid in ZiG
                  {order.payment.exchangeRate ? (
                    <span className="text-xs text-(--color-text-muted) font-normal"> · US$1 = {order.payment.exchangeRate} ZiG</span>
                  ) : null}
                </span>
                <span className="price font-bold">{formatZWG(order.payment.amount)}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-(--color-text-muted)">
            Placed {new Intl.DateTimeFormat("en-ZW", { dateStyle: "long", timeStyle: "short" }).format(new Date(order.createdAt))}
          </p>
        </div>
      </div>
    </div>
  );
}
