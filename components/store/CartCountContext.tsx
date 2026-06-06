"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface CartCountCtxValue {
  cartCount: number;
  wishlistCount: number;
  incCart: () => void;
  decCart: () => void;
  incWishlist: () => void;
  decWishlist: () => void;
}

const CartCountContext = createContext<CartCountCtxValue>({
  cartCount: 0,
  wishlistCount: 0,
  incCart: () => {},
  decCart: () => {},
  incWishlist: () => {},
  decWishlist: () => {},
});

export function CartCountProvider({
  initialCartCount,
  initialWishlistCount,
  children,
}: {
  initialCartCount: number;
  initialWishlistCount: number;
  children: ReactNode;
}) {
  const [cartCount, setCartCount] = useState(initialCartCount);
  const [wishlistCount, setWishlistCount] = useState(initialWishlistCount);

  // Sync with server-side counts when layout re-renders (e.g. after navigation)
  useEffect(() => {
    setCartCount(initialCartCount);
  }, [initialCartCount]);

  useEffect(() => {
    setWishlistCount(initialWishlistCount);
  }, [initialWishlistCount]);

  return (
    <CartCountContext.Provider
      value={{
        cartCount,
        wishlistCount,
        incCart: () => setCartCount((c) => c + 1),
        decCart: () => setCartCount((c) => Math.max(0, c - 1)),
        incWishlist: () => setWishlistCount((c) => c + 1),
        decWishlist: () => setWishlistCount((c) => Math.max(0, c - 1)),
      }}
    >
      {children}
    </CartCountContext.Provider>
  );
}

export const useCartCount = () => useContext(CartCountContext);
