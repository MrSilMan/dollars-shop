import type { Metadata } from "next";
import { searchProducts } from "@/actions/products";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SearchBar } from "@/components/store/SearchBar";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/store/ProductGrid";

interface Props { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: "${q}"` : "Search" };
}

async function SearchResults({ query }: { query: string }) {
  const products = await searchProducts(query);
  return (
    <>
      <p className="text-sm text-(--color-text-muted) mb-4">
        {products.length} result{products.length !== 1 ? "s" : ""} for &ldquo;<strong>{query}</strong>&rdquo;
      </p>
      <ProductGrid products={products as Parameters<typeof ProductGrid>[0]["products"]} emptyMessage={`No products found for "${query}"`} />
    </>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="font-display text-2xl font-bold">Search</h1>
      <SearchBar defaultValue={q} />
      {q ? (
        <Suspense fallback={<ProductGridSkeleton />}>
          <SearchResults query={q} />
        </Suspense>
      ) : (
        <p className="text-(--color-text-muted) text-sm">Enter a search term to find products.</p>
      )}
    </div>
  );
}
