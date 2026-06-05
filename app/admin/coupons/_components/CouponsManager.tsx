"use client";

import { useState, useEffect, useRef } from "react";
import { createCoupon, updateCoupon, deleteCoupon } from "@/actions/coupons";
import { Plus, Pencil, Trash2, Tag, Loader2, X, AlertTriangle } from "lucide-react";

function ConfirmModal({ title, description, onConfirm, onCancel }: { title: string; description: string; onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={15} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: Date;
}

type FormState = {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number | null;
  maxUses: number | null;
  expiresAt: string | null;
  isActive: boolean;
};

const empty: FormState = {
  code: "",
  type: "PERCENTAGE",
  value: 10,
  minOrder: null,
  maxUses: null,
  expiresAt: null,
  isActive: true,
};

export function CouponsManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; code: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const input = "w-full px-3 py-2 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) bg-white";

  const reset = () => { setForm(empty); setEditing(null); setShowModal(false); setError(null); };

  useEffect(() => {
    if (!showModal) return;
    firstInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") reset(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      ...form,
      value: Number(form.value),
      minOrder: form.minOrder ? Number(form.minOrder) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };
    const result = editing ? await updateCoupon(editing, payload) : await createCoupon(payload);
    setLoading(false);
    if ("error" in result) { setError(result.error ?? null); return; }
    const saved = { ...result.coupon, expiresAt: result.coupon.expiresAt ? result.coupon.expiresAt.toString() : null, createdAt: new Date(result.coupon.createdAt) };
    if (editing) {
      setCoupons(prev => prev.map(c => c.id === editing ? { ...c, ...saved } : c));
    } else {
      setCoupons(prev => [saved, ...prev]);
    }
    reset();
  };

  const startEdit = (c: Coupon) => {
    setForm({
      code: c.code, type: c.type, value: c.value,
      minOrder: c.minOrder, maxUses: c.maxUses,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : null,
      isActive: c.isActive,
    });
    setEditing(c.id);
    setShowModal(true);
  };

  const handleDelete = (id: string, code: string) => {
    setDeleteConfirm({ id, code });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await deleteCoupon(deleteConfirm.id);
    setCoupons(prev => prev.filter(c => c.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm"
      >
        <Plus size={16} /> New Coupon
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) reset(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-(--color-border)">
              <h2 className="font-semibold text-base">{editing ? "Edit Coupon" : "New Coupon"}</h2>
              <button type="button" aria-label="Close" onClick={reset} className="p-1.5 rounded-lg hover:bg-(--color-surface-alt) transition-colors text-(--color-text-muted)">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Code</label>
                  <input ref={firstInputRef} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className={input} placeholder="SAVE10" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Type</label>
                  <select aria-label="Coupon type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as "PERCENTAGE" | "FIXED" }))} className={input}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Value</label>
                  <input type="number" step="0.01" min="0" value={form.value} placeholder="10" onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} className={input} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Min Order ($)</label>
                  <input type="number" step="0.01" min="0" value={form.minOrder ?? ""} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value ? Number(e.target.value) : null }))} className={input} placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Max Uses</label>
                  <input type="number" min="1" value={form.maxUses ?? ""} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value ? Number(e.target.value) : null }))} className={input} placeholder="Unlimited" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Expires At</label>
                  <input type="datetime-local" aria-label="Expiry date and time" value={form.expiresAt ?? ""} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value || null }))} className={input} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded accent-(--color-primary)" />
                Active
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={reset} className="px-5 py-2.5 border border-(--color-border) rounded-xl text-sm hover:bg-(--color-surface-alt) transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-dark) disabled:opacity-60 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm">
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {editing ? "Update" : "Create"} Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon list */}
      <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
        {coupons.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-(--color-text-muted)">
            <Tag size={32} className="mb-3 opacity-40" />
            <p className="font-medium">No coupons yet</p>
            <p className="text-sm mt-0.5">Create your first promo code above</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-(--color-border)">
              {coupons.map(c => {
                const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                const statusEl = isExpired
                  ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">Expired</span>
                  : c.isActive
                    ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Active</span>
                    : <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>;
                return (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-bold text-(--color-primary) text-sm">{c.code}</p>
                      <p className="text-xs text-(--color-text-muted) mt-0.5">
                        {c.type === "PERCENTAGE" ? `${c.value}%` : `$${c.value.toFixed(2)}`}
                        {c.minOrder != null && ` · min $${c.minOrder.toFixed(2)}`}
                        {c.maxUses != null && ` · ${c.usedCount}/${c.maxUses} uses`}
                      </p>
                    </div>
                    {statusEl}
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" aria-label="Edit coupon" onClick={() => startEdit(c)} className="p-2 hover:bg-(--color-surface-alt) rounded-lg transition-colors text-(--color-text-muted) hover:text-(--color-text-primary)">
                        <Pencil size={15} aria-hidden="true" />
                      </button>
                      <button type="button" aria-label="Delete coupon" onClick={() => handleDelete(c.id, c.code)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-(--color-text-muted) hover:text-red-600">
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <table className="hidden md:table w-full text-sm">
              <thead className="bg-(--color-surface-alt)">
                <tr>
                  {["Code", "Discount", "Min Order", "Uses", "Expires", "Status", ""].map((h, i) => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide ${i >= 6 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-(--color-primary)">{c.code}</td>
                    <td className="px-5 py-3">{c.type === "PERCENTAGE" ? `${c.value}%` : `$${c.value.toFixed(2)}`}</td>
                    <td className="px-5 py-3 text-(--color-text-muted)">{c.minOrder ? `$${c.minOrder.toFixed(2)}` : "—"}</td>
                    <td className="px-5 py-3 text-(--color-text-muted)">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</td>
                    <td className="px-5 py-3 text-(--color-text-muted) text-xs">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-ZW") : "Never"}
                    </td>
                    <td className="px-5 py-3">
                      {(() => {
                        const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                        if (isExpired) return <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600">Expired</span>;
                        if (c.isActive) return <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">Active</span>;
                        return <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Inactive</span>;
                      })()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" aria-label="Edit coupon" onClick={() => startEdit(c)} className="p-1.5 hover:bg-(--color-surface-alt) rounded-lg transition-colors text-(--color-text-muted) hover:text-(--color-text-primary)">
                          <Pencil size={14} aria-hidden="true" />
                        </button>
                        <button type="button" aria-label="Delete coupon" onClick={() => handleDelete(c.id, c.code)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-(--color-text-muted) hover:text-red-600">
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {deleteConfirm && (
        <ConfirmModal
          title="Delete coupon?"
          description={`"${deleteConfirm.code}" will be permanently deleted and can no longer be redeemed.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
