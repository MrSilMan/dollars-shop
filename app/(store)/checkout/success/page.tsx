import type { Metadata } from "next";
import Link from "next/link";
import { ProductImage as Image } from "@/components/shared/ProductImage";
import { getOrderById } from "@/actions/orders";
import { clearCart } from "@/actions/cart";
import { getFeaturedProducts } from "@/actions/products";
import { getBlurMapForProducts } from "@/lib/images";
import { formatUSD, toNumber } from "@/lib/utils/currency";
import { CheckCircle2, MessageCircle, Package, Truck, ClipboardList, MapPin, Store, Clock } from "lucide-react";
import { STORE_PICKUP_LOCATION } from "@/lib/store-location";
import { ConfettiEffect } from "./_components/ConfettiEffect";
import { DownloadReceiptButton } from "./_components/DownloadReceiptButton";

export const metadata: Metadata = { title: "Order Confirmed" };

interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  province: string;
  country: string;
}

function formatPaymentMethod(method: string, isPickup: boolean) {
  const labels: Record<string, string> = {
    CASH_ON_DELIVERY: isPickup ? "Cash on Collection" : "Cash on Delivery",
    ECOCASH: "EcoCash",
    INNBUCKS: "InnBucks",
  };
  return labels[method] ?? method;
}

const DELIVERY_STEPS = [
  { icon: ClipboardList, label: "Order Received",  desc: "We have your order and are getting it ready." },
  { icon: Package,       label: "Being Packed",     desc: "Your items are carefully packed for shipping." },
  { icon: Truck,         label: "Out for Delivery", desc: "On its way to you in 2–4 business days." },
];

const PICKUP_STEPS = [
  { icon: ClipboardList, label: "Order Received", desc: "We have your order and are getting it ready." },
  { icon: Package,       label: "Being Packed",   desc: "Your items are set aside and packed for you." },
  { icon: Store,         label: "Ready to Collect", desc: "We'll message you as soon as it's waiting in store." },
];

interface Props { searchParams: Promise<{ order?: string }> }

