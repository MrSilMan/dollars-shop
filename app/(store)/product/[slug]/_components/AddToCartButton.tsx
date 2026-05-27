"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Minus, Plus } from "lucide-react";

interface Variant {
  id: string;
  groupName: string;
  value: string;
  stock: number;
  priceAdjust: number | { toNumber: () => number };
}

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  variants?: Variant[];
}

export function AddToCartButton({ productId, stock, variants = [] }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { add, isPending, message } = useCart();

  // Group variants by groupName
  const groups = variants.reduce<Record<string, Variant[]>>((acc, v) => {
    if (!acc[v.groupName]) acc[v.groupName] = [];
    acc[v.groupName].push(v);
    return acc;
  }, {});
  const groupNames = Object.keys(groups);

  const selectedVariantId = groupNames.length === 1
    ? selectedVariants[groupNames[0]]
    : undefined;

  const selectedVariantObj = variants.find(v => v.id === selectedVariantId);
  const effectiveStock = selectedVariantObj ? selectedVariantObj.stock : stock;
  const priceAdj = selectedVariantObj
    ? typeof selectedVariantObj.priceAdjust === "number"
      ? selectedVariantObj.priceAdjust
      : selectedVariantObj.priceAdjust.toNumber()
    : 0;

  const allGroupsSelected = groupNames.every(g => selectedVariants[g]);
  const needsVariantSelection = groupNames.length > 0 && !allGroupsSelected;

  const handleAdd = () => {
    const variantId = groupNames.length > 0 ? selectedVariantId : undefined;
    add(productId, qty, variantId);
  };

  return (
    <div className="space-y-3">
      {/* Variant selectors */}
      {groupNames.map(groupName => (
        <div key={groupName}>
          <p className="text-sm font-medium mb-2">
            {groupName}
            {selectedVariants[groupName] && (
              <span className="text-(--color-text-muted) font-normal ml-1">— {selectedVariants[groupName]}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {groups[groupName].map(v => {
              const selected = selectedVariants[groupName] === v.value;
              const outOfStock = v.stock === 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => setSelectedVariants(prev => ({ ...prev, [groupName]: v.value }))}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border-2 transition-colors relative
                    ${selected
                      ? "border-(--color-primary) bg-(--color-primary-light) text-(--color-primary)"
                      : outOfStock
                        ? "border-(--color-border) text-(--color-text-muted) opacity-50 cursor-not-allowed line-through"
                        : "border-(--color-border) hover:border-primary/50"
                    }`}
                >
                  {v.value}
                  {priceAdj !== 0 && selected && (
                    <span className="ml-1 text-xs">({priceAdj > 0 ? "+" : ""}${priceAdj.toFixed(2)})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Qty + Add */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-(--color-border) rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="px-3 py-2.5 hover:bg-(--color-surface-alt) transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="px-4 py-2.5 text-sm font-semibold min-w-10 text-center">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(effectiveStock, q + 1))}
            aria-label="Increase quantity"
            disabled={qty >= effectiveStock}
            className="px-3 py-2.5 hover:bg-(--color-surface-alt) transition-colors disabled:opacity-40"
          >
            <Plus size={14} />
          </button>
        </div>
        <button
          onClick={handleAdd}
          disabled={isPending || effectiveStock === 0 || needsVariantSelection}
          className="flex-1 flex items-center justify-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-dark) disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm"
        >
          <ShoppingCart size={16} />
          {effectiveStock === 0
            ? "Out of Stock"
            : needsVariantSelection
              ? `Select ${groupNames.find(g => !selectedVariants[g])}`
              : isPending
                ? "Adding…"
                : "Add to Cart"}
        </button>
      </div>

      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}
