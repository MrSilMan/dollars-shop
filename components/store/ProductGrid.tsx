"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { useWishlist } from "@/hooks/useWishlist";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  stock: number;
  lowStockAlert?: number;
  featured?: boolean;
}

interface ProductGridProps {
  products: Product[];
  wishlistIds?: string[];
  emptyMessage?: string;
  blurMap?: Record<string, string>;
}

export function ProductGrid({ products, wishlistIds: initialIds = [], emptyMessage = "No products found.", blurMap = {} }: ProductGridProps) {
  const [wishlistIds, setWishlistIds] = useState<string[]>(initialIds);
  const { toggle } = useWishlist();

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => (r.ok ? r.json() : []))
      .then((ids: string[]) => { if (Array.isArray(ids)) setWishlistIds(ids); })
      .catch(() => {});
  }, []);

  const handleToggle = (productId: string, productName?: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    toggle(productId, productName);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-(--color-text-muted)">
        <p className="text-5xl mb-4">🛒</p>
        <p className="font-semibold text-(--color-text-primary) text-lg mb-6">{emptyMessage}</p>
        <Link
          href="/shop"
          className="inline-flex items-center bg-(--color-primary) hover:bg-(--color-primary-dark) text-white font-bold px-8 py-3 rounded-full transition-colors duration-150 text-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} wishlistIds={wishlistIds} onWishlistToggle={handleToggle} blurDataURL={blurMap[product.images[0]]} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-(--color-border) overflow-hidden bg-white">
          <div className="skeleton aspect-square" />
          <div className="p-2.5 space-y-2">
            <div className="skeleton h-3 w-full rounded-full" />
            <div className="skeleton h-3 w-2/3 rounded-full" />
            <div className="skeleton h-4 w-1/2 rounded-full mt-1" />
            <div className="skeleton h-8 w-full rounded-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
