"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartCount } from "@/components/store/CartCountContext";

export function useWishlist() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { incWishlist, decWishlist } = useCartCount();

  const toggle = (productId: string, productName?: string) => {
    startTransition(async () => {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.wishlisted) {
        incWishlist();
        toast.success(productName ? `"${productName}" added to wishlist` : "Added to wishlist");
      } else {
        decWishlist();
        toast.info(productName ? `"${productName}" removed from wishlist` : "Removed from wishlist");
      }
    });
  };

  return { toggle, isPending };
}
