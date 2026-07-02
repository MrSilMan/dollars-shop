"use client";

import { useState } from "react";
import { toast } from "sonner";
import { sendDealToSubscribers } from "@/actions/admin/newsletter";
import { Mail, Loader2, Send, Users } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

const empty = { subject: "", bodyHtml: "", ctaText: "", ctaUrl: "" };

export function NewsletterManager({ subscribers }: { subscribers: Subscriber[] }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const input = "w-full px-3 py-2 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) bg-white";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await sendDealToSubscribers({
      subject: form.subject,
      bodyHtml: form.bodyHtml,
      ctaText: form.ctaText || null,
      ctaUrl: form.ctaUrl || null,
    });
    setLoading(false);
    if ("error" in result) {
      setError(result.error ?? null);
      toast.error(result.error ?? "Failed to send");
      return;
    }
    toast.success(`Sent to ${result.sent}/${result.total} subscribers${result.failed ? ` (${result.failed} failed)` : ""}`);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      {/* Subscriber count */}
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-(--color-border) px-5 py-4">
        <div className="w-10 h-10 rounded-xl bg-(--color-primary)/10 flex items-center justify-center">
          <Users size={18} className="text-(--color-primary)" />
        </div>
        <div>
          <p className="text-lg font-bold text-(--color-text-primary)">{subscribers.length}</p>
          <p className="text-xs text-(--color-text-muted)">subscriber{subscribers.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      {/* Compose form */}
      <div className="bg-white rounded-2xl border border-(--color-border) p-6 space-y-4">
        <h2 className="font-semibold text-base flex items-center gap-2">
          <Mail size={16} className="text-(--color-primary)" /> Send a Deal
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Subject</label>
            <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={input} placeholder="Flash Sale — 20% off everything!" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Message (HTML allowed)</label>
            <textarea value={form.bodyHtml} onChange={e => setForm(f => ({ ...f, bodyHtml: e.target.value }))} className={`${input} min-h-32 resize-y`} placeholder="<p>Don't miss out on our weekend flash sale...</p>" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Button Text (optional)</label>
              <input value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} className={input} placeholder="Shop Now" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Button Link (optional)</label>
              <input value={form.ctaUrl} onChange={e => setForm(f => ({ ...f, ctaUrl: e.target.value }))} className={input} placeholder="https://dollarshop.co.zw" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={loading || subscribers.length === 0} className="flex items-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-dark) disabled:opacity-60 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send to {subscribers.length} Subscriber{subscribers.length === 1 ? "" : "s"}
            </button>
          </div>
        </form>
      </div>

      {/* Subscriber list */}
      <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
        {subscribers.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-(--color-text-muted)">
            <Mail size={32} className="mb-3 opacity-40" />
            <p className="font-medium">No subscribers yet</p>
            <p className="text-sm mt-0.5">Emails collected from the homepage signup will appear here</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-(--color-surface-alt)">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {subscribers.map(s => (
                <tr key={s.id} className="hover:bg-surface-alt/50 transition-colors">
                  <td className="px-5 py-3 text-(--color-text-primary)">{s.email}</td>
                  <td className="px-5 py-3 text-(--color-text-muted) text-xs">{new Date(s.createdAt).toLocaleDateString("en-ZW")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
