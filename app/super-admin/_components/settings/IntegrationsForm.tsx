"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, Plus, Trash2 } from "lucide-react";
import type { AppSettingsData } from "@/lib/app-settings";
import { useAppSettingsForm, type SettingsField } from "./useAppSettingsForm";
import { SettingsSection, SaveBar } from "./SettingsSection";

const FIELDS: readonly SettingsField[] = ["whatsappAdminNumbers"];

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

export function IntegrationsForm({ initialSettings }: { initialSettings: AppSettingsData }) {
  const { form, patch, save, isPending, isDirty } = useAppSettingsForm(initialSettings, FIELDS);

  return (
    <div className="max-w-3xl space-y-6">
      <SettingsSection
        icon={MessageCircle}
        tone="green"
        title="WhatsApp Admin Numbers"
        description="Numbers that have access to the admin bot panel"
      >
        <div className="space-y-2 mb-4">
          {form.whatsappAdminNumbers.map((num, i) => (
            <div key={num} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <MessageCircle size={13} className="text-green-500 shrink-0" />
              <span className="flex-1 text-sm font-mono text-slate-700">{num}</span>
              <button
                type="button"
                onClick={() =>
                  patch({ whatsappAdminNumbers: form.whatsappAdminNumbers.filter((_, j) => j !== i) })
                }
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {form.whatsappAdminNumbers.length === 0 && (
            <p className="text-xs text-slate-400 italic">
              No numbers added — falling back to WHATSAPP_ADMIN_NUMBER env var.
            </p>
          )}
        </div>
        <AddAdminNumberInput
          onAdd={(num) => {
            if (form.whatsappAdminNumbers.includes(num)) return toast.error("Number already added");
            if (form.whatsappAdminNumbers.length >= 10) return toast.error("Maximum 10 numbers");
            patch({ whatsappAdminNumbers: [...form.whatsappAdminNumbers, num] });
          }}
        />
      </SettingsSection>

      <SaveBar onSave={save} isPending={isPending} isDirty={isDirty} />
    </div>
  );
}
