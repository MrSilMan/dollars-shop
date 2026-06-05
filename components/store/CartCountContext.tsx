"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface CartCountCtxValue {
  cartCount: number;
  wishlistCount: number;
  incCart: () => void;
  decCart: () => void;
}

const CartCountContext = createContext<CartCountCtxValue>({
  cartCount: 0,
  wishlistCount: 0,
  incCart: () => {},
  decCart: () => {},
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

  // Sync with server-side count when layout re-renders (e.g. after navigation)
  useEffect(() => {
    setCartCount(initialCartCount);
  }, [initialCartCount]);

  return (
    <CartCountContext.Provider
      value={{
        cartCount,
        wishlistCount: initialWishlistCount,
        incCart: () => setCartCount((c) => c + 1),
        decCart: () => setCartCount((c) => Math.max(0, c - 1)),
      }}
    >
      {children}
    </CartCountContext.Provider>
  );
}

export const useCartCount = () => useContext(CartCountContext);
