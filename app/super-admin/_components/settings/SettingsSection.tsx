"use client";

import type { LucideIcon } from "lucide-react";
import { Save } from "lucide-react";
import { TONE_CLASSES, type SettingsTone } from "./nav";

/** Shared input styling so every settings field looks and focuses the same. */
export const SETTINGS_INPUT =
  "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition";

export function SettingsSection({
  icon: Icon,
  tone,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  tone: SettingsTone;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${TONE_CLASSES[tone]}`}>
          <Icon size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function SaveBar({
  onSave,
  isPending,
  isDirty,
}: {
  onSave: () => void;
  isPending: boolean;
  isDirty: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-1 px-1 py-3 flex items-center gap-3 bg-slate-50/85 backdrop-blur border-t border-slate-200">
      <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
        {isDirty ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-amber-600">Unsaved changes</span>
          </>
        ) : (
          "All changes saved"
        )}
      </p>
      <button
        type="button"
        onClick={onSave}
        disabled={isPending || !isDirty}
        className="ml-auto flex items-center gap-2 px-7 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-2xl transition-colors shadow-sm"
      >
        {isPending ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <Save size={15} />
        )}
        {isPending ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
