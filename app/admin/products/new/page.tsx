import type { Metadata } from "next";
import { getAllCategories } from "@/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";

export const metadata: Metadata = { title: "New Product — Admin" };

export default async function NewProductPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors">← Products</Link>
        <h1 className="font-display text-2xl font-bold">New Product</h1>
      </div>
      <div className="bg-white rounded-2xl border border-(--color-border) p-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
