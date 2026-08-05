"use client";

import type { ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema, type ProductFormData } from "@/schemas/product.schema";
import { createProduct, updateProduct, generateSku, createCategory } from "@/actions/products";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ImagePlus, AlertCircle, Loader2, Link2, Plus, Trash2, Star } from "lucide-react";
import { upsertVariants } from "@/actions/products";

interface Category { id: string; name: string; }

interface VariantRow {
  id?: string;
  groupName: string;
  value: string;
  sku: string;
  stock: number;
  priceAdjust: number;
  sortOrder: number;
}

interface ProductFormProps {
  categories: Category[];
  defaultValues?: Partial<ProductFormData>;
  productId?: string;
  initialVariants?: VariantRow[];
}

function slugify(str: string) {
  return str.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) ${checked ? "bg-(--color-primary)" : "bg-(--color-border)"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function Card({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-(--color-border) p-5 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-(--color-text-muted) mb-4">{title}</p>
      {children}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle size={11} />{message}
    </p>
  );
}

const emptyVariant = (): VariantRow => ({ groupName: "Size", value: "", sku: "", stock: 0, priceAdjust: 0, sortOrder: 0 });

const NEW_CATEGORY_VALUE = "__new__";

export function ProductForm({ categories: initialCategories, defaultValues, productId, initialVariants = [] }: ProductFormProps) {
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [categories, setCategories]       = useState<Category[]>(initialCategories);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError]   = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const newCategoryInputRef                 = useRef<HTMLInputElement>(null);
  const tagInputRef                        = useRef<HTMLInputElement>(null);
  const [variants, setVariants]           = useState<VariantRow[]>(initialVariants);
  const [images, setImages]               = useState<string[]>(defaultValues?.images ?? []);
  const [uploadingCount, setUploading]    = useState(0);
  const [dragOver, setDragOver]           = useState(false);
  const [slugEdited, setSlugEdited]       = useState(false);
  const [skuEdited, setSkuEdited]         = useState(!!defaultValues?.sku);
  const [imageTab, setImageTab]           = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput]           = useState("");
  const fileInputRef                       = useRef<HTMLInputElement>(null);
  const router                             = useRouter();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema) as Resolver<ProductFormData>,
    defaultValues: {
      isActive: true,
      featured: false,
      stock: 0,
      lowStockAlert: 10,
      tags: [],
      images: [],
      additionalCategoryIds: [],
      ...defaultValues,
    },
  });

  const { formState: { errors }, watch, register, setValue, handleSubmit } = form;
  const isActive   = watch("isActive");
  const isFeatured = watch("featured");
  const categoryId = watch("categoryId");
  const additionalCategoryIds = watch("additionalCategoryIds") ?? [];

  useEffect(() => {
    if (!categoryId || skuEdited) return;
    generateSku(categoryId).then(sku => { if (sku) setValue("sku", sku); });
  }, [categoryId, skuEdited, setValue]);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(c => c + arr.length);
    try {
      const urls = await Promise.all(
        arr.map(async f => {
          const fd = new FormData();
          fd.append("file", f);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Upload failed");
          return data.url as string;
        })
      );
      setImages(prev => {
        const next = [...prev, ...urls];
        setValue("images", next);
        return next;
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploading(c => c - arr.length);
    }
  }, [setValue]);

  const removeImage = (url: string) => {
    setImages(prev => {
      const next = prev.filter(u => u !== url);
      setValue("images", next);
      return next;
    });
  };

  const setCover = (url: string) => {
    setImages(prev => {
      const next = [url, ...prev.filter(u => u !== url)];
      setValue("images", next);
      return next;
    });
  };

  const addImageUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed || images.includes(trimmed)) return;
    try { new URL(trimmed); } catch { setError("Invalid URL"); return; }
    setImages(prev => {
      const next = [...prev, trimmed];
      setValue("images", next);
      return next;
    });
    setUrlInput("");
  };

  const nameReg = register("name");
  const slugReg = register("slug");
  const skuReg  = register("sku");
  const categoryReg = register("categoryId");

  const handleCategorySelect = (value: string) => {
    if (value === NEW_CATEGORY_VALUE) {
      setAddingCategory(true);
      setCategoryError(null);
      setNewCategoryName("");
      setTimeout(() => newCategoryInputRef.current?.focus(), 0);
      return;
    }
    setValue("categoryId", value);
  };

  const saveNewCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) { setCategoryError("Enter a category name"); return; }
    setSavingCategory(true);
    setCategoryError(null);
    try {
      const result = await createCategory(name);
      if ("error" in result) {
        setCategoryError(result.error ?? "Failed to create category");
        return;
      }
      setCategories(prev => [...prev, result.category]);
      setValue("categoryId", result.category.id);
      setAddingCategory(false);
      setNewCategoryName("");
    } catch {
      setCategoryError("Failed to create category");
    } finally {
      setSavingCategory(false);
    }
  };

  const cancelNewCategory = () => {
    setAddingCategory(false);
    setNewCategoryName("");
    setCategoryError(null);
  };

  const addAdditionalCategory = (id: string) => {
    if (!id || id === categoryId || additionalCategoryIds.includes(id)) return;
    setValue("additionalCategoryIds", [...additionalCategoryIds, id], { shouldDirty: true });
  };
  const removeAdditionalCategory = (id: string) => {
    setValue("additionalCategoryIds", additionalCategoryIds.filter(cid => cid !== id), { shouldDirty: true });
  };

  const addVariant = () => setVariants(prev => [...prev, { ...emptyVariant(), sortOrder: prev.length }]);
  const removeVariant = (idx: number) => setVariants(prev => prev.filter((_, i) => i !== idx));
  const updateVariant = (idx: number, patch: Partial<VariantRow>) =>
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, ...patch } : v));

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setError(null);
    try {
      const result = productId
        ? await updateProduct(productId, { ...data, images })
        : await createProduct({ ...data, images });

      if (result && "error" in result) {
        setError(result.error ?? "An error occurred");
        setLoading(false);
        return;
      }

      const savedProductId = productId ?? ("productId" in result ? (result.productId as string) : undefined);
      if (savedProductId) {
        await upsertVariants(savedProductId, variants.map((v, i) => ({ ...v, sortOrder: i })));
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full px-3.5 py-2.5 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-colors bg-white placeholder:text-(--color-text-muted)";
  const label = "block text-sm font-medium mb-1.5";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_268px] gap-5 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-5">

          {/* Images */}
          <Card title="Product Images">
            {/* Tabs */}
            <div className="mb-4 flex gap-1 rounded-xl bg-(--color-surface-alt) p-1">
              <button
                type="button"
                onClick={() => setImageTab("upload")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors ${imageTab === "upload" ? "bg-white shadow-sm text-(--color-text-primary)" : "text-(--color-text-muted) hover:text-(--color-text-primary)"}`}
              >
                <ImagePlus size={13} /> Upload
              </button>
              <button
                type="button"
                onClick={() => setImageTab("url")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors ${imageTab === "url" ? "bg-white shadow-sm text-(--color-text-primary)" : "text-(--color-text-muted) hover:text-(--color-text-primary)"}`}
              >
                <Link2 size={13} /> Use URL
              </button>
            </div>

            {imageTab === "upload" ? (
              <>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer select-none transition-colors ${dragOver ? "border-(--color-primary) bg-(--color-primary-light)" : "border-(--color-border) hover:border-primary/40 hover:bg-(--color-surface-alt)"}`}
                >
                  {uploadingCount > 0 ? (
                    <>
                      <Loader2 size={28} className="animate-spin text-(--color-primary)" />
                      <p className="text-sm text-(--color-text-muted)">
                        Uploading {uploadingCount} image{uploadingCount > 1 ? "s" : ""}…
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-surface-alt) border border-(--color-border)">
                        <ImagePlus size={22} className="text-(--color-text-muted)" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-(--color-text-primary)">
                          Drop images here or <span className="text-(--color-primary) underline underline-offset-2">browse</span>
                        </p>
                        <p className="mt-0.5 text-xs text-(--color-text-muted)">JPEG · PNG · WebP · GIF &nbsp;·&nbsp; Max 5 MB each</p>
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  aria-label="Upload product images"
                  className="hidden"
                  onChange={e => e.target.files && uploadFiles(e.target.files)}
                />
              </>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3.5 py-2.5 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-primary/10 transition-colors bg-white placeholder:text-(--color-text-muted)"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-primary-dark)"
                >
                  <Plus size={15} /> Add
                </button>
              </div>
            )}

            {images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((url, i) => (
                  <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
                    {i === 0 ? (
                      <span className="absolute left-1.5 top-1.5 z-10 rounded bg-(--color-primary) px-1.5 py-0.5 text-[9px] font-bold uppercase text-white tracking-wide">
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-label="Set as cover"
                        title="Set as cover"
                        onClick={e => { e.stopPropagation(); setCover(url); }}
                        className="absolute left-1.5 top-1.5 z-10 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-(--color-primary) group-hover:opacity-100"
                      >
                        <Star size={10} aria-hidden="true" />
                      </button>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={e => { e.stopPropagation(); removeImage(url); }}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Basic Info */}
          <Card title="Basic Information">
            <div className="space-y-4">
              <div>
                <label className={label}>Product Name</label>
                <input
                  {...nameReg}
                  onChange={e => {
                    nameReg.onChange(e);
                    if (!slugEdited) setValue("slug", slugify(e.target.value));
                  }}
                  className={input}
                  placeholder="e.g. Dettol Antiseptic Liquid 500ml"
                />
                <FieldError message={errors.name?.message} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>
                    Slug <span className="text-(--color-text-muted) font-normal text-xs">— used in URL</span>
                  </label>
                  <input
                    {...slugReg}
                    onChange={e => { slugReg.onChange(e); setSlugEdited(true); }}
                    className={input}
                    placeholder="dettol-antiseptic-500ml"
                  />
                  <FieldError message={errors.slug?.message} />
                </div>
                <div>
                  <label className={label}>Category</label>
                  {addingCategory ? (
                    <div className="flex gap-2">
                      <input
                        ref={newCategoryInputRef}
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") { e.preventDefault(); saveNewCategory(); }
                          if (e.key === "Escape") { e.preventDefault(); cancelNewCategory(); }
                        }}
                        placeholder="New category name"
                        disabled={savingCategory}
                        autoFocus
                        className={input}
                      />
                      <button
                        type="button"
                        onClick={saveNewCategory}
                        disabled={savingCategory}
                        aria-label="Save category"
                        className="flex shrink-0 items-center justify-center rounded-xl bg-(--color-primary) px-3.5 text-white transition-colors hover:bg-(--color-primary-dark) disabled:opacity-60"
                      >
                        {savingCategory ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                      </button>
                      <button
                        type="button"
                        onClick={cancelNewCategory}
                        disabled={savingCategory}
                        aria-label="Cancel new category"
                        className="flex shrink-0 items-center justify-center rounded-xl border border-(--color-border) px-3.5 transition-colors hover:bg-(--color-surface-alt)"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <select
                      {...categoryReg}
                      onChange={e => { categoryReg.onChange(e); handleCategorySelect(e.target.value); }}
                      className={`${input} cursor-pointer`}
                    >
                      <option value="">Select category…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      <option value={NEW_CATEGORY_VALUE}>+ Add new category…</option>
                    </select>
                  )}
                  {categoryError && <FieldError message={categoryError} />}
                  {!categoryError && <FieldError message={errors.categoryId?.message} />}
                </div>
              </div>

              {/* Additional categories (many-to-many) */}
              <div>
                <label className={label}>
                  Also in <span className="text-(--color-text-muted) font-normal text-xs">— optional, shows in these categories too</span>
                </label>
                {(() => {
                  const byId = new Map(categories.map(c => [c.id, c]));
                  const available = categories.filter(c => c.id !== categoryId && !additionalCategoryIds.includes(c.id));
                  return (
                    <>
                      {additionalCategoryIds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {additionalCategoryIds.map(id => {
                            const cat = byId.get(id);
                            if (!cat) return null;
                            return (
                              <span key={id} className="inline-flex items-center gap-1 rounded-full bg-(--color-primary-light) text-(--color-primary) text-xs font-medium pl-2.5 pr-1 py-1">
                                {cat.name}
                                <button
                                  type="button"
                                  onClick={() => removeAdditionalCategory(id)}
                                  aria-label={`Remove ${cat.name}`}
                                  className="flex items-center justify-center rounded-full hover:bg-(--color-primary)/20 w-4 h-4"
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <select
                        value=""
                        onChange={e => { addAdditionalCategory(e.target.value); e.target.value = ""; }}
                        disabled={available.length === 0}
                        className={`${input} cursor-pointer disabled:opacity-60`}
                      >
                        <option value="">
                          {available.length === 0 ? "No more categories to add" : "Add a category…"}
                        </option>
                        {available.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </>
                  );
                })()}
              </div>
            </div>
          </Card>

          {/* Details */}
          <Card title="Details">
            <div className="space-y-4">
              <div>
                <div className="mb-1.5">
                  <label className="text-sm font-medium">
                    Description <span className="text-zinc-400 font-normal text-xs">optional</span>
                  </label>
                </div>
                <textarea
                  {...register("description")}
                  rows={4}
                  className={`${input} resize-none`}
                  placeholder="Describe the product — size, ingredients, uses…"
                />
                <FieldError message={errors.description?.message} />
              </div>
              <div>
                <label className={label}>
                  Tags <span className="text-(--color-text-muted) font-normal text-xs">— comma separated</span>
                </label>
                <input
                  ref={tagInputRef}
                  type="text"
                  className={input}
                  placeholder="cleaning, antiseptic, household"
                  defaultValue={defaultValues?.tags?.join(", ")}
                  onChange={e => setValue("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                />
              </div>
            </div>
          </Card>

          {/* Variants */}
          <Card title="Variants">
            <p className="text-xs text-(--color-text-muted) mb-3">
              Add size, colour, or other options. Each variant tracks its own stock.
            </p>
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_1fr_80px_80px_auto] gap-2 items-start">
                  <div>
                    {idx === 0 && <p className="text-[11px] font-medium text-(--color-text-muted) mb-1">Group</p>}
                    <input
                      value={v.groupName}
                      onChange={e => updateVariant(idx, { groupName: e.target.value })}
                      placeholder="Size"
                      className={input}
                    />
                  </div>
                  <div>
                    {idx === 0 && <p className="text-[11px] font-medium text-(--color-text-muted) mb-1">Value</p>}
                    <input
                      value={v.value}
                      onChange={e => updateVariant(idx, { value: e.target.value })}
                      placeholder="Small"
                      className={input}
                    />
                  </div>
                  <div>
                    {idx === 0 && <p className="text-[11px] font-medium text-(--color-text-muted) mb-1">Stock</p>}
                    <input
                      type="number"
                      min="0"
                      value={v.stock}
                      aria-label="Variant stock"
                      placeholder="0"
                      onChange={e => updateVariant(idx, { stock: Number(e.target.value) })}
                      className={input}
                    />
                  </div>
                  <div>
                    {idx === 0 && <p className="text-[11px] font-medium text-(--color-text-muted) mb-1">+/- $</p>}
                    <input
                      type="number"
                      step="0.01"
                      value={v.priceAdjust}
                      aria-label="Price adjustment"
                      placeholder="0.00"
                      onChange={e => updateVariant(idx, { priceAdjust: Number(e.target.value) })}
                      className={input}
                    />
                  </div>
                  <div className={idx === 0 ? "mt-5" : ""}>
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      aria-label="Remove variant"
                      className="p-2 hover:bg-red-50 rounded-lg text-(--color-text-muted) hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-(--color-primary) hover:underline"
            >
              <Plus size={14} /> Add variant
            </button>
          </Card>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-5">

          {/* Status */}
          <Card title="Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-(--color-text-muted)">Visible in the store</p>
                </div>
                <Toggle checked={isActive} onChange={v => setValue("isActive", v)} label="Active" />
              </div>
              <div className="h-px bg-(--color-border)" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Featured</p>
                  <p className="text-xs text-(--color-text-muted)">Show on homepage</p>
                </div>
                <Toggle checked={isFeatured} onChange={v => setValue("featured", v)} label="Featured" />
              </div>
            </div>
          </Card>

          {/* Pricing */}
          <Card title="Pricing">
            <div className="space-y-3">
              <div>
                <label className={label}>
                  Price <span className="text-(--color-text-muted) font-normal text-xs">USD</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-(--color-text-muted)">$</span>
                  <input
                    {...register("price", { setValueAs: v => v === "" ? undefined : Number(v) })}
                    type="number" step="0.01" min="0"
                    className={`${input} pl-7`}
                    placeholder="0.00"
                  />
                </div>
                <FieldError message={errors.price?.message} />
              </div>
              <div>
                <label className={label}>
                  Compare At <span className="text-(--color-text-muted) font-normal text-xs">optional</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-(--color-text-muted)">$</span>
                  <input
                    {...register("compareAtPrice", {
                      setValueAs: v => (v === "" || v === null || v === undefined) ? undefined : Number(v),
                    })}
                    type="number" step="0.01" min="0"
                    className={`${input} pl-7`}
                    placeholder="0.00"
                  />
                </div>
                <FieldError message={errors.compareAtPrice?.message} />
              </div>
            </div>
          </Card>

          {/* Inventory */}
          <Card title="Inventory">
            <div className="space-y-3">
              <div>
                <label className={label}>SKU</label>
                <input
                  {...skuReg}
                  onChange={e => { skuReg.onChange(e); setSkuEdited(true); }}
                  className={input}
                  placeholder="HH-001"
                />
                <FieldError message={errors.sku?.message} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Stock</label>
                  <input {...register("stock", { setValueAs: v => v === "" ? 0 : Number(v) })} type="number" min="0" className={input} />
                </div>
                <div>
                  <label className={label}>Low Alert</label>
                  <input {...register("lowStockAlert", { setValueAs: v => v === "" ? 0 : Number(v) })} type="number" min="0" className={input} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-(--color-border) px-5 py-2.5 text-sm font-medium transition-colors hover:bg-(--color-surface-alt)"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-(--color-primary) px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-primary-dark) disabled:opacity-60"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? "Saving…" : productId ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
