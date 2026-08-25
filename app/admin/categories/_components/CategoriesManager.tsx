"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, ChevronDown, ChevronUp, Eye, EyeOff, GripVertical,
  Image as ImageIcon, Loader2, Pencil, Pin, PinOff, Plus, Trash2, X,
} from "lucide-react";
import {
  createCategory, deleteCategory, reorderCategories, updateCategory, updateCategoryImage,
} from "@/actions/products";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  productCount: number;
  /** The pinned upload — null means the storefront falls back to a product photo. */
  imageUrl: string | null;
  /** The product photo used when nothing is pinned. */
  fallbackImage: string | null;
}

/** Move `from` to `to`, returning a new array. Out-of-range targets are no-ops. */
function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Mirrors slugifyCategory on the server, so the preview matches what gets saved. */
function slugify(value: string) {
  return value.trim().toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const inputClass =
  "w-full px-3 py-2 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) bg-white";

export interface CategoryValues {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

/**
 * Create/edit dialog. New categories take their URL from the name; existing ones
 * expose it for editing, because a typo in a slug is otherwise unfixable.
 */
function CategoryEditor({
  category,
  onSave,
  onClose,
}: {
  category: AdminCategory | null;
  onSave: (values: CategoryValues) => Promise<string | null>;
  onClose: () => void;
}) {
  const editing = category !== null;
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // A new category's URL follows its name; an existing one keeps the slug the
  // storefront already links to unless the admin edits it deliberately.
  const currentSlug = category?.slug ?? null;
  const effectiveSlug = currentSlug === null ? slugify(name) : slugify(slug);
  const slugChanged = currentSlug !== null && effectiveSlug !== currentSlug;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const message = await onSave({ name, slug: effectiveSlug, description, isActive });
    setSaving(false);
    if (message) { setError(message); return; }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={category ? `Edit ${category.name}` : "New category"}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-(--color-border)">
          <h2 className="font-semibold text-base">{editing ? "Edit Category" : "New Category"}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-(--color-surface-alt) transition-colors text-(--color-text-muted)"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label htmlFor="category-name" className="block text-sm font-medium mb-1.5">Name</label>
            <input
              id="category-name"
              ref={firstInputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Kitchenware"
              required
            />
          </div>

          <div>
            <label htmlFor="category-slug" className="block text-sm font-medium mb-1.5">
              Store URL
            </label>
            {editing ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-(--color-text-muted) shrink-0">/shop/</span>
                  <input
                    id="category-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className={inputClass}
                    placeholder="kitchenware"
                  />
                </div>
                {slugChanged && (
                  <p className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2 mt-2">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                    Existing links to /shop/{currentSlug} will stop working, including any
                    menu or banner pointing at it.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-(--color-text-muted) px-3 py-2 bg-(--color-surface-alt) rounded-xl">
                /shop/{effectiveSlug || <span className="italic">from the name</span>}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="category-description" className="block text-sm font-medium mb-1.5">
              Description <span className="font-normal text-(--color-text-muted)">(optional)</span>
            </label>
            <textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-y`}
              placeholder="Shown on the category page and under its card in the store."
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded accent-(--color-primary)"
            />
            Visible in the store
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-(--color-border) rounded-xl text-sm hover:bg-(--color-surface-alt) transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-dark) disabled:opacity-60 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({
  category,
  onConfirm,
  onCancel,
}: {
  category: AdminCategory;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={15} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">Delete {category.name}?</h3>
            <p className="text-xs text-gray-500 mt-1">
              This removes the category for good. Only empty categories can be deleted — to take a
              category with products off the store, hide it instead.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function CategoriesManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // `null` = closed, `"new"` = creating, otherwise the category being edited.
  const [editor, setEditor] = useState<AdminCategory | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);

  // Local sequence of ids, so drags and arrow presses feel instant while the save
  // follows behind. Holding only ids means a router.refresh() (from a pin/unpin)
  // refreshes each row's data without disturbing an order that isn't written yet.
  const [order, setOrder] = useState<string[]>(() => categories.map((c) => c.id));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Props supply the data, `order` the sequence. Categories created or deleted
  // elsewhere still show up — new ones land at the end, removed ones drop out.
  const byId = new Map(categories.map((c) => [c.id, c]));
  const items = [
    ...order.flatMap((id) => byId.get(id) ?? []),
    ...categories.filter((c) => !order.includes(c.id)),
  ];

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (clearedTimer.current) clearTimeout(clearedTimer.current);
  }, []);

  /**
   * Debounced so holding down an arrow button writes once, not once per click.
   * The full ordered id list goes over, so the last call wins outright.
   */
  function persistOrder(nextOrder: string[]) {
    setOrderStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (clearedTimer.current) clearTimeout(clearedTimer.current);
    saveTimer.current = setTimeout(async () => {
      const result = await reorderCategories(nextOrder);
      if (result?.error) {
        setError(result.error);
        setOrderStatus("idle");
        setOrder(categories.map((c) => c.id)); // Snap back to the order the server still holds.
        return;
      }
      setError("");
      setOrderStatus("saved");
      clearedTimer.current = setTimeout(() => setOrderStatus("idle"), 2500);
    }, 500);
  }

  function reorder(from: number, to: number) {
    const next = move(items, from, to).map((c) => c.id);
    if (next.length === order.length && next.every((id, i) => id === order[i])) return;
    setOrder(next);
    persistOrder(next);
  }

  async function save(id: string, imageUrl: string | null) {
    const result = await updateCategoryImage(id, imageUrl);
    if (result?.error) throw new Error(result.error);
    router.refresh();
  }

  async function upload(id: string, file: File) {
    setBusyId(id);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      await save(id, json.url as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusyId(null);
      const input = fileRefs.current[id];
      if (input) input.value = "";
    }
  }

  async function unpin(id: string) {
    setBusyId(id);
    setError("");
    try {
      await save(id, null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove the image");
    } finally {
      setBusyId(null);
    }
  }

  /** Returns an error message for the dialog to show, or null when it saved. */
  async function saveEditor(values: CategoryValues): Promise<string | null> {
    setError("");
    const target = editor === "new" ? null : editor;
    const result = target
      ? await updateCategory(target.id, {
          name: values.name,
          slug: values.slug,
          description: values.description,
          isActive: values.isActive,
        })
      : await createCategory(values.name, {
          description: values.description,
          isActive: values.isActive,
        });

    if ("error" in result && result.error) return result.error;
    router.refresh();
    return null;
  }

  async function toggleVisible(cat: AdminCategory) {
    setBusyId(cat.id);
    setError("");
    const result = await updateCategory(cat.id, { isActive: !cat.isActive });
    setBusyId(null);
    if ("error" in result && result.error) { setError(result.error); return; }
    router.refresh();
  }

  async function confirmDelete() {
    const target = deleteTarget;
    if (!target) return;
    setDeleteTarget(null);
    setBusyId(target.id);
    setError("");
    const result = await deleteCategory(target.id);
    setBusyId(null);
    if ("error" in result && result.error) { setError(result.error); return; }
    setOrder((prev) => prev.filter((id) => id !== target.id));
    router.refresh();
  }

  const iconBtn =
    "w-9 h-9 flex items-center justify-center rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <span className="shrink-0">⚠</span>
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap px-1">
        <p className="text-xs text-(--color-text-muted) flex-1 min-w-50">
          Drag a row — or use the arrows — to set the order categories appear in across the store.
        </p>
        <p aria-live="polite" className="text-xs font-semibold shrink-0">
          {orderStatus === "saving" && (
            <span className="inline-flex items-center gap-1.5 text-gray-500">
              <Loader2 size={11} className="animate-spin" /> Saving order…
            </span>
          )}
          {orderStatus === "saved" && <span className="text-emerald-600">Order saved</span>}
        </p>
        <button
          type="button"
          onClick={() => setEditor("new")}
          className="flex items-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white font-semibold py-2 px-4 rounded-xl transition-colors text-sm shrink-0"
        >
          <Plus size={15} /> New Category
        </button>
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center py-16 text-(--color-text-muted) bg-white border border-(--color-border) rounded-2xl">
          <ImageIcon size={30} className="mb-3 opacity-40" />
          <p className="font-medium">No categories yet</p>
          <p className="text-sm mt-0.5">Create the first one to start sorting products.</p>
        </div>
      )}

      {items.map((cat, index) => {
        const pinned = !!cat.imageUrl;
        const shown = cat.imageUrl ?? cat.fallbackImage;
        const busy = busyId === cat.id;
        const dragging = dragIndex === index;
        const isTarget = overIndex === index && dragIndex !== null && dragIndex !== index;

        return (
          <div
            key={cat.id}
            draggable
            onDragStart={(e) => {
              setDragIndex(index);
              e.dataTransfer.effectAllowed = "move";
              // Firefox refuses to start a drag without data on the transfer.
              e.dataTransfer.setData("text/plain", cat.id);
            }}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setOverIndex(index); }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null) reorder(dragIndex, index);
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
            className={`flex items-center gap-3 flex-wrap border rounded-2xl p-3 transition-all ${
              cat.isActive ? "bg-white" : "bg-gray-50"
            } ${dragging ? "opacity-40" : "opacity-100"} ${
              isTarget ? "border-(--color-primary) ring-2 ring-(--color-primary)/20" : "border-(--color-border)"
            }`}
          >
            {/* Order controls — the handle drags, the arrows cover touch and keyboard */}
            <div className="flex items-center gap-1 shrink-0">
              <GripVertical
                size={16}
                aria-hidden="true"
                className="text-gray-300 cursor-grab active:cursor-grabbing"
              />
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => reorder(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move ${cat.name} up`}
                  className="w-6 h-5 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => reorder(index, index + 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move ${cat.name} down`}
                  className="w-6 h-5 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  <ChevronDown size={13} />
                </button>
              </div>
              <span className="w-5 text-xs font-bold text-gray-300 tabular-nums text-right">{index + 1}</span>
            </div>

            {/* Live image — what the storefront renders for this category today */}
            {shown ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shown}
                alt=""
                draggable={false}
                className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center shrink-0">
                <ImageIcon size={16} className="text-gray-300" />
              </div>
            )}

            <div className="flex-1 min-w-40">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm text-(--color-text-primary) truncate">{cat.name}</p>
                {pinned ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <Pin size={9} /> Pinned
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {shown ? "Auto" : "Icon"}
                  </span>
                )}
                {!cat.isActive && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    Hidden
                  </span>
                )}
              </div>
              <p className="text-xs text-(--color-text-muted) mt-0.5">
                /{cat.slug} · {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
                {!pinned && (shown ? " · using a product photo" : " · no photo, showing the icon")}
              </p>
              {cat.description && (
                <p className="text-xs text-(--color-text-muted) mt-1 line-clamp-1 italic">{cat.description}</p>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => fileRefs.current[cat.id]?.click()}
                disabled={busy}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50 shadow-sm"
              >
                {busy ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                <span className="hidden sm:inline">{busy ? "Saving…" : pinned ? "Replace" : "Pin Image"}</span>
              </button>
              {pinned && (
                <button
                  type="button"
                  onClick={() => unpin(cat.id)}
                  disabled={busy}
                  title="Remove the pinned image"
                  aria-label={`Remove pinned image for ${cat.name}`}
                  className={`${iconBtn} text-gray-400 hover:text-gray-900 hover:bg-gray-100`}
                >
                  <PinOff size={14} />
                </button>
              )}

              <span className="w-px h-6 bg-(--color-border) mx-0.5" aria-hidden="true" />

              <button
                type="button"
                onClick={() => setEditor(cat)}
                disabled={busy}
                title="Edit name, URL and description"
                aria-label={`Edit ${cat.name}`}
                className={`${iconBtn} text-gray-400 hover:text-gray-900 hover:bg-gray-100`}
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => toggleVisible(cat)}
                disabled={busy}
                title={cat.isActive ? "Hide from the store" : "Show in the store"}
                aria-label={cat.isActive ? `Hide ${cat.name}` : `Show ${cat.name}`}
                className={`${iconBtn} ${
                  cat.isActive
                    ? "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                    : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                }`}
              >
                {cat.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(cat)}
                disabled={busy || cat.productCount > 0}
                title={
                  cat.productCount > 0
                    ? "Move its products elsewhere before deleting — or hide it instead"
                    : "Delete this category"
                }
                aria-label={`Delete ${cat.name}`}
                className={`${iconBtn} text-gray-400 hover:text-red-600 hover:bg-red-50`}
              >
                <Trash2 size={14} />
              </button>

              <input
                ref={(el) => { fileRefs.current[cat.id] = el; }}
                type="file"
                accept="image/*"
                aria-label={`Upload image for ${cat.name}`}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(cat.id, f); }}
              />
            </div>
          </div>
        );
      })}

      <p className="text-xs text-(--color-text-muted) px-1">
        JPEG, PNG, WebP · max 5 MB. Square images work best — they&apos;re cropped to a square everywhere they appear.
      </p>

      {editor && (
        <CategoryEditor
          category={editor === "new" ? null : editor}
          onSave={saveEditor}
          onClose={() => setEditor(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          category={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
