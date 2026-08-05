"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AppSettingsData } from "@/lib/app-settings";

/** Fields a settings page is allowed to own — `id` and `updatedAt` are server-managed. */
export type SettingsField = Exclude<keyof AppSettingsData, "id" | "updatedAt">;

/**
 * Holds the full settings object so previews stay accurate, but only saves —
 * and only tracks dirtiness for — the fields the calling page owns. Pass
 * `fields` as a module-level constant so its identity stays stable.
 */
export function useAppSettingsForm(initial: AppSettingsData, fields: readonly SettingsField[]) {
  const [form, setForm] = useState<AppSettingsData>(initial);
  const [baseline, setBaseline] = useState<AppSettingsData>(initial);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const patch = useCallback((values: Partial<AppSettingsData>) => {
    setForm((prev) => ({ ...prev, ...values }));
  }, []);

  const isDirty = useMemo(
    () => fields.some((key) => JSON.stringify(form[key]) !== JSON.stringify(baseline[key])),
    [fields, form, baseline],
  );

  const save = useCallback(() => {
    startTransition(async () => {
      try {
        const payload: Partial<Record<SettingsField, unknown>> = {};
        for (const key of fields) payload[key] = form[key];

        const res = await fetch("/api/app-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Save failed");

        setBaseline(form);
        toast.success("Saved — changes are now live");
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to save settings");
      }
    });
  }, [fields, form, router]);

  return { form, patch, save, isPending, isDirty };
}
