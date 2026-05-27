import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug, getProductsByCategory } from "@/actions/products";
import { ProductGrid } from "@/components/store/ProductGrid";
import { formatUSD, calcDiscount, toNumber } from "@/lib/utils/currency";
import { getStockStatus, stockLabel } from "@/lib/utils/stock";
import { AddToCartButton } from "./_components/AddToCartButton";
import { ChevronRight, Star, ShoppingBasket } from "lucide-react";
import { categoryIconMap } from "@/lib/categories";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug) as { name: string; description: string } | null;
  if (!product) return { title: "Product Not Found" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug) as {
    id: string; name: string; slug: string; description: string; sku: string;
    price: { toNumber: () => number }; compareAtPrice?: { toNumber: () => number } | null;
    stock: number; lowStockAlert: number; images: string[]; featured: boolean;
    category: { id: string; name: string; slug: string; icon?: string | null };
    reviews: { id: string; rating: number; comment?: string | null; user: { name?: string | null } }[];
  } | null;

  if (!product) notFound();

  const price = toNumber(product.price);
  const compareAt = product.compareAtPrice ? toNumber(product.compareAtPrice) : null;
  const discount = calcDiscount(price, compareAt);
  const stockStatus = getStockStatus(product.stock, product.lowStockAlert);
  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;

  const related = await getProductsByCategory(product.category.slug);
  const CategoryIcon = categoryIconMap[product.category.slug] ?? ShoppingBasket;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-(--color-text-muted) mb-6">
        <Link href="/" className="hover:text-(--color-primary) transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link href="/shop" className="hover:text-(--color-primary) transition-colors">Shop</Link>
        <ChevronRight size={12} />
        <Link href={`/shop/${product.category.slug}`} className="hover:text-(--color-primary) transition-colors">
          {product.category.name}
        </Link>
        <ChevronRight size={12} />
        <span className="text-(--color-text-primary) truncate max-w-40">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-(--color-surface-alt)">
            <Image
              src={product.images[0] ?? "/images/products/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-(--color-accent) text-white text-sm font-bold px-3 py-1 rounded-full">
                {discount}% OFF
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.slice(1).map((img, i) => (
                <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-(--color-surface-alt) border border-(--color-border)">
                  <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-(--color-surface-alt) px-2.5 py-1 rounded-full text-(--color-text-muted) mb-2">
              <CategoryIcon size={12} aria-hidden="true" />
              {product.category.name}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold leading-snug">{product.name}</h1>
            <p className="text-xs text-(--color-text-muted) mt-1">SKU: {product.sku}</p>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="price text-3xl font-bold text-(--color-primary)">{formatUSD(price)}</span>
            {compareAt && (
              <>
                <span className="price text-lg text-(--color-text-muted) line-through">{formatUSD(compareAt)}</span>
                <span className="text-sm font-medium text-(--color-success)">Save {formatUSD(compareAt - price)}</span>
              </>
            )}
          </div>

          {/* Stock */}
          <span className={`inline-block text-sm font-semibold ${stockStatus === "in_stock" ? "text-(--color-success)" : stockStatus === "low_stock" ? "text-(--color-accent)" : "text-(--color-primary)"}`}>
            ● {stockLabel(stockStatus)}{stockStatus === "low_stock" ? ` (${product.stock} left)` : ""}
          </span>

          {/* Rating summary */}
          {avgRating && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={16} fill={s <= Math.round(avgRating) ? "var(--color-accent)" : "none"} stroke={s <= Math.round(avgRating) ? "var(--color-accent)" : "var(--color-border)"} />
                ))}
              </div>
              <span className="text-sm text-(--color-text-muted)">{avgRating.toFixed(1)} ({product.reviews.length} reviews)</span>
            </div>
          )}

          {/* Add to cart */}
          <AddToCartButton productId={product.id} stock={product.stock} />

          {/* Accordion info */}
          <details className="border border-(--color-border) rounded-xl overflow-hidden">
            <summary className="px-4 py-3 font-medium cursor-pointer select-none hover:bg-(--color-surface-alt) transition-colors">Description</summary>
            <p className="px-4 py-3 text-sm text-(--color-text-muted) border-t border-(--color-border)">{product.description}</p>
          </details>
          <details className="border border-(--color-border) rounded-xl overflow-hidden">
            <summary className="px-4 py-3 font-medium cursor-pointer select-none hover:bg-(--color-surface-alt) transition-colors">Delivery Info</summary>
            <div className="px-4 py-3 text-sm text-(--color-text-muted) border-t border-(--color-border) space-y-1">
              <p>📦 Free delivery on orders over $15</p>
              <p>🚚 Standard delivery: $3.00</p>
              <p>📍 Harare & surrounding areas</p>
            </div>
          </details>
          <details className="border border-(--color-border) rounded-xl overflow-hidden">
            <summary className="px-4 py-3 font-medium cursor-pointer select-none hover:bg-(--color-surface-alt) transition-colors">Returns Policy</summary>
            <p className="px-4 py-3 text-sm text-(--color-text-muted) border-t border-(--color-border)">
              We accept returns within 7 days of delivery for unopened/unused items. Contact us on WhatsApp to arrange a return.
            </p>
          </details>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold mb-4">Customer Reviews</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-(--color-surface-alt) rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={14} fill={s <= review.rating ? "var(--color-accent)" : "none"} stroke={s <= review.rating ? "var(--color-accent)" : "var(--color-border)"} />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.user.name ?? "Customer"}</span>
                </div>
                {review.comment && <p className="text-sm text-(--color-text-muted)">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related products */}
      {related.products.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold mb-4">You Might Also Like</h2>
          <ProductGrid products={(related.products as Parameters<typeof ProductGrid>[0]["products"]).filter((p) => p.id !== product.id).slice(0, 4)} />
        </section>
      )}
    </div>
  );
}
