import type { Metadata } from "next";
import { ProductGrid } from "@/components/store/ProductGrid";
import { CategoryNav } from "@/components/store/CategoryNav";
import { getAllCategories } from "@/actions/products";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse all our affordable everyday essentials.",
};

export default async function ShopPage() {
  const [rawProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    getAllCategories(),
  ]);

  const products = rawProducts.map((p) => ({
    ...p,
    price: p.price.toNumber(),
    compareAtPrice: p.compareAtPrice?.toNumber() ?? null,
    weight: p.weight?.toNumber() ?? null,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">All Products</h1>
        <p className="text-sm text-(--color-text-muted)">{products.length} products</p>
      </div>
      <CategoryNav categories={categories} />
      <ProductGrid products={products as Parameters<typeof ProductGrid>[0]["products"]} />
    </div>
  );
}
