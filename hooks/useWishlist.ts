"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function useWishlist(userId?: string) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = (productId: string) => {
    if (!userId) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      router.refresh();
    });
  };

  return { toggle, isPending };
}
