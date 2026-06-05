"use client";

import { useState, useRef } from "react";
import { Loader2, ImageIcon, X, Trash2 } from "lucide-react";
import { createHeroSlide, updateHeroSlide } from "@/actions/homepage";

type Slide = {
  id: string;
  tag: string;
  tagBg: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  ctaBg: string;
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
  tagBg: "#ffffff33",
  headline: "",
  sub: "",
  ctaLabel: "Shop Now",
  ctaHref: "/shop",
  ctaBg: "#FFFFFF",
  imageUrl: null,
  bgFrom: "#FF4400",
  bgTo: "#E63900",
  sortOrder: 0,
  isActive: true,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
      {children}
    </p>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-700">
        {label}
        {hint && <span className="ml-1.5 font-normal text-gray-400">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 h-9 px-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-200">
      <input
        type="color"
        aria-label={`${label} colour picker`}
        value={value.length === 9 ? value.slice(0, 7) : value}
        onChange={(e) => onChange(e.target.value)}
        className="w-5 h-5 rounded-sm cursor-pointer border-0 bg-transparent p-0 appearance-none shrink-0 scheme-light"
      />
      <input
        type="text"
        aria-label={`${label} hex value`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-xs font-mono text-gray-700 bg-transparent border-0 outline-none p-0 min-w-0"
        placeholder="#000000"
      />
    </div>
  );
}

export function SlideForm({ slide, onDone }: Props) {
  const [form, setForm] = useState(slide ?? DEFAULT);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const hasImage = !!form.imageUrl;

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

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <span className="shrink-0">⚠</span>
          {error}
        </div>
      )}

      {/* Live Preview */}
      <div
        className="rounded-2xl overflow-hidden h-32 relative flex items-center px-6 shadow-inner"
        style={{ background: `linear-gradient(135deg, ${form.bgFrom}, ${form.bgTo})` }}
      >
        {form.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none select-none" />
        )}
        <div className="relative z-10 flex-1 min-w-0">
          {form.tag ? (
            <span
              className="inline-block text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2"
              style={{ background: form.tagBg }}
            >
              {form.tag}
            </span>
          ) : (
            <span className="inline-block text-white/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 border border-white/20">Badge</span>
          )}
          <p className="text-white font-black text-sm leading-tight mb-2 whitespace-pre-line line-clamp-2">
            {form.headline || <span className="opacity-30 font-normal">Headline text…</span>}
          </p>
          {form.sub && <p className="text-white/70 text-[10px] mb-2.5 line-clamp-1">{form.sub}</p>}
          {form.ctaLabel && (
            <span
              className="inline-flex items-center text-[10px] font-black px-3 py-1 rounded-full"
              style={{ background: form.ctaBg, color: form.bgFrom }}
            >
              {form.ctaLabel} →
            </span>
          )}
        </div>
        <span className="absolute top-2.5 right-3.5 text-[9px] text-white/30 font-bold uppercase tracking-widest select-none pointer-events-none">
          Preview
        </span>
      </div>

      {/* Background */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
        <SectionLabel>Background</SectionLabel>

        {/* Image Upload */}
        <div className="flex items-center gap-3">
          {hasImage ? (
            <div className="relative w-24 h-14 rounded-xl overflow-hidden border border-gray-200 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imageUrl!} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => set("imageUrl", null)}
                className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/50 transition-colors group"
              >
                <Trash2 size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center shrink-0 bg-white">
              <ImageIcon size={16} className="text-gray-300" />
            </div>
          )}
          <div className="flex-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50 shadow-sm"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
              {uploading ? "Uploading…" : hasImage ? "Replace Image" : "Upload Image"}
            </button>
            <p className="text-[10px] text-gray-400 mt-1.5">JPEG, PNG, WebP · max 5 MB</p>
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

        {/* Gradient — collapsed if image is set */}
        {hasImage ? (
          <details className="group">
            <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 select-none list-none flex items-center gap-1.5">
              <span className="inline-block transition-transform group-open:rotate-90">›</span>
              Fallback gradient
            </summary>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field label="From">
                <ColorInput label="Gradient from" value={form.bgFrom} onChange={(v) => set("bgFrom", v)} />
              </Field>
              <Field label="To">
                <ColorInput label="Gradient to" value={form.bgTo} onChange={(v) => set("bgTo", v)} />
              </Field>
            </div>
          </details>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gradient From">
              <ColorInput label="Gradient from" value={form.bgFrom} onChange={(v) => set("bgFrom", v)} />
            </Field>
            <Field label="Gradient To">
              <ColorInput label="Gradient to" value={form.bgTo} onChange={(v) => set("bgTo", v)} />
            </Field>
          </div>
        )}
      </div>

      {/* Badge */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
        <SectionLabel>Badge</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tag Text" hint={hasImage ? "· optional" : "(e.g. ⚡ Flash Deals)"}>
            <input
              value={form.tag}
              onChange={(e) => set("tag", e.target.value)}
              required={!hasImage}
              className="w-full text-sm px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none hover:border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors"
              placeholder="⚡ Flash Deals"
            />
          </Field>
          <Field label="Badge Colour">
            <ColorInput label="Badge colour" value={form.tagBg} onChange={(v) => set("tagBg", v)} />
            <p className="text-[10px] text-gray-400 mt-1">8-char hex for transparency</p>
          </Field>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
        <SectionLabel>Content{hasImage && <span className="ml-1 normal-case font-normal text-gray-400 tracking-normal"> · optional</span>}</SectionLabel>
        <Field label="Headline">
          <textarea
            value={form.headline}
            onChange={(e) => set("headline", e.target.value)}
            required={!hasImage}
            rows={2}
            className="w-full text-sm px-3 py-2 bg-white border border-gray-200 rounded-xl resize-none outline-none hover:border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors"
            placeholder={"Everyday Essentials,\nUnbeatable Prices"}
          />
        </Field>
        <Field label="Subtitle">
          <input
            value={form.sub}
            onChange={(e) => set("sub", e.target.value)}
            required={!hasImage}
            className="w-full text-sm px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none hover:border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors"
            placeholder="Shop kitchenware, daily necessities & more"
          />
        </Field>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
        <SectionLabel>Button{hasImage && <span className="ml-1 normal-case font-normal text-gray-400 tracking-normal"> · optional</span>}</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Label">
            <input
              value={form.ctaLabel}
              onChange={(e) => set("ctaLabel", e.target.value)}
              required={!hasImage}
              className="w-full text-sm px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none hover:border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors"
              placeholder="Shop Deals"
            />
          </Field>
          <Field label="Link">
            <input
              value={form.ctaHref}
              onChange={(e) => set("ctaHref", e.target.value)}
              required={!hasImage}
              className="w-full text-sm px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none hover:border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors"
              placeholder="/shop"
            />
          </Field>
        </div>
        <Field label="Button Colour">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ColorInput label="Button colour" value={form.ctaBg} onChange={(v) => set("ctaBg", v)} />
            </div>
            <div
              className="h-9 px-4 rounded-full flex items-center text-xs font-black shrink-0 pointer-events-none"
              style={{ background: form.ctaBg, color: form.bgFrom }}
            >
              {form.ctaLabel || "Button"} →
            </div>
          </div>
        </Field>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-9 h-5 rounded-full transition-colors ${form.isActive ? "bg-orange-500" : "bg-gray-200"}`}
            />
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700">
            {form.isActive ? "Active" : "Hidden"}
          </span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDone}
            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {slide ? "Save Changes" : "Add Slide"}
          </button>
        </div>
      </div>
    </form>
  );
}
