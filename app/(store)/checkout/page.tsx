import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCartItems } from "@/actions/cart";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { formatUSD, toNumber } from "@/lib/utils/currency";

export const metadata: Metadata = { title: "Checkout" };

const FREE_THRESHOLD = 15;
const DELIVERY_FEE = 3;

export default async function CheckoutPage() {
  const [session, cartItems] = await Promise.all([auth(), getCartItems()]);
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
          <div className="bg-(--color-surface-alt) rounded-2xl p-5 space-y-3 sticky top-24">
            <h2 className="font-semibold">Order Summary</h2>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="line-clamp-1 flex-1 text-(--color-text-muted)">
                  {item.product.name} ×{item.quantity}
                </span>
                <span className="price ml-3 font-medium">{formatUSD(toNumber(item.product.price) * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-(--color-border) pt-2 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-(--color-text-muted)">Subtotal</span>
                <span className="price">{formatUSD(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-text-muted)">Delivery</span>
                <span className={`price ${deliveryFee === 0 ? "text-(--color-success)" : ""}`}>
                  {deliveryFee === 0 ? "FREE" : formatUSD(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="price text-(--color-primary)">{formatUSD(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
