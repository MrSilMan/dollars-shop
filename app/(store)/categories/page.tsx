import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { CategoryImage } from "@/components/store/CategoryImage";
import { TrustBadges } from "@/components/store/TrustBadges";
import { getCategoriesWithCounts } from "@/actions/products";
import { resolveCategoryColors } from "@/lib/categories";

export const metadata: Metadata = {
  title: "All Categories",
  description: "Browse every Dollar Shop category — kitchenware, stationery, hardware, toys and more.",
};

/**
 * Stagger step for the grid's entrance, capped so a long list still finishes
 * animating quickly — past the first dozen cards every tile shares one delay.
 */
const riseDelay = (index: number) => ({ "--rise-delay": `${Math.min(index, 11) * 45}ms` } as React.CSSProperties);

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">
      <div className="animate-rise-in flex items-end justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl font-bold mb-1">Shop by Category</h1>
          <p className="text-xs sm:text-sm text-(--color-text-muted)">
            {categories.length} {categories.length === 1 ? "category" : "categories"} to browse
          </p>
        </div>
        <Link
          href="/shop"
          className="group inline-flex items-center gap-1 text-sm font-bold text-(--color-primary) hover:text-(--color-primary-dark) transition-colors duration-150 shrink-0"
        >
          All Products
          <ChevronRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="animate-rise-in text-center py-20 text-(--color-text-muted)">
          <p className="text-5xl mb-4">🗂️</p>
          <p className="font-semibold text-(--color-text-primary) text-lg mb-6">
            No categories yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center bg-(--color-primary) hover:bg-(--color-primary-dark) text-white font-bold px-8 py-3 rounded-full transition-colors duration-150 text-sm"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat, i) => {
            const colors = resolveCategoryColors(cat.slug);
            return (
              <Link
                key={cat.id}
                href={`/shop/${cat.slug}`}
                style={riseDelay(i)}
                className="animate-rise-in group flex flex-col rounded-xl overflow-hidden border border-(--color-border) bg-white hover:border-(--color-primary) hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-200 ease-out motion-reduce:transform-none"
              >
                <span className="block overflow-hidden">
                  <CategoryImage
                    slug={cat.slug}
                    name={cat.name}
                    image={cat.image}
                    // The card image renders up to ~330px wide on a wide viewport.
                    size={360}
                    iconSize={44}
                    className={`w-full aspect-square transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transform-none ${colors.bg} ${colors.text}`}
                  />
                </span>
                <div className="p-2.5 sm:p-3 flex-1 flex flex-col">
                  <p className="font-semibold text-xs sm:text-sm text-(--color-text-primary) group-hover:text-(--color-primary) leading-tight line-clamp-2 transition-colors duration-150">
                    {cat.name}
                  </p>
                  {cat.description && (
                    <p className="hidden sm:block text-xs text-(--color-text-muted) mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                  <p className="flex items-center gap-1 text-[11px] sm:text-xs text-(--color-text-muted) mt-auto pt-2">
                    <span className="truncate">
                      {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
                    </span>
                    <ChevronRight
                      size={12}
                      className="shrink-0 text-(--color-primary) opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 motion-reduce:transition-none motion-reduce:transform-none"
                    />
                  </p>
                </div>
              </Link>
            );
          })}

          <Link
            href="/shop"
            style={riseDelay(categories.length)}
            className="animate-rise-in group flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-xl border-2 border-dashed border-(--color-primary) bg-(--color-primary-light)/40 hover:bg-(--color-primary-light) hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] p-4 sm:p-6 text-center transition-all duration-200 ease-out motion-reduce:transform-none"
          >
            <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center text-(--color-primary) shadow-sm transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transform-none">
              <LayoutGrid size={22} className="sm:w-6 sm:h-6" />
            </span>
            <span className="font-bold text-xs sm:text-sm text-(--color-primary)">All Products</span>
            <span className="hidden sm:block text-xs text-(--color-text-muted)">Everything in one place</span>
          </Link>
        </div>
      )}

      <TrustBadges />
    </div>
  );
}