export default async function SuccessPage({ searchParams }: Props) {
  const { order: orderId } = await searchParams;
  const [order, , featuredProducts] = await Promise.all([
    orderId ? getOrderById(orderId) : Promise.resolve(null),
    clearCart(),
    getFeaturedProducts(),
  ]);

  const address = order?.shippingAddress as ShippingAddress | undefined;
  const isPickup = order?.fulfillmentType === "PICKUP";
  const nextSteps = isPickup ? PICKUP_STEPS : DELIVERY_STEPS;
  const purchasedIds = new Set(order?.items.map((i) => i.productId) ?? []);
  const recommendations = featuredProducts.filter((p) => !purchasedIds.has(p.id)).slice(0, 4);
  const blurMap = await getBlurMapForProducts(recommendations);

  return (
    <>
      <ConfettiEffect />

      <div className="max-w-2xl mx-auto px-4 py-16 space-y-10 print:py-4">

        {/* ── Header ── */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={44} className="text-(--color-success)" />
          </div>
          <h1 className="font-display text-2xl font-bold text-(--color-success)">Order Confirmed!</h1>
          <p className="text-(--color-text-muted)">
            Thank you for shopping with Dollar Shop. A confirmation will be sent to your contact.
          </p>
        </div>

        {/* ── Order Card ── */}
        {order && (
          <div className="bg-(--color-surface-alt) rounded-2xl p-5 space-y-4 text-left">
            <div className="flex justify-between items-center">
              <span className="text-sm text-(--color-text-muted)">Order number</span>
              <span className="price font-bold text-(--color-primary)">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-(--color-text-muted)">Payment</span>
              <span className="text-sm font-medium">{formatPaymentMethod(order.paymentMethod, isPickup)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-(--color-text-muted)">
                {isPickup ? "Ready to collect" : "Estimated delivery"}
              </span>
              <span className="text-sm font-semibold text-(--color-primary)">
                {isPickup ? "Within 24 hours" : "2–4 business days"}
              </span>
            </div>

            {/* Items */}
            <div className="border-t border-(--color-border) pt-3 space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-(--color-text-muted) truncate flex-1">
                    {item.productName} ×{item.quantity}
                  </span>
                  <span className="price ml-2">{formatUSD(toNumber(item.subtotal))}</span>
                </div>
              ))}
              {toNumber(order.deliveryFee) > 0 && (
                <div className="flex justify-between text-sm text-(--color-text-muted)">
                  <span>{isPickup ? "Collection fee" : "Delivery fee"}</span>
                  <span className="price">{formatUSD(toNumber(order.deliveryFee))}</span>
                </div>
              )}
              {toNumber(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="price">-{formatUSD(toNumber(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-(--color-border) mt-1">
                <span>Total</span>
                <span className="price text-(--color-primary)">{formatUSD(toNumber(order.total))}</span>
              </div>
            </div>

            {/* Collection point / shipping address */}
            {isPickup ? (
              <div className="border-t border-(--color-border) pt-3 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
                  Collection point
                </p>
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="text-(--color-text-muted) mt-0.5 shrink-0" />
                  <div className="text-sm leading-relaxed">
                    <p className="font-medium">{STORE_PICKUP_LOCATION.name}</p>
                    <p className="text-(--color-text-muted)">{STORE_PICKUP_LOCATION.line1}</p>
                    <p className="text-(--color-text-muted)">
                      {STORE_PICKUP_LOCATION.city}, {STORE_PICKUP_LOCATION.country}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-(--color-text-muted)">
                  <Clock size={15} className="shrink-0" />
                  <span>{STORE_PICKUP_LOCATION.hours}</span>
                </div>
                <p className="text-xs text-(--color-text-muted)">
                  Bring order <strong>{order.orderNumber}</strong> and an ID when you collect.
                </p>
              </div>
            ) : address && (
              <div className="border-t border-(--color-border) pt-3">
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="text-(--color-text-muted) mt-0.5 shrink-0" />
                  <div className="text-sm leading-relaxed">
                    <p className="font-medium">{address.name}</p>
                    <p className="text-(--color-text-muted)">
                      {address.line1}{address.line2 ? `, ${address.line2}` : ""}
                    </p>
                    <p className="text-(--color-text-muted)">
                      {address.city}, {address.province}, {address.country}
                    </p>
                    <p className="text-(--color-text-muted)">{address.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── What happens next ── */}
        <div className="space-y-3 print:hidden">
          <h2 className="font-display font-semibold text-xs uppercase tracking-wider text-(--color-text-muted)">
            What happens next?
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {nextSteps.map(({ icon: Icon, label, desc }, i) => (
              <div
                key={i}
                className="bg-(--color-surface) border border-(--color-border) rounded-xl p-3 text-center space-y-2"
              >
                <div className="w-9 h-9 bg-(--color-primary-light) rounded-full flex items-center justify-center mx-auto">
                  <Icon size={17} className="text-(--color-primary)" />
                </div>
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-xs text-(--color-text-muted) leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col items-center gap-3 print:hidden">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "263772566468"}?text=Hi! I just placed order ${order?.orderNumber ?? ""} and would like to track it.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <MessageCircle size={18} />
            Track Order on WhatsApp
          </a>

          {order && <DownloadReceiptButton orderId={order.id} />}

          <Link
            href="/shop"
            className="text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors"
          >
            Continue Shopping →
          </Link>
        </div>

        {/* ── Recommendations ── */}
        {recommendations.length > 0 && (
          <div className="space-y-4 print:hidden">
            <h2 className="font-display font-semibold text-lg">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recommendations.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="bg-(--color-surface) border border-(--color-border) rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-square relative bg-(--color-surface-alt)">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 25vw"
                        blurDataURL={blurMap[product.images[0]]}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-(--color-text-muted)">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 space-y-0.5">
                    <p className="text-xs font-medium line-clamp-2 leading-snug">{product.name}</p>
                    <p className="price text-sm font-bold text-(--color-primary)">{formatUSD(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
