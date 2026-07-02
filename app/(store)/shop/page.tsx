import type { Metadata } from "next";
import { ProductGrid } from "@/components/store/ProductGrid";
import { CategoryNav } from "@/components/store/CategoryNav";
import { ShopPagination } from "@/components/store/ShopPagination";
import { TrustBadges } from "@/components/store/TrustBadges";
import { getAllCategories, getAllProductsPaginated } from "@/actions/products";
import { getBlurMapForProducts } from "@/lib/images";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse all our affordable everyday essentials.",
};

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function ShopPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [{ products, total }, categories] = await Promise.all([
    getAllProductsPaginated(page, PAGE_SIZE),
    getAllCategories(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const blurMap = await getBlurMapForProducts(products);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">All Products</h1>
        <p className="text-sm text-(--color-text-muted)">{total} products</p>
      </div>
      <CategoryNav categories={categories} />
      <ProductGrid products={products as Parameters<typeof ProductGrid>[0]["products"]} blurMap={blurMap} />
      <ShopPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        basePath="/shop"
      />
      <TrustBadges />
    </div>
  );
}
