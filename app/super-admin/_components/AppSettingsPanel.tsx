"use client";

import { useState, useRef, useTransition } from "react";
import { toast } from "sonner";
import { Upload, RotateCcw, Palette, ImageIcon, Info, Type, Save, Eye, Star, MessageCircle, Plus, Trash2 } from "lucide-react";
import type { AppSettingsData } from "@/lib/app-settings";

type Props = { initialSettings: AppSettingsData };

function AddAdminNumberInput({ onAdd }: { onAdd: (num: string) => void }) {
  const [value, setValue] = useState("");
  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
  }
  return (
    <div className="flex gap-2">
      <input
        type="tel"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="+244938393867"
        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
      />
      <button
        type="button"
        onClick={submit}
        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
      >
        <Plus size={14} />
        Add
      </button>
    </div>
  );
}

const FONT_SCALES = [
  { value: "SMALL", label: "Small", desc: "14px base" },
  { value: "MEDIUM", label: "Medium", desc: "16px base" },
  { value: "LARGE", label: "Large", desc: "18px base" },
] as const;

const COLOR_FIELDS: { key: keyof AppSettingsData; label: string; cssVar: string; desc: string }[] = [
  { key: "primaryColor", label: "Primary Color", cssVar: "--color-primary", desc: "Buttons, links, highlights" },
  { key: "accentColor", label: "Accent Color", cssVar: "--color-accent", desc: "Hover states, badges" },
  { key: "bgColor", label: "Background Color", cssVar: "--color-bg", desc: "Page background" },
  { key: "textColor", label: "Text Color", cssVar: "--color-text-primary", desc: "Body text" },
];

