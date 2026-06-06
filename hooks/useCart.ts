"use client";

import { useState, useRef } from "react";
import { addToCart, removeFromCart, updateCartQuantity } from "@/actions/cart";
import { useCartCount } from "@/components/store/CartCountContext";

export function useCart() {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const { incCart, decCart } = useCartCount();

  const add = async (productId: string, quantity = 1, variantId?: string) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsPending(true);
    try {
      const result = await addToCart(productId, quantity, variantId);
      if (!result.success) setMessage(result.error ?? "Error");
      else {
        setMessage(null);
        if (result.isNewItem) incCart();
      }
    } finally {
      inFlightRef.current = false;
      setIsPending(false);
    }
  };

  const remove = async (cartItemId: string) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsPending(true);
    try {
      const result = await removeFromCart(cartItemId);
      if (result.success) decCart();
    } finally {
      inFlightRef.current = false;
      setIsPending(false);
    }
  };

  const update = async (cartItemId: string, quantity: number) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsPending(true);
    try {
      await updateCartQuantity(cartItemId, quantity);
    } finally {
      inFlightRef.current = false;
      setIsPending(false);
    }
  };

  return { add, remove, update, isPending, message };
}
