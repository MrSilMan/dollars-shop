"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createPromoCard, updatePromoCard } from "@/actions/homepage";
import { LinkPicker } from "./LinkPicker";

type Card = {
  id: string;
  amount: string;
  label: string;
  desc: string;
  sub: string;
  href: string;
  leftBg: string;
  rightBg: string;
  sortOrder: number;
  isActive: boolean;
};

type Props = {
  card?: Card;
  onDone: () => void;
};

const BG_OPTIONS = [
  { label: "Red",           value: "bg-(--color-danger)",                                               swatch: "swatch-red" },
  { label: "Orange",        value: "bg-(--color-accent)",                                               swatch: "swatch-orange" },
  { label: "Dark Green",    value: "bg-(--color-primary)",                                              swatch: "swatch-dark-green" },
  { label: "Green Gradient",value: "bg-linear-to-b from-(--color-primary) to-(--color-primary-dark)",  swatch: "swatch-green-grad" },
  { label: "Light Green",   value: "bg-(--color-primary-light)",                                        swatch: "swatch-light-green" },
  { label: "Light Cream",   value: "bg-(--color-accent-light)",                                         swatch: "swatch-light-cream" },
];

const DEFAULT: Omit<Card, "id"> = {
  amount: "",
  label: "",
  desc: "",
  sub: "",
  href: "/shop",
  leftBg: "bg-(--color-danger)",
  rightBg: "bg-(--color-primary-light)",
  sortOrder: 0,
  isActive: true,
};

export function PromoCardForm({ card, onDone }: Props) {
  const [form, setForm] = useState(card ?? DEFAULT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) };
      if (card) {
        await updatePromoCard(card.id, payload);
      } else {
        await createPromoCard(payload);
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

      {/* Preview */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 w-48">
        <div className={`${form.leftBg} w-14 flex flex-col items-center justify-center text-white shrink-0 py-4 px-1`}>
          <span className="text-base font-black leading-none">{form.amount || "–"}</span>
          <span className="text-[9px] font-bold tracking-wider text-white/80 mt-0.5 text-center">{form.label || "–"}</span>
        </div>
        <div className={`${form.rightBg} flex-1 px-3 py-3 flex flex-col justify-center`}>
          <p className="font-bold text-xs text-gray-800 leading-tight">{form.desc || "Description"}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">{form.sub || "Subtitle"}</p>
          <span className="text-[10px] font-bold text-orange-600 mt-1.5">Shop Now →</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Amount <span className="text-gray-400 font-normal">(e.g. 30%, FREE, ⚡)</span></label>
          <input value={form.amount} onChange={(e) => set("amount", e.target.value)} required className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" placeholder="30%" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Label <span className="text-gray-400 font-normal">(e.g. OFF, SHIP)</span></label>
          <input value={form.label} onChange={(e) => set("label", e.target.value)} required className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" placeholder="OFF" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Description <span className="text-gray-400 font-normal">(main text)</span></label>
        <input value={form.desc} onChange={(e) => set("desc", e.target.value)} required className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" placeholder="All Groceries" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Subtitle / Filter Text <span className="text-gray-400 font-normal">(e.g. Limited time)</span></label>
        <input value={form.sub} onChange={(e) => set("sub", e.target.value)} required className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg" placeholder="Limited time" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Link</label>
        <LinkPicker value={form.href} onChange={(v) => set("href", v)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Left Background</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {BG_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                title={o.label}
                onClick={() => set("leftBg", o.value)}
                className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${o.swatch} ${form.leftBg === o.value ? "border-gray-700 scale-110 shadow-md" : "border-gray-200 hover:border-gray-400"}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">{BG_OPTIONS.find(o => o.value === form.leftBg)?.label ?? "Custom"}</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Right Background</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {BG_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                title={o.label}
                onClick={() => set("rightBg", o.value)}
                className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${o.swatch} ${form.rightBg === o.value ? "border-gray-700 scale-110 shadow-md" : "border-gray-200 hover:border-gray-400"}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">{BG_OPTIONS.find(o => o.value === form.rightBg)?.label ?? "Custom"}</p>
        </div>
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
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50">
            {saving && <Loader2 size={13} className="animate-spin" />}
            {card ? "Save Changes" : "Add Card"}
          </button>
        </div>
      </div>
    </form>
  );
}
