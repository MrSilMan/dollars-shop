"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Minus, Plus } from "lucide-react";

export function AddToCartButton({ productId, stock }: { productId: string; stock: number }) {
  const [qty, setQty] = useState(1);
  const { add, isPending } = useCart();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-(--color-border) rounded-xl overflow-hidden">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
          className="px-3 py-2.5 hover:bg-(--color-surface-alt) transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="px-4 py-2.5 text-sm font-semibold min-w-10 text-center">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(stock, q + 1))}
          aria-label="Increase quantity"
          disabled={qty >= stock}
          className="px-3 py-2.5 hover:bg-(--color-surface-alt) transition-colors disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
      </div>
      <button
        onClick={() => add(productId, qty)}
        disabled={isPending || stock === 0}
        className="flex-1 flex items-center justify-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-dark) disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm"
      >
        <ShoppingCart size={16} />
        {stock === 0 ? "Out of Stock" : isPending ? "Adding…" : "Add to Cart"}
      </button>
    </div>
  );
}
