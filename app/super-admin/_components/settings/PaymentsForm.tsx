"use client";

import { Coins } from "lucide-react";
import type { AppSettingsData } from "@/lib/app-settings";
import { useAppSettingsForm, type SettingsField } from "./useAppSettingsForm";
import { SettingsSection, SaveBar } from "./SettingsSection";

const FIELDS: readonly SettingsField[] = ["zwgRate"];

export function PaymentsForm({ initialSettings }: { initialSettings: AppSettingsData }) {
  const { form, patch, save, isPending, isDirty } = useAppSettingsForm(initialSettings, FIELDS);

  return (
    <div className="max-w-3xl space-y-6">
      <SettingsSection
        icon={Coins}
        tone="teal"
        title="EcoCash — ZiG (ZWG) Rate"
        description="How many ZiG one US dollar buys at checkout"
      >
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Exchange Rate</label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">US$1 =</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={Number.isFinite(form.zwgRate) ? form.zwgRate : ""}
                onChange={(e) => patch({ zwgRate: e.target.value === "" ? NaN : Number(e.target.value) })}
                className="w-32 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
              />
              <span className="text-sm font-semibold text-slate-500">ZiG</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5">
            Example: a <span className="font-semibold">US$10.00</span> order is charged{" "}
            <span className="font-semibold text-teal-700">
              ZW$
              {(Number.isFinite(form.zwgRate) ? form.zwgRate * 10 : 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Applies only to EcoCash payments a customer chooses to settle in ZiG. Product prices stay in USD.
        </p>
      </SettingsSection>

      <SaveBar onSave={save} isPending={isPending} isDirty={isDirty} />
    </div>
  );
}
