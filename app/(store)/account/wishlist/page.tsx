import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/store/ProductGrid";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingBag, Tag, TrendingDown } from "lucide-react";
import { formatUSD } from "@/lib/utils/currency";

export const metadata: Metadata = { title: "My Wishlist | Dollar Shop" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/wishlist");

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  const products = wishlistItems.map((w) => ({
    ...w.product,
    price: w.product.price.toNumber(),
    compareAtPrice: w.product.compareAtPrice?.toNumber() ?? null,
    weight: w.product.weight?.toNumber() ?? null,
  }));

  const totalValue = products.reduce((s, p) => s + p.price, 0);
  const totalSavings = products.reduce((s, p) => {
    if (p.compareAtPrice && p.compareAtPrice > p.price) {
      return s + (p.compareAtPrice - p.price);
    }
    return s;
  }, 0);
  const saleCount = products.filter(
    (p) => p.compareAtPrice && p.compareAtPrice > p.price
  ).length;

  return (
    <div className="min-h-screen bg-(--color-bg)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="w-9 h-9 rounded-xl bg-white border border-(--color-border) flex items-center justify-center text-(--color-text-muted) hover:text-(--color-primary) hover:border-(--color-primary) transition-all shadow-sm"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-(--color-text-primary)">
                My Wishlist
              </h1>
              <p className="text-xs text-(--color-text-muted) mt-0.5">
                {products.length === 0
                  ? "No saved items"
                  : `${products.length} saved item${products.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {products.length > 0 && (
            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-(--color-primary) hover:text-(--color-primary-dark) transition-colors"
            >
              <ShoppingBag size={15} />
              Browse More
            </Link>
          )}
        </div>

        {/* Stats strip — only when there are items */}
        {products.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: Heart,
                label: "Saved Items",
                value: String(products.length),
                accent: "bg-rose-50 text-rose-500",
              },
              {
                icon: Tag,
                label: "Total Value",
                value: formatUSD(totalValue),
                accent: "bg-violet-50 text-violet-600",
              },
              {
                icon: TrendingDown,
                label: saleCount > 0 ? `${saleCount} on sale · Save` : "Potential Savings",
                value: totalSavings > 0 ? formatUSD(totalSavings) : "—",
                accent: "bg-green-50 text-green-700",
              },
            ].map(({ icon: Icon, label, value, accent }) => (
              <div
                key={label}
                className="bg-white border border-(--color-border) rounded-2xl px-4 py-3.5 shadow-sm"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${accent}`}>
                  <Icon size={15} />
                </div>
                <p className="price text-base font-bold text-(--color-text-primary)">{value}</p>
                <p className="text-xs text-(--color-text-muted) mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Product grid */}
        <ProductGrid
          products={products as Parameters<typeof ProductGrid>[0]["products"]}
          wishlistIds={products.map((p) => p.id)}
          emptyMessage="Your wishlist is empty. Browse our shop and save items you love!"
        />

      </div>
    </div>
  );
}
