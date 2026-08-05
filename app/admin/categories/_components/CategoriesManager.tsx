"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, GripVertical, Image as ImageIcon, Loader2, Pin, Trash2 } from "lucide-react";
import { reorderCategories, updateCategoryImage } from "@/actions/products";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
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

export function CategoriesManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <span className="shrink-0">⚠</span>
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs text-(--color-text-muted)">
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
      </div>

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
            className={`flex items-center gap-3 bg-white border rounded-2xl p-3 transition-all ${
              dragging ? "opacity-40" : "opacity-100"
            } ${isTarget ? "border-(--color-primary) ring-2 ring-(--color-primary)/20" : "border-(--color-border)"}`}
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

            <div className="flex-1 min-w-0">
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
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fileRefs.current[cat.id]?.click()}
                disabled={busy}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50 shadow-sm"
              >
                {busy ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                {busy ? "Saving…" : pinned ? "Replace" : "Pin Image"}
              </button>
              {pinned && (
                <button
                  type="button"
                  onClick={() => unpin(cat.id)}
                  disabled={busy}
                  aria-label={`Remove pinned image for ${cat.name}`}
                  className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              )}
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
    </div>
  );
}
