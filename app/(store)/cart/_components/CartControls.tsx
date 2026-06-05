"use client";

import { Minus, Plus, Trash2, Bookmark } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { saveForLater } from "@/actions/wishlist";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface CartControlsProps {
  item: { id: string; quantity: number; stock: number; productId: string };
  isLoggedIn: boolean;
}

export function CartControls({ item, isLoggedIn }: CartControlsProps) {
  const { update, remove, isPending } = useCart();
  const router = useRouter();
  const [isSaving, startSaving] = useTransition();

  const handleSaveForLater = () => {
    if (!isLoggedIn) {
      router.push("/login?callbackUrl=/cart");
      return;
    }
    startSaving(async () => {
      await saveForLater(item.id, item.productId);
    });
  };

  return (
    <div className="flex flex-col items-end justify-between shrink-0 gap-2">
      <div className="flex items-center gap-0.5">
        <button
          onClick={handleSaveForLater}
          disabled={isSaving}
          aria-label="Save for later"
          title="Save for later"
          className="p-1.5 text-(--color-text-muted) hover:text-(--color-primary) transition-colors disabled:opacity-40"
        >
          <Bookmark size={15} />
        </button>
        <button
          onClick={() => remove(item.id)}
          disabled={isPending}
          aria-label="Remove item"
          className="p-1.5 text-(--color-text-muted) hover:text-(--color-primary) transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div className="flex items-center border border-(--color-border) rounded-lg overflow-hidden">
        <button onClick={() => update(item.id, item.quantity - 1)} disabled={isPending} aria-label="Decrease" className="px-2 py-1.5 hover:bg-(--color-surface-alt) transition-colors">
          <Minus size={12} />
        </button>
        <span className="px-3 text-sm font-semibold min-w-8 text-center">{item.quantity}</span>
        <button onClick={() => update(item.id, item.quantity + 1)} disabled={isPending || item.quantity >= item.stock} aria-label="Increase" className="px-2 py-1.5 hover:bg-(--color-surface-alt) transition-colors disabled:opacity-40">
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}
