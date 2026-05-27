import { ProductGridSkeleton } from "@/components/store/ProductGrid";

export default function StoreLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="skeleton h-64 sm:h-80 rounded-2xl" />
      <div className="skeleton h-10 w-64 rounded-xl" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
