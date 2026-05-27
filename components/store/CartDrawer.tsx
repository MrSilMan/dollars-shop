"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { formatUSD, toNumber } from "@/lib/utils/currency";
import { useCart } from "@/hooks/useCart";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string | { toNumber: () => number };
    images: string[];
    stock: number;
  };
}

interface CartDrawerProps {
  items: CartItem[];
  open: boolean;
  onClose: () => void;
}

const FREE_THRESHOLD = 15;

export function CartDrawer({ items, open, onClose }: CartDrawerProps) {
  const { update, remove, isPending } = useCart();
  const subtotal = items.reduce((s, i) => s + toNumber(i.product.price) * i.quantity, 0);
  const deliveryFee = subtotal >= FREE_THRESHOLD ? 0 : 3;
  const remaining = FREE_THRESHOLD - subtotal;

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden="true" />}

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-(--color-border)">
          <div className="flex items-center gap-2 text-(--color-text-primary)">
            <ShoppingCart size={18} className="text-(--color-primary)" />
            <h2 className="font-bold">Cart ({items.length})</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="p-1.5 hover:bg-(--color-surface-alt) rounded-full text-(--color-text-muted) hover:text-(--color-primary) transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-(--color-text-muted) p-8">
            <ShoppingCart size={56} strokeWidth={1} className="text-(--color-border)" />
            <p className="font-semibold text-(--color-text-primary)">Your cart is empty</p>
            <p className="text-sm text-center">Add items to get started</p>
            <Link
              href="/shop"
              onClick={onClose}
              className="bg-(--color-primary) hover:bg-(--color-primary-dark) text-white text-sm font-bold px-8 py-3 rounded-full transition-colors duration-150"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Free delivery progress */}
            {remaining > 0 && (
              <div className="px-4 py-2.5 bg-(--color-primary-light) text-sm text-(--color-text-primary)">
                Add <strong className="price text-(--color-primary)">{formatUSD(remaining)}</strong> more for free delivery!
                <div className="h-1.5 bg-(--color-border) rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-(--color-primary) rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((subtotal / FREE_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <ul className="flex-1 overflow-y-auto divide-y divide-(--color-border) px-4">
              {items.map((item) => (
                <li key={item.id} className="py-3 flex gap-3">
                  <Link href={`/product/${item.product.slug}`} onClick={onClose} className="shrink-0">
                    <Image
                      src={item.product.images[0] ?? "/images/products/placeholder.svg"}
                      alt={item.product.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg bg-(--color-surface-alt)"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.slug}`}
                      onClick={onClose}
                      className="text-sm font-medium line-clamp-2 hover:text-(--color-primary) transition-colors duration-150"
                    >
                      {item.product.name}
                    </Link>
                    <p className="price text-(--color-primary) font-black text-sm mt-0.5">
                      {formatUSD(toNumber(item.product.price) * item.quantity)}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => update(item.id, item.quantity - 1)}
                        disabled={isPending}
                        aria-label="Decrease quantity"
                        className="w-6 h-6 rounded-full border border-(--color-border) flex items-center justify-center hover:border-(--color-primary) hover:text-(--color-primary) transition-colors duration-150 disabled:opacity-50"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-sm w-6 text-center font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => update(item.id, item.quantity + 1)}
                        disabled={isPending || item.quantity >= item.product.stock}
                        aria-label="Increase quantity"
                        className="w-6 h-6 rounded-full border border-(--color-border) flex items-center justify-center hover:border-(--color-primary) hover:text-(--color-primary) transition-colors duration-150 disabled:opacity-50"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    disabled={isPending}
                    aria-label={`Remove ${item.product.name}`}
                    className="shrink-0 p-1.5 text-(--color-text-muted) hover:text-(--color-danger) transition-colors duration-150"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <div className="border-t border-(--color-border) p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-(--color-text-muted)">Subtotal</span>
                <span className="price font-medium">{formatUSD(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-(--color-text-muted)">Delivery</span>
                <span className={`price font-medium ${deliveryFee === 0 ? "text-(--color-success)" : ""}`}>
                  {deliveryFee === 0 ? "FREE" : formatUSD(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t border-(--color-border) pt-2">
                <span>Total</span>
                <span className="price text-(--color-primary)">{formatUSD(subtotal + deliveryFee)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block text-center bg-(--color-primary) hover:bg-(--color-primary-dark) active:bg-(--color-primary-dark) text-white font-black py-3 rounded-full transition-colors duration-150"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="block text-center text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors duration-150"
              >
                View Full Cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
