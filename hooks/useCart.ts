"use client";

import { useState, useTransition } from "react";
import { addToCart, removeFromCart, updateCartQuantity } from "@/actions/cart";

export function useCart() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const add = (productId: string, quantity = 1, variantId?: string) => {
    startTransition(async () => {
      const result = await addToCart(productId, quantity, variantId);
      if (!result.success) setMessage(result.error ?? "Error");
      else setMessage(null);
    });
  };

  const remove = (cartItemId: string) => {
    startTransition(async () => {
      await removeFromCart(cartItemId);
    });
  };

  const update = (cartItemId: string, quantity: number) => {
    startTransition(async () => {
      await updateCartQuantity(cartItemId, quantity);
    });
  };

  return { add, remove, update, isPending, message };
}
