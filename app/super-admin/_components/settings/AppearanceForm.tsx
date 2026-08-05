"use client";

import { Palette, Type } from "lucide-react";
import type { AppSettingsData } from "@/lib/app-settings";
import { useAppSettingsForm, type SettingsField } from "./useAppSettingsForm";
import { SettingsSection, SaveBar } from "./SettingsSection";
import { PreviewPanel, StorePreview } from "./StorePreview";

const FIELDS: readonly SettingsField[] = ["primaryColor", "accentColor", "bgColor", "textColor", "fontScale"];

type ColorKey = "primaryColor" | "accentColor" | "bgColor" | "textColor";

const COLOR_FIELDS: { key: ColorKey; label: string; cssVar: string; desc: string }[] = [
  { key: "primaryColor", label: "Primary Color", cssVar: "--color-primary", desc: "Buttons, links, highlights" },
  { key: "accentColor", label: "Accent Color", cssVar: "--color-accent", desc: "Hover states, badges" },
  { key: "bgColor", label: "Background Color", cssVar: "--color-bg", desc: "Page background" },
  { key: "textColor", label: "Text Color", cssVar: "--color-text-primary", desc: "Body text" },
];

const FONT_SCALES = [
  { value: "SMALL", label: "Small", desc: "14px base" },
  { value: "MEDIUM", label: "Medium", desc: "16px base" },
  { value: "LARGE", label: "Large", desc: "18px base" },
] as const;

const FONT_SIZE_MAP = { SMALL: "14px", MEDIUM: "16px", LARGE: "18px" } as const;

export function AppearanceForm({ initialSettings }: { initialSettings: AppSettingsData }) {
  const { form, patch, save, isPending, isDirty } = useAppSettingsForm(initialSettings, FIELDS);

  function handleColorChange(key: ColorKey, value: string) {
    patch({ [key]: value } as Partial<AppSettingsData>);
    const field = COLOR_FIELDS.find((f) => f.key === key);
    if (field) document.documentElement.style.setProperty(field.cssVar, value);
  }

  function handleFontScale(value: AppSettingsData["fontScale"]) {
    patch({ fontScale: value });
    document.documentElement.style.setProperty("font-size", FONT_SIZE_MAP[value] ?? "16px");
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <SettingsSection icon={Palette} tone="violet" title="Colors" description="Changes preview instantly on the page">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COLOR_FIELDS.map(({ key, label, desc }) => (
              <label
                key={key}
                className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 cursor-pointer transition-colors"
              >
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
        </SettingsSection>

        <SettingsSection icon={Type} tone="orange" title="Typography" description="Global font size scale">
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
        </SettingsSection>

        <SaveBar onSave={save} isPending={isPending} isDirty={isDirty} />
      </div>

      <div className="xl:col-span-1">
        <PreviewPanel>
          <StorePreview settings={form} showFontScale />
        </PreviewPanel>
      </div>
    </div>
  );
}
