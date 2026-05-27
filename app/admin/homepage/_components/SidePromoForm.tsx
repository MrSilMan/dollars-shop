"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { createSidePromo, updateSidePromo } from "@/actions/homepage";

type Promo = {
  id: string;
  label: string;
  headline: string;
  href: string;
  imageUrl: string | null;
  bgFrom: string;
  bgTo: string;
  sortOrder: number;
  isActive: boolean;
};

type Props = {
  promo?: Promo;
  onDone: () => void;
};

const DEFAULT: Omit<Promo, "id"> = {
  label: "",
  headline: "",
  href: "/shop",
  imageUrl: null,
  bgFrom: "#FF4400",
  bgTo: "#E63900",
  sortOrder: 0,
  isActive: true,
};

export function SidePromoForm({ promo, onDone }: Props) {
  const [form, setForm] = useState(promo ?? DEFAULT);
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
      if (promo) {
        await updateSidePromo(promo.id, payload);
      } else {
        await createSidePromo(payload);
      }
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Background Image</label>
        <div className="flex items-start gap-3">
          {form.imageUrl ? (
            <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
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
            <p className="text-[10px] text-gray-400 mt-1">JPEG, PNG, WebP · max 5 MB</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Gradient From</label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.bgFrom} onChange={(e) => set("bgFrom", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
            <input type="text" value={form.bgFrom} onChange={(e) => set("bgFrom", e.target.value)} className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg font-mono" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Gradient To</label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.bgTo} onChange={(e) => set("bgTo", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
            <input type="text" value={form.bgTo} onChange={(e) => set("bgTo", e.target.value)} className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg font-mono" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Label <span className="text-gray-400 font-normal">(e.g. HOT DEALS)</span></label>
        <input value={form.label} onChange={(e) => set("label", e.target.value)} required className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" placeholder="HOT DEALS" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Headline</label>
        <textarea value={form.headline} onChange={(e) => set("headline", e.target.value)} required rows={2} className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg resize-none" placeholder="Up to 30% Off&#10;Daily Necessities" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Link</label>
        <input value={form.href} onChange={(e) => set("href", e.target.value)} required className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" placeholder="/shop/daily-necessities" />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
          <span className="text-xs font-semibold text-gray-600">Active</span>
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={onDone} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving || uploading} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50">
            {saving && <Loader2 size={13} className="animate-spin" />}
            {promo ? "Save Changes" : "Add Promo"}
          </button>
        </div>
      </div>
    </form>
  );
}
