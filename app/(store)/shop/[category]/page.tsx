import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/store/ProductGrid";
import { CategoryNav } from "@/components/store/CategoryNav";
import { ShopPagination } from "@/components/store/ShopPagination";
import { TrustBadges } from "@/components/store/TrustBadges";
import { getProductsByCategory, getAllCategories } from "@/actions/products";
import { getBlurMapForProducts } from "@/lib/images";
import { CategoryImage } from "@/components/store/CategoryImage";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 12;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const result = await getProductsByCategory(category);
  if (!result.category) return { title: "Category Not Found" };
  return {
    title: result.category.name,
    description: result.category.description ?? `Shop ${result.category.name} at Dollar Shop`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [result, categories] = await Promise.all([
    getProductsByCategory(category, page, PAGE_SIZE),
    getAllCategories(),
  ]);

  if (!result.category) notFound();

  const totalPages = Math.ceil(result.total / PAGE_SIZE);
  const blurMap = await getBlurMapForProducts(result.products);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CategoryImage
            slug={result.category.slug}
            name={result.category.name}
            image={categories.find((c) => c.slug === category)?.image}
            size={32}
            iconSize={24}
            className="w-8 h-8 rounded-lg text-(--color-primary)"
          />
          <h1 className="font-display text-2xl font-bold">{result.category.name}</h1>
        </div>
        {result.category.description && (
          <p className="text-sm text-(--color-text-muted)">{result.category.description}</p>
        )}
        <p className="text-xs text-(--color-text-muted) mt-1">{result.total} products</p>
      </div>

      <CategoryNav categories={categories} activeSlug={category} />

      <ProductGrid
        products={result.products as Parameters<typeof ProductGrid>[0]["products"]}
        emptyMessage={`No products in ${result.category.name} yet.`}
        blurMap={blurMap}
      />
      <ShopPagination
        page={page}
        totalPages={totalPages}
        total={result.total}
        pageSize={PAGE_SIZE}
        basePath={`/shop/${category}`}
      />
      <TrustBadges />
    </div>
  );
}
