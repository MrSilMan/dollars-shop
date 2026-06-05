import type { Metadata } from "next";
import { getCartItems } from "@/actions/cart";
import { formatUSD, toNumber } from "@/lib/utils/currency";
import Link from "next/link";
import Image from "next/image";
import { CartControls } from "./_components/CartControls";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, RotateCcw, BadgeCheck } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import { DeliveryProgressBar } from "./_components/DeliveryProgressBar";

export const metadata: Metadata = { title: "Shopping Cart" };

const FREE_THRESHOLD = 15;
const DELIVERY_FEE = 3;

export default async function CartPage() {
  const [items, session] = await Promise.all([getCartItems(), auth()]);
  const subtotal = items.reduce((s, i) => s + toNumber(i.product.price) * i.quantity, 0);
  const deliveryFee = subtotal >= FREE_THRESHOLD ? 0 : DELIVERY_FEE;
  const remaining = FREE_THRESHOLD - subtotal;

  const cartProductIds = items.map((i) => i.productId);
  const categoryIds = [...new Set(items.map((i) => i.product.categoryId))];

  const rawRecommended = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: { in: categoryIds.length ? categoryIds : undefined },
      id: { notIn: cartProductIds },
    },
    include: { category: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const recommended = rawRecommended.map((p) => ({
    ...p,
    price: p.price.toNumber(),
    compareAtPrice: p.compareAtPrice?.toNumber() ?? null,
    weight: p.weight?.toNumber() ?? null,
  }));

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-5xl">🛒</p>
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="text-(--color-text-muted)">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/shop" className="inline-block bg-(--color-primary) hover:bg-(--color-primary-dark) text-white font-bold px-8 py-3 rounded-full transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Shopping Cart ({items.length})</h1>

      {remaining > 0 && (
        <div className="bg-(--color-accent-light) rounded-xl px-4 py-3 mb-6 text-sm">
          Add <strong className="price">{formatUSD(remaining)}</strong> more for free delivery!
          <DeliveryProgressBar percent={Math.min((subtotal / FREE_THRESHOLD) * 100, 100)} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const unitPrice = toNumber(item.product.price);
            const lineTotal = unitPrice * item.quantity;
            return (
              <div key={item.id} className="flex gap-4 bg-white border border-(--color-border) rounded-2xl p-4">
                <Link href={`/product/${item.product.slug}`} className="shrink-0">
                  <Image
                    src={item.product.images[0] ?? "/images/products/placeholder.svg"}
                    alt={item.product.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-xl bg-(--color-surface-alt)"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product.slug}`} className="font-medium text-sm line-clamp-2 hover:text-(--color-primary) transition-colors">
                    {item.product.name}
                  </Link>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <p className="price text-(--color-primary) font-bold text-sm">
                      {formatUSD(lineTotal)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="price text-(--color-text-muted) text-xs">
                        ({formatUSD(unitPrice)} each)
                      </p>
                    )}
                  </div>
                </div>
                <CartControls
                  item={{ id: item.id, quantity: item.quantity, stock: item.product.stock, productId: item.productId }}
                  isLoggedIn={!!session}
                />
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-(--color-surface-alt) rounded-2xl p-5 space-y-4 sticky top-24">
            <h2 className="font-semibold text-lg">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-(--color-text-muted)">Subtotal</span><span className="price">{formatUSD(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-(--color-text-muted)">Delivery</span><span className={`price ${deliveryFee === 0 ? "text-(--color-success) font-semibold" : ""}`}>{deliveryFee === 0 ? "FREE" : formatUSD(deliveryFee)}</span></div>
              <div className="flex justify-between font-bold text-base border-t border-(--color-border) pt-2 mt-2">
                <span>Total</span>
                <span className="price text-(--color-primary)">{formatUSD(subtotal + deliveryFee)}</span>
              </div>
            </div>
            <Link
              href={session ? "/checkout" : "/login?callbackUrl=/checkout"}
              className="block text-center bg-(--color-primary) hover:bg-(--color-primary-dark) text-white font-bold py-3 rounded-xl transition-colors"
            >
              {session ? "Proceed to Checkout" : "Sign In to Checkout"}
            </Link>

            {/* Trust signals */}
            <div className="space-y-1.5 pt-1 border-t border-(--color-border)">
              <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
                <ShieldCheck size={13} className="text-(--color-success) shrink-0" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
                <RotateCcw size={13} className="shrink-0" />
                <span>Easy returns &amp; exchanges</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
                <BadgeCheck size={13} className="shrink-0" />
                <span>Quality guaranteed on every item</span>
              </div>
            </div>

            <Link href="/shop" className="block text-center text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* You may also like */}
      {recommended.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
