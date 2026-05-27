import type { Metadata } from "next";
import Link from "next/link";
import { getOrderById } from "@/actions/orders";
import { clearCart } from "@/actions/cart";
import { formatUSD, toNumber } from "@/lib/utils/currency";
import { CheckCircle2, MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "Order Confirmed" };

interface Props { searchParams: Promise<{ order?: string }> }

export default async function SuccessPage({ searchParams }: Props) {
  const { order: orderId } = await searchParams;
  const [order] = await Promise.all([
    orderId ? getOrderById(orderId) : Promise.resolve(null),
    clearCart(),
  ]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 size={44} className="text-(--color-success)" />
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold text-(--color-success) mb-1">Order Confirmed!</h1>
        <p className="text-(--color-text-muted)">Thank you for shopping with Dollar Shop.</p>
      </div>

      {order && (
        <div className="bg-(--color-surface-alt) rounded-2xl p-5 space-y-3 text-left">
          <div className="flex justify-between items-center">
            <span className="text-sm text-(--color-text-muted)">Order number</span>
            <span className="price font-bold text-(--color-primary)">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-(--color-text-muted)">Payment</span>
            <span className="text-sm font-medium">{order.paymentMethod}</span>
          </div>
          <div className="border-t border-(--color-border) pt-2 space-y-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-(--color-text-muted) truncate flex-1">{item.productName} ×{item.quantity}</span>
                <span className="price ml-2">{formatUSD(toNumber(item.subtotal))}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-1">
              <span>Total</span>
              <span className="price text-(--color-primary)">{formatUSD(toNumber(order.total))}</span>
            </div>
          </div>
        </div>
      )}

      <a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "263772566468"}?text=Hi! I just placed order ${order?.orderNumber ?? ""} and want to track it.`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-6 py-3 rounded-full transition-colors"
      >
        <MessageCircle size={18} />
        Track Order on WhatsApp
      </a>

      <Link href="/shop" className="block text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors">
        Continue Shopping →
      </Link>
    </div>
  );
}
