import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAllCategories } from "@/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "Edit Product — Admin" };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    getAllCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors">← Products</Link>
        <h1 className="font-display text-2xl font-bold">Edit Product</h1>
      </div>
      <div className="bg-white rounded-2xl border border-(--color-border) p-6">
        <ProductForm
          categories={categories}
          productId={product.id}
          defaultValues={{
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            description: product.description,
            price: Number(product.price),
            compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
            stock: product.stock,
            lowStockAlert: product.lowStockAlert,
            categoryId: product.categoryId,
            featured: product.featured,
            isActive: product.isActive,
            tags: product.tags,
            images: product.images,
          }}
        />
      </div>
    </div>
  );
}
