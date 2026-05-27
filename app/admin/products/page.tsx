import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatUSD } from "@/lib/utils/currency";
import { Plus, Pencil } from "lucide-react";

export const metadata: Metadata = { title: "Products — Admin" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Products ({products.length})</h1>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border) bg-(--color-surface-alt)">
                <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Product</th>
                <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Category</th>
                <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Price</th>
                <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Status</th>
                <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-(--color-surface-alt) transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={p.images[0] ?? "/images/products/placeholder.svg"}
                        alt={p.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover rounded-lg bg-(--color-surface-alt) shrink-0"
                      />
                      <div>
                        <p className="font-medium truncate max-w-48">{p.name}</p>
                        <p className="text-xs text-(--color-text-muted) price">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-(--color-text-muted)">{p.category.name}</td>
                  <td className="px-4 py-3 price font-semibold">{formatUSD(Number(p.price))}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.stock <= 0 ? "bg-red-100 text-red-700" : p.stock <= p.lowStockAlert ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {p.isActive ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                      )}
                      {p.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="flex items-center gap-1 text-xs font-medium text-(--color-primary) hover:underline">
                      <Pencil size={12} /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
