"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema, type ProductFormData } from "@/schemas/product.schema";
import { createProduct, updateProduct } from "@/actions/products";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category { id: string; name: string; }
interface ProductFormProps {
  categories: Category[];
  defaultValues?: Partial<ProductFormData>;
  productId?: string;
}

export function ProductForm({ categories, defaultValues, productId }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema) as Resolver<ProductFormData>,
    defaultValues: {
      isActive: true,
      featured: false,
      stock: 0,
      lowStockAlert: 10,
      tags: [],
      images: [],
      ...defaultValues,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setError(null);
    try {
      const result = productId
        ? await updateProduct(productId, data)
        : await createProduct(data);

      if (result && "error" in result) {
        setError(result.error ?? "An error occurred");
      } else {
        router.push("/admin/products");
        router.refresh();
      }
    } catch {
      setError("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) transition-colors";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-sm font-medium">Product Name</label>
          <input {...form.register("name")} className={inputCls} placeholder="Product name" />
          {form.formState.errors.name && <p className="text-xs text-(--color-primary)">{form.formState.errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Slug</label>
          <input {...form.register("slug")} className={inputCls} placeholder="product-slug" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">SKU</label>
          <input {...form.register("sku")} className={inputCls} placeholder="HH-001" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Price (USD)</label>
          <input {...form.register("price", { valueAsNumber: true })} type="number" step="0.01" min="0" className={inputCls} placeholder="0.00" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Compare At Price (USD)</label>
          <input {...form.register("compareAtPrice", { valueAsNumber: true, setValueAs: v => v === "" ? null : Number(v) })} type="number" step="0.01" min="0" className={inputCls} placeholder="0.00 (optional)" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Stock</label>
          <input {...form.register("stock", { valueAsNumber: true })} type="number" min="0" className={inputCls} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Low Stock Alert</label>
          <input {...form.register("lowStockAlert", { valueAsNumber: true })} type="number" min="0" className={inputCls} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Category</label>
          <select {...form.register("categoryId")} className={inputCls}>
            <option value="">Select category…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea {...form.register("description")} rows={3} className={`${inputCls} resize-none`} placeholder="Product description…" />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <input
            type="text"
            className={inputCls}
            placeholder="cleaning, spray, household"
            defaultValue={defaultValues?.tags?.join(", ")}
            onChange={(e) => form.setValue("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...form.register("featured")} type="checkbox" className="w-4 h-4 accent-(--color-primary)" />
            <span className="text-sm font-medium">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...form.register("isActive")} type="checkbox" className="w-4 h-4 accent-(--color-primary)" />
            <span className="text-sm font-medium">Active</span>
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-(--color-primary) bg-(--color-primary-light) px-4 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 border border-(--color-border) rounded-xl text-sm font-medium hover:bg-(--color-surface-alt) transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none bg-(--color-primary) hover:bg-(--color-primary-dark) disabled:opacity-60 text-white font-semibold px-8 py-2.5 rounded-xl transition-colors"
        >
          {loading ? "Saving…" : productId ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
