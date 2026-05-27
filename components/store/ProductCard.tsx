"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { formatUSD, calcDiscount, toNumber } from "@/lib/utils/currency";
import { getStockStatus, stockLabel } from "@/lib/utils/stock";
import { useCart } from "@/hooks/useCart";
import { useTransition } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | string | { toNumber: () => number };
  compareAtPrice?: number | string | { toNumber: () => number } | null;
  images: string[];
  stock: number;
  lowStockAlert?: number;
  featured?: boolean;
}

interface ProductCardProps {
  product: Product;
  wishlistIds?: string[];
  onWishlistToggle?: (productId: string, productName?: string) => void;
}

export function ProductCard({ product, wishlistIds = [], onWishlistToggle }: ProductCardProps) {
  const { add, isPending } = useCart();
  const [wishPending, startWish] = useTransition();

  const price = toNumber(product.price);
  const compareAt = product.compareAtPrice ? toNumber(product.compareAtPrice) : null;
  const discount = calcDiscount(price, compareAt);
  const stockStatus = getStockStatus(product.stock, product.lowStockAlert ?? 10);
  const isWishlisted = wishlistIds.includes(product.id);
  const image = product.images[0] ?? "/images/products/placeholder.svg";
  const outOfStock = stockStatus === "out_of_stock";

  return (
    <article className="group bg-white rounded-lg overflow-hidden flex flex-col border border-(--color-border) hover:border-(--color-primary) hover:-translate-y-0.5 hover:shadow-lg transition-all duration-150">
      {/* ── Product image — square crop ── */}
      <div className="relative aspect-square overflow-hidden bg-(--color-surface-alt)">
        <Link href={`/product/${product.slug}`} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Discount badge — red pill top-left */}
        {discount > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-(--color-danger) text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none">
            -{discount}%
          </span>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist button — top-right, appears on hover */}
        <button
          type="button"
          onClick={() => { startWish(() => { onWishlistToggle?.(product.id, product.name); }); }}
          disabled={wishPending}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all duration-150 ${
            isWishlisted
              ? "bg-(--color-primary) text-white opacity-100"
              : "bg-white/90 text-(--color-text-muted) opacity-0 group-hover:opacity-100 hover:text-(--color-primary)"
          }`}
        >
          <Heart size={13} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      {/* ── Product info ── */}
      <div className="p-2.5 flex flex-col flex-1 gap-1.5">
        <Link
          href={`/product/${product.slug}`}
          className="text-xs text-(--color-text-primary) hover:text-(--color-primary) line-clamp-2 leading-snug transition-colors duration-150"
        >
          {product.name}
        </Link>

        {/* Price row */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="price text-(--color-primary) font-black text-base leading-none">
            {formatUSD(price)}
          </span>
          {compareAt && (
            <span className="price text-(--color-text-muted) text-xs line-through leading-none">
              {formatUSD(compareAt)}
            </span>
          )}
        </div>

        {/* Low-stock label */}
        {stockStatus === "low_stock" && (
          <span className="text-[10px] font-medium text-(--color-accent)">
            {stockLabel(stockStatus)}
          </span>
        )}

        {/* Add to cart */}
        <button
          type="button"
          onClick={() => add(product.id, 1)}
          disabled={isPending || outOfStock}
          aria-label={`Add ${product.name} to cart`}
          className="mt-auto flex items-center justify-center gap-1.5 bg-(--color-primary) hover:bg-(--color-primary-dark) active:bg-(--color-primary-dark) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-full transition-colors duration-150"
        >
          <ShoppingCart size={12} />
          {isPending ? "Adding…" : outOfStock ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