export function AppSettingsPanel({ initialSettings }: Props) {
  const [form, setForm] = useState<AppSettingsData>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  function applyPreview(key: keyof AppSettingsData, value: string) {
    const field = COLOR_FIELDS.find((f) => f.key === key);
    if (field) {
      document.documentElement.style.setProperty(field.cssVar, value);
    }
    if (key === "fontScale") {
      const sizeMap = { SMALL: "14px", MEDIUM: "16px", LARGE: "18px" } as const;
      document.documentElement.style.fontSize = sizeMap[value as AppSettingsData["fontScale"]] ?? "16px";
    }
  }

  function handleColorChange(key: keyof AppSettingsData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    applyPreview(key, value);
  }

  function handleFontScale(value: AppSettingsData["fontScale"]) {
    setForm((prev) => ({ ...prev, fontScale: value }));
    applyPreview("fontScale", value);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/super-admin/upload-logo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setForm((prev) => ({ ...prev, logoUrl: data.url }));
      toast.success("Logo uploaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLogoUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleResetLogo() {
    setForm((prev) => ({ ...prev, logoUrl: null }));
  }

  async function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaviconUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/super-admin/upload-favicon", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setForm((prev) => ({ ...prev, faviconUrl: data.url }));
      toast.success("Favicon uploaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setFaviconUploading(false);
      if (faviconRef.current) faviconRef.current.value = "";
    }
  }

  function handleResetFavicon() {
    setForm((prev) => ({ ...prev, faviconUrl: null }));
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const { id: _id, updatedAt: _updatedAt, ...payload } = form;
        const res = await fetch("/api/app-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Save failed");
        toast.success("Settings saved — changes are now live");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to save settings");
      }
    });
  }

  const logoSrc = form.logoUrl ?? "/images/logo-1.png";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left: Controls */}
      <div className="xl:col-span-2 space-y-6">

        {/* Colors */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <Palette size={16} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Colors</h2>
              <p className="text-xs text-slate-400">Changes preview instantly on the page</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COLOR_FIELDS.map(({ key, label, desc }) => (
              <label key={key} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 cursor-pointer transition-colors">
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl ring-2 ring-offset-1 ring-slate-200"
                    style={{ background: form[key] as string }}
                  />
                  <input
                    type="color"
                    value={form[key] as string}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    title={label}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 leading-none">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  <p className="text-xs font-mono text-slate-500 mt-1">{form[key] as string}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Logo */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <ImageIcon size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Logo</h2>
              <p className="text-xs text-slate-400">PNG, WebP or SVG · max 2 MB</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-32 h-16 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="Logo preview" className="h-12 w-auto object-contain" />
            </div>
            <div className="flex gap-3 flex-wrap">
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl cursor-pointer transition-colors">
                {logoUploading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                {logoUploading ? "Uploading…" : "Upload Logo"}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={logoUploading}
                />
              </label>
              {form.logoUrl && (
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 text-sm font-medium rounded-xl transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset to Default
                </button>
              )}
            </div>
          </div>
          {form.logoUrl && (
            <p className="mt-3 text-xs text-slate-400 font-mono truncate">{form.logoUrl}</p>
          )}
        </section>

        {/* Favicon */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Favicon</h2>
              <p className="text-xs text-slate-400">Square icon only, no text · ICO or PNG · min 32×32 px · max 1 MB</p>
            </div>
          </div>
          {/* Browser-tab mockup */}
          <div className="mb-5 bg-slate-100 rounded-xl p-3 w-fit">
            <div className="flex items-end gap-0.5 mb-0.5">
              <div className="flex items-center gap-1.5 bg-white rounded-t-lg px-3 py-1.5 border border-b-0 border-slate-200 shadow-sm">
                {form.faviconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.faviconUrl} alt="favicon" className="w-4 h-4 object-cover rounded-sm shrink-0" />
                ) : (
                  <Star size={12} className="text-slate-300 shrink-0" />
                )}
                <span className="text-[11px] text-slate-600 font-medium whitespace-nowrap max-w-[120px] truncate">
                  {form.appName || "Dollar Shop"}
                </span>
                <span className="text-[10px] text-slate-300 ml-1">✕</span>
              </div>
              <div className="w-6 h-7 bg-slate-200/70 rounded-t-md" />
            </div>
            <div className="h-5 bg-white rounded-b-md border border-slate-200 flex items-center px-2 gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-200" />
              <div className="flex-1 h-2 rounded-full bg-slate-100" />
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <label className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl cursor-pointer transition-colors">
              {faviconUploading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {faviconUploading ? "Uploading…" : "Upload Favicon"}
              <input
                ref={faviconRef}
                type="file"
                accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml,image/webp"
                onChange={handleFaviconUpload}
                className="hidden"
                disabled={faviconUploading}
              />
            </label>
            {form.faviconUrl && (
              <button
                type="button"
                onClick={handleResetFavicon}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 text-sm font-medium rounded-xl transition-colors"
              >
                <RotateCcw size={14} />
                Remove
              </button>
            )}
          </div>
          {form.faviconUrl && (
            <p className="mt-3 text-xs text-slate-400 font-mono truncate">{form.faviconUrl}</p>
          )}
        </section>

        {/* App Info */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Info size={16} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">App Info</h2>
              <p className="text-xs text-slate-400">Browser tab title and footer copyright</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">App Name / Title</label>
              <input
                type="text"
                value={form.appName}
                onChange={(e) => setForm((p) => ({ ...p, appName: e.target.value }))}
                maxLength={80}
                placeholder="Dollar Shop"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Footer Text / Copyright</label>
              <input
                type="text"
                value={form.footerText}
                onChange={(e) => setForm((p) => ({ ...p, footerText: e.target.value }))}
                maxLength={300}
                placeholder="© 2025 Dollar Shop — Quality Everyday."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
              />
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
              <Type size={16} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Typography</h2>
              <p className="text-xs text-slate-400">Global font size scale</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {FONT_SCALES.map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleFontScale(value)}
                className={`flex-1 min-w-[90px] px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  form.fontScale === value
                    ? "border-violet-500 bg-violet-50 text-violet-900"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <p className="text-sm font-bold">{label}</p>
                <p className="text-xs mt-0.5 opacity-60">{desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* WhatsApp Admin Numbers */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
              <MessageCircle size={16} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">WhatsApp Admin Numbers</h2>
              <p className="text-xs text-slate-400">Numbers that have access to the admin bot panel</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {form.whatsappAdminNumbers.map((num, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <MessageCircle size={13} className="text-green-500 shrink-0" />
                <span className="flex-1 text-sm font-mono text-slate-700">{num}</span>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, whatsappAdminNumbers: p.whatsappAdminNumbers.filter((_, j) => j !== i) }))}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {form.whatsappAdminNumbers.length === 0 && (
              <p className="text-xs text-slate-400 italic">No numbers added — falling back to WHATSAPP_ADMIN_NUMBER env var.</p>
            )}
          </div>
          <AddAdminNumberInput
            onAdd={(num) => {
              if (form.whatsappAdminNumbers.includes(num)) return toast.error("Number already added");
              if (form.whatsappAdminNumbers.length >= 10) return toast.error("Maximum 10 numbers");
              setForm((p) => ({ ...p, whatsappAdminNumbers: [...p.whatsappAdminNumbers, num] }));
            }}
          />
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-7 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold text-sm rounded-2xl transition-colors shadow-sm"
          >
            {isPending ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {isPending ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="xl:col-span-1">
        <div className="sticky top-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={15} className="text-slate-400" />
              <p className="text-sm font-bold text-slate-700">Live Preview</p>
            </div>

            {/* Mini store preview */}
            <div
              className="rounded-xl overflow-hidden border border-slate-100"
              style={{ background: form.bgColor, color: form.textColor }}
            >
              {/* Navbar mockup */}
              <div
                className="flex items-center justify-between px-3 py-2.5 border-b border-black/5"
                style={{ background: "#FEF3C7" }}
              >
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoSrc} alt="logo" className="h-6 w-auto object-contain" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-5 rounded-full" style={{ background: form.primaryColor, opacity: 0.15 }} />
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: form.primaryColor }}>
                    <span className="text-[7px] text-white font-bold">3</span>
                  </div>
                </div>
              </div>

              {/* Hero mockup */}
              <div
                className="px-3 py-4 flex flex-col gap-1"
                style={{ background: `linear-gradient(135deg, ${form.primaryColor}22, ${form.accentColor}22)` }}
              >
                <div className="w-16 h-2 rounded-full" style={{ background: form.accentColor }} />
                <div className="w-28 h-3 rounded-full" style={{ background: form.textColor, opacity: 0.8 }} />
                <div className="w-20 h-2 rounded-full mt-0.5" style={{ background: form.textColor, opacity: 0.4 }} />
                <div className="mt-2 w-16 h-6 rounded-lg flex items-center justify-center" style={{ background: form.primaryColor }}>
                  <span className="text-[9px] text-white font-bold">Shop Now</span>
                </div>
              </div>

              {/* Products grid mockup */}
              <div className="px-3 py-3 grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg border border-black/5 overflow-hidden" style={{ background: "white" }}>
                    <div className="h-10" style={{ background: `${form.primaryColor}15` }} />
                    <div className="p-1.5 space-y-1">
                      <div className="w-full h-1.5 rounded-full" style={{ background: form.textColor, opacity: 0.3 }} />
                      <div className="w-2/3 h-2 rounded-full" style={{ background: form.primaryColor }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer mockup */}
              <div className="px-3 py-2.5" style={{ background: form.primaryColor }}>
                <div className="w-20 h-1.5 rounded-full bg-white/40 mb-1" />
                <div className="text-[8px] text-white/50 truncate">{form.footerText}</div>
              </div>
            </div>

            {/* App name preview */}
            <div className="mt-3 px-3 py-2 bg-slate-50 rounded-xl">
              <p className="text-[10px] text-slate-400 font-medium">Browser tab title</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate">{form.appName} — Shop More. Save More.</p>
            </div>

            {/* Font scale preview */}
            <div className="mt-2 px-3 py-2 bg-slate-50 rounded-xl flex items-baseline gap-3">
              <span style={{ fontSize: "0.6rem", color: form.textColor }}>Aa</span>
              <span style={{ fontSize: "0.75rem", color: form.textColor }}>Aa</span>
              <span style={{ fontSize: "1rem", color: form.textColor }}>Aa</span>
              <p className="text-[9px] text-slate-400 ml-auto">
                {form.fontScale === "SMALL" ? "14px" : form.fontScale === "LARGE" ? "18px" : "16px"} base
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
