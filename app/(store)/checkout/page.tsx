import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCartItems } from "@/actions/cart";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { formatUSD, toNumber } from "@/lib/utils/currency";
import Image from "next/image";
import { ShieldCheck, Truck, BadgeCheck } from "lucide-react";
import { DeliveryProgressBar } from "@/app/(store)/cart/_components/DeliveryProgressBar";

export const metadata: Metadata = { title: "Checkout" };

const FREE_THRESHOLD = 15;
const DELIVERY_FEE = 3;

export default async function CheckoutPage() {
  const [session, cartItems] = await Promise.all([auth(), getCartItems()]);
  if (!session) redirect("/login?callbackUrl=/checkout");
  if (cartItems.length === 0) redirect("/cart");

  const userPhone = session?.user?.id
    ? (await prisma.user.findUnique({ where: { id: session.user.id }, select: { phone: true } }))?.phone ?? undefined
    : undefined;

  const subtotal = cartItems.reduce((s, i) => s + toNumber(i.product.price) * i.quantity, 0);
  const deliveryFee = subtotal >= FREE_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutForm
            cartItems={cartItems.map((i) => ({
              id: i.id,
              quantity: i.quantity,
              product: { name: i.product.name, price: toNumber(i.product.price), images: i.product.images },
            }))}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            defaultEmail={session?.user?.email ?? undefined}
            defaultName={session?.user?.name ?? undefined}
            defaultPhone={userPhone}
          />
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-(--color-border) rounded-2xl p-5 space-y-4 sticky top-24 shadow-sm">
            <h2 className="font-semibold text-base">Order Summary</h2>

            {/* Free delivery progress */}
            {subtotal < FREE_THRESHOLD && (
              <div className="bg-(--color-accent-light) rounded-xl px-3 py-2.5 text-xs">
                Add <strong className="price">{formatUSD(FREE_THRESHOLD - subtotal)}</strong> more for free delivery!
                <DeliveryProgressBar percent={(subtotal / FREE_THRESHOLD) * 100} />
              </div>
            )}

            {/* Items with thumbnails */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-(--color-surface-alt)">
                    <Image
                      src={item.product.images[0] ?? "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="line-clamp-2 flex-1 text-(--color-text-muted) text-xs leading-tight">
                    {item.product.name} ×{item.quantity}
                  </span>
                  <span className="price font-medium text-xs shrink-0 ml-1">
                    {formatUSD(toNumber(item.product.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-(--color-border) pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-(--color-text-muted)">Subtotal</span>
                <span className="price">{formatUSD(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-text-muted)">Delivery</span>
                <span className={`price ${deliveryFee === 0 ? "text-(--color-success) font-semibold" : ""}`}>
                  {deliveryFee === 0 ? "FREE" : formatUSD(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-(--color-border)">
                <span>Total</span>
                <span className="price text-(--color-primary)">{formatUSD(total)}</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="space-y-1.5 pt-1 border-t border-(--color-border)">
              <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
                <ShieldCheck size={13} className="text-(--color-success) shrink-0" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
                <Truck size={13} className="shrink-0" />
                <span>Fast delivery across Zimbabwe</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
                <BadgeCheck size={13} className="shrink-0" />
                <span>Quality guaranteed on every item</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
