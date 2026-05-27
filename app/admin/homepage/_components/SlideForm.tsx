"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { createHeroSlide, updateHeroSlide } from "@/actions/homepage";

type Slide = {
  id: string;
  tag: string;
  tagBg: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string | null;
  bgFrom: string;
  bgTo: string;
  sortOrder: number;
  isActive: boolean;
};

type Props = {
  slide?: Slide;
  onDone: () => void;
};

const DEFAULT: Omit<Slide, "id" | "createdAt" | "updatedAt"> = {
  tag: "",
  tagBg: "bg-white/20",
  headline: "",
  sub: "",
  ctaLabel: "Shop Now",
  ctaHref: "/shop",
  imageUrl: null,
  bgFrom: "#FF4400",
  bgTo: "#E63900",
  sortOrder: 0,
  isActive: true,
};

export function SlideForm({ slide, onDone }: Props) {
  const [form, setForm] = useState(slide ?? DEFAULT);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      set("imageUrl", json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) };
      if (slide) {
        await updateHeroSlide(slide.id, payload);
      } else {
        await createHeroSlide(payload);
      }
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const hasImage = !!form.imageUrl;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      {/* Image upload */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Background Image</label>
        <div className="flex items-start gap-3">
          {form.imageUrl ? (
            <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => set("imageUrl", null)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
              >
                <X size={10} />
              </button>
            </div>
          ) : (
            <div className="w-28 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center shrink-0 bg-gray-50">
              <span className="text-[10px] text-gray-400 text-center px-1">No image</span>
            </div>
          )}
          <div className="flex-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploading ? "Uploading…" : "Upload Image"}
            </button>
            <p className="text-[10px] text-gray-400 mt-1">JPEG, PNG, WebP · max 5 MB. Image overlays the gradient.</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              aria-label="Upload background image"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }}
            />
          </div>
        </div>
      </div>

      {hasImage ? (
        <details className="group">
          <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 select-none list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">›</span>
            Fallback gradient <span className="font-normal">(shown if image is removed)</span>
          </summary>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Gradient From</label>
              <div className="flex items-center gap-2">
                <input type="color" aria-label="Gradient from colour picker" value={form.bgFrom} onChange={(e) => set("bgFrom", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                <input type="text" aria-label="Gradient from hex value" value={form.bgFrom} onChange={(e) => set("bgFrom", e.target.value)} className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg font-mono" placeholder="#FF4400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Gradient To</label>
              <div className="flex items-center gap-2">
                <input type="color" aria-label="Gradient to colour picker" value={form.bgTo} onChange={(e) => set("bgTo", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                <input type="text" aria-label="Gradient to hex value" value={form.bgTo} onChange={(e) => set("bgTo", e.target.value)} className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg font-mono" placeholder="#E63900" />
              </div>
            </div>
          </div>
        </details>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Gradient From</label>
            <div className="flex items-center gap-2">
              <input type="color" aria-label="Gradient from colour picker" value={form.bgFrom} onChange={(e) => set("bgFrom", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
              <input type="text" aria-label="Gradient from hex value" value={form.bgFrom} onChange={(e) => set("bgFrom", e.target.value)} className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg font-mono" placeholder="#FF4400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Gradient To</label>
            <div className="flex items-center gap-2">
              <input type="color" aria-label="Gradient to colour picker" value={form.bgTo} onChange={(e) => set("bgTo", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
              <input type="text" aria-label="Gradient to hex value" value={form.bgTo} onChange={(e) => set("bgTo", e.target.value)} className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg font-mono" placeholder="#E63900" />
            </div>
          </div>
        </div>
      )}

      {hasImage && <p className="text-[10px] text-gray-400 -mt-1">Text fields below are optional when an image is uploaded.</p>}

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Tag Text <span className="text-gray-400 font-normal">(e.g. ⚡ Flash Deals){hasImage ? " · optional" : ""}</span></label>
        <input value={form.tag} onChange={(e) => set("tag", e.target.value)} required={!hasImage} className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" placeholder="⚡ Flash Deals" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Headline{hasImage ? <span className="text-gray-400 font-normal"> · optional</span> : ""}</label>
        <textarea value={form.headline} onChange={(e) => set("headline", e.target.value)} required={!hasImage} rows={2} className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg resize-none" placeholder="Everyday Essentials,&#10;Unbeatable Prices" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Subtitle{hasImage ? <span className="text-gray-400 font-normal"> · optional</span> : ""}</label>
        <input value={form.sub} onChange={(e) => set("sub", e.target.value)} required={!hasImage} className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" placeholder="Shop kitchenware, daily necessities & more" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Button Label{hasImage ? <span className="text-gray-400 font-normal"> · optional</span> : ""}</label>
          <input value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} required={!hasImage} className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" placeholder="Shop Deals" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Button Link{hasImage ? <span className="text-gray-400 font-normal"> · optional</span> : ""}</label>
          <input value={form.ctaHref} onChange={(e) => set("ctaHref", e.target.value)} required={!hasImage} className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" placeholder="/shop" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
          <span className="text-xs font-semibold text-gray-600">Active (shown on site)</span>
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={onDone} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving || uploading} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50">
            {saving && <Loader2 size={13} className="animate-spin" />}
            {slide ? "Save Changes" : "Add Slide"}
          </button>
        </div>
      </div>
    </form>
  );
}
