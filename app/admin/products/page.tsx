import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatUSD } from "@/lib/utils/currency";
import { Plus, Pencil, Package, CheckCircle, Star, AlertTriangle } from "lucide-react";
import { ProductFilters } from "./_components/ProductFilters";
import { ProductsPagination } from "./_components/ProductsPagination";

export const metadata: Metadata = { title: "Products — Admin | Dollar Shop" };

const PAGE_SIZE = 10;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { search = "", category = "", status = "", page = "1" } = await searchParams;
  const searchStr   = Array.isArray(search)   ? search[0]   ?? "" : search;
  const categoryStr = Array.isArray(category) ? category[0] ?? "" : category;
  const statusStr   = Array.isArray(status)   ? status[0]   ?? "" : status;
  const pageNum     = Math.max(1, parseInt(Array.isArray(page) ? page[0] ?? "1" : page, 10) || 1);

  const where = {
    ...(searchStr   && { name: { contains: searchStr, mode: "insensitive" as const } }),
    ...(categoryStr && { categoryId: categoryStr }),
    ...(statusStr === "active"   && { isActive: true }),
    ...(statusStr === "inactive" && { isActive: false }),
  };

  const [allStats, filteredCount, products, categories] = await Promise.all([
    prisma.product.findMany({
      select: { isActive: true, featured: true, stock: true, lowStockAlert: true },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const totalPages    = Math.ceil(filteredCount / PAGE_SIZE);
  const activeCount   = allStats.filter((p) => p.isActive).length;
  const featuredCount = allStats.filter((p) => p.featured).length;
  const lowStockCount = allStats.filter((p) => p.stock > 0 && p.stock <= p.lowStockAlert).length;

  const summaryItems = [
    { label: "Total",     value: allStats.length, icon: Package,       cls: "bg-slate-50  text-slate-700"  },
    { label: "Active",    value: activeCount,      icon: CheckCircle,   cls: "bg-green-50  text-green-700"  },
    { label: "Featured",  value: featuredCount,    icon: Star,          cls: "bg-amber-50  text-amber-700"  },
    { label: "Low Stock", value: lowStockCount,    icon: AlertTriangle, cls: lowStockCount > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-(--color-text-primary)">Products</h1>
          <p className="text-sm text-(--color-text-muted) mt-0.5">
            Manage your store catalogue &mdash; {allStats.length} product{allStats.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
        >
          <Plus size={15} />
          Add Product
        </Link>
      </div>

      {/* ── Summary pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryItems.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${cls} border border-current/10`}>
            <Icon size={16} className="shrink-0 opacity-70" />
            <div>
              <p className="text-xl font-bold leading-none">{value}</p>
              <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-(--color-border) p-4">
        <Suspense fallback={<div className="h-10 rounded-xl bg-(--color-surface-alt) animate-pulse" />}>
          <ProductFilters
            categories={categories}
            initialSearch={searchStr}
            initialCategory={categoryStr}
            initialStatus={statusStr}
            total={allStats.length}
            filtered={filteredCount}
          />
        </Suspense>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-(--color-surface-alt) border-b border-(--color-border)">
                {[
                  { label: "Product",  align: "left"   },
                  { label: "Category", align: "left"   },
                  { label: "Price",    align: "right"  },
                  { label: "Stock",    align: "center" },
                  { label: "Status",   align: "left"   },
                  { label: "Actions",  align: "right"  },
                ].map(({ label, align }) => (
                  <th
                    key={label}
                    className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-(--color-text-muted) text-${align}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-(--color-border)">
              {products.map((p) => {
                const stockStatus =
                  p.stock <= 0
                    ? { cls: "bg-red-50 text-red-600",     label: "Out" }
                    : p.stock <= p.lowStockAlert
                      ? { cls: "bg-amber-50 text-amber-700", label: String(p.stock) }
                      : { cls: "bg-green-50 text-green-700", label: String(p.stock) };

                return (
                  <tr key={p.id} className="hover:bg-green-50/20 transition-colors">

                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-(--color-surface-alt) shrink-0 ring-1 ring-(--color-border)">
                          <Image
                            src={p.images[0] ?? "/images/products/placeholder.svg"}
                            alt={p.name}
                            width={44}
                            height={44}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-(--color-text-primary) truncate max-w-52 leading-tight">
                            {p.name}
                          </p>
                          <p className="text-xs text-(--color-text-muted) price mt-0.5 tracking-wide">
                            {p.sku}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-(--color-text-muted) bg-(--color-surface-alt) px-2.5 py-1 rounded-full">
                        {p.category.name}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 text-right">
                      <span className="price font-bold text-(--color-text-primary)">
                        {formatUSD(Number(p.price))}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full min-w-10 text-center ${stockStatus.cls}`}>
                        {stockStatus.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Inactive
                          </span>
                        )}
                        {p.featured && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                            <Star size={10} className="fill-amber-500 text-amber-500" />
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-primary) border border-(--color-border) px-3 py-1.5 rounded-lg hover:bg-(--color-primary) hover:text-white hover:border-(--color-primary) transition-colors"
                      >
                        <Pencil size={11} />
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-(--color-surface-alt) flex items-center justify-center">
                        <Package size={24} className="text-(--color-text-muted)" />
                      </div>
                      <p className="font-semibold text-(--color-text-primary)">No products found</p>
                      <p className="text-sm text-(--color-text-muted)">
                        {searchStr || categoryStr
                          ? "Try adjusting your filters"
                          : "Add your first product to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <Suspense>
          <ProductsPagination
            page={pageNum}
            totalPages={totalPages}
            total={filteredCount}
            pageSize={PAGE_SIZE}
          />
        </Suspense>
      </div>
    </div>
  );
}
