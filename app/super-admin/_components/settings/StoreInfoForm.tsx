"use client";

import { Info, MapPin } from "lucide-react";
import type { AppSettingsData } from "@/lib/app-settings";
import { useAppSettingsForm, type SettingsField } from "./useAppSettingsForm";
import { SettingsSection, SaveBar, SETTINGS_INPUT } from "./SettingsSection";
import { PreviewPanel, StorePreview } from "./StorePreview";

const FIELDS: readonly SettingsField[] = [
  "appName",
  "footerText",
  "contactAddress",
  "contactPhone",
  "contactEmail",
  "contactHours",
  "facebookUrl",
  "instagramUrl",
];

export function StoreInfoForm({ initialSettings }: { initialSettings: AppSettingsData }) {
  const { form, patch, save, isPending, isDirty } = useAppSettingsForm(initialSettings, FIELDS);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <SettingsSection icon={Info} tone="emerald" title="App Info" description="Browser tab title and footer copyright">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">App Name / Title</label>
              <input
                type="text"
                value={form.appName}
                onChange={(e) => patch({ appName: e.target.value })}
                maxLength={80}
                placeholder="Dollar Shop"
                className={SETTINGS_INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Footer Text / Copyright</label>
              <input
                type="text"
                value={form.footerText}
                onChange={(e) => patch({ footerText: e.target.value })}
                maxLength={300}
                placeholder="© 2025 Dollar Shop — Quality Everyday."
                className={SETTINGS_INPUT}
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={MapPin}
          tone="sky"
          title="Footer Contact Info"
          description="Shown in the store footer · leave a field blank to hide that line"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address</label>
              <input
                type="text"
                value={form.contactAddress}
                onChange={(e) => patch({ contactAddress: e.target.value })}
                maxLength={200}
                placeholder="123 Samora Machel Ave, Harare, Zimbabwe"
                className={SETTINGS_INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) => patch({ contactPhone: e.target.value })}
                maxLength={40}
                placeholder="+263 77 256 6468"
                className={SETTINGS_INPUT}
              />
              <p className="mt-1.5 text-xs text-slate-400">Also used for the footer WhatsApp icon link</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => patch({ contactEmail: e.target.value })}
                maxLength={120}
                placeholder="hello@dollarshop.co.zw"
                className={SETTINGS_INPUT}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Opening Hours</label>
              <textarea
                value={form.contactHours}
                onChange={(e) => patch({ contactHours: e.target.value })}
                maxLength={200}
                rows={2}
                placeholder={"Mon–Sat: 8AM–6PM\nSun: 9AM–1PM"}
                className={`${SETTINGS_INPUT} resize-y`}
              />
              <p className="mt-1.5 text-xs text-slate-400">One line per row — line breaks are kept</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Facebook URL</label>
              <input
                type="url"
                value={form.facebookUrl}
                onChange={(e) => patch({ facebookUrl: e.target.value })}
                maxLength={200}
                placeholder="https://facebook.com/dollarshopzw"
                className={SETTINGS_INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Instagram URL</label>
              <input
                type="url"
                value={form.instagramUrl}
                onChange={(e) => patch({ instagramUrl: e.target.value })}
                maxLength={200}
                placeholder="https://instagram.com/dollarshopzw"
                className={SETTINGS_INPUT}
              />
            </div>
          </div>
        </SettingsSection>

        <SaveBar onSave={save} isPending={isPending} isDirty={isDirty} />
      </div>

      <div className="xl:col-span-1">
        <PreviewPanel>
          <StorePreview settings={form} showTabTitle />
        </PreviewPanel>
      </div>
    </div>
  );
}
