"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, RotateCcw, ImageIcon, Star } from "lucide-react";
import type { AppSettingsData } from "@/lib/app-settings";
import { useAppSettingsForm, type SettingsField } from "./useAppSettingsForm";
import { SettingsSection, SaveBar } from "./SettingsSection";

const FIELDS: readonly SettingsField[] = ["logoUrl", "faviconUrl"];

export function BrandingForm({ initialSettings }: { initialSettings: AppSettingsData }) {
  const { form, patch, save, isPending, isDirty } = useAppSettingsForm(initialSettings, FIELDS);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  async function upload(
    file: File,
    endpoint: string,
    onDone: (url: string) => void,
    setBusy: (v: boolean) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onDone(data.url);
      toast.success("Uploaded — remember to save");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const logoSrc = form.logoUrl ?? "/images/logo-1.png";

  return (
    <div className="max-w-3xl space-y-6">
      <SettingsSection icon={ImageIcon} tone="blue" title="Logo" description="PNG, WebP or SVG · max 2 MB">
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
                ref={logoRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    upload(
                      file,
                      "/api/super-admin/upload-logo",
                      (url) => patch({ logoUrl: url }),
                      setLogoUploading,
                      logoRef,
                    );
                }}
                className="hidden"
                disabled={logoUploading}
              />
            </label>
            {form.logoUrl && (
              <button
                type="button"
                onClick={() => patch({ logoUrl: null })}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 text-sm font-medium rounded-xl transition-colors"
              >
                <RotateCcw size={14} />
                Reset to Default
              </button>
            )}
          </div>
        </div>
        {form.logoUrl && <p className="mt-3 text-xs text-slate-400 font-mono truncate">{form.logoUrl}</p>}
      </SettingsSection>

      <SettingsSection
        icon={Star}
        tone="amber"
        title="Favicon"
        description="Square icon only, no text · ICO or PNG · min 32×32 px · max 1 MB"
      >
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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file)
                  upload(
                    file,
                    "/api/super-admin/upload-favicon",
                    (url) => patch({ faviconUrl: url }),
                    setFaviconUploading,
                    faviconRef,
                  );
              }}
              className="hidden"
              disabled={faviconUploading}
            />
          </label>
          {form.faviconUrl && (
            <button
              type="button"
              onClick={() => patch({ faviconUrl: null })}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 text-sm font-medium rounded-xl transition-colors"
            >
              <RotateCcw size={14} />
              Remove
            </button>
          )}
        </div>
        {form.faviconUrl && <p className="mt-3 text-xs text-slate-400 font-mono truncate">{form.faviconUrl}</p>}
      </SettingsSection>

      <SaveBar onSave={save} isPending={isPending} isDirty={isDirty} />
    </div>
  );
}
