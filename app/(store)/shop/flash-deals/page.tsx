import type { Metadata } from "next";
import { ProductGrid } from "@/components/store/ProductGrid";
import { CategoryNav } from "@/components/store/CategoryNav";
import { ShopPagination } from "@/components/store/ShopPagination";
import { TrustBadges } from "@/components/store/TrustBadges";
import { FlashSaleTimer } from "@/components/store/FlashSaleTimer";
import { getAllCategories, getFlashDealsPaginated } from "@/actions/products";
import { getBlurMapForProducts } from "@/lib/images";

export const metadata: Metadata = {
  title: "Flash Deals",
  description: "Limited-time flash deals — discounted everyday essentials while stocks last.",
};

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function FlashDealsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [{ products, total }, categories] = await Promise.all([
    getFlashDealsPaginated(page, PAGE_SIZE),
    getAllCategories(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const blurMap = await getBlurMapForProducts(products);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* ── Flash deals banner with countdown ── */}
      <div className="rounded-xl overflow-hidden bg-linear-to-r from-(--color-primary) to-(--color-accent) px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <span aria-hidden="true">⚡</span>
            Flash Deals
          </h1>
          <p className="text-sm text-white/80 mt-0.5">{total} deals · while stocks last</p>
        </div>
        <FlashSaleTimer />
      </div>

      <CategoryNav categories={categories} />

      <ProductGrid
        products={products as Parameters<typeof ProductGrid>[0]["products"]}
        emptyMessage="No flash deals right now — check back soon!"
        blurMap={blurMap}
      />
      <ShopPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        basePath="/shop/flash-deals"
      />
      <TrustBadges />
    </div>
  );
}
