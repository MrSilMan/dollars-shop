"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ROLE_LABELS } from "@/lib/permissions";

type AuditEntry = {
  id: string;
  actorEmail: string | null;
  actorRole: string | null;
  action: string;
  entity: string | null;
  entityLabel: string | null;
  detail: unknown;
  createdAt: string;
};

const ACTION_META: Record<string, { label: string; color: string }> = {
  PRODUCT_CREATE:      { label: "Created product",           color: "bg-blue-50 text-blue-700 border-blue-100" },
  PRODUCT_UPDATE:      { label: "Updated product",           color: "bg-blue-50 text-blue-700 border-blue-100" },
  PRODUCT_DELETE:      { label: "Archived product",          color: "bg-blue-50 text-blue-700 border-blue-100" },
  CATEGORY_CREATE:     { label: "Created category",          color: "bg-sky-50 text-sky-700 border-sky-100" },
  CATEGORY_UPDATE:     { label: "Updated category",          color: "bg-sky-50 text-sky-700 border-sky-100" },
  CATEGORY_DELETE:     { label: "Deleted category",          color: "bg-sky-50 text-sky-700 border-sky-100" },
  ORDER_STATUS_UPDATE: { label: "Updated order status",      color: "bg-green-50 text-green-700 border-green-100" },
  ORDER_COD_PAYMENT:   { label: "COD payment received",      color: "bg-green-50 text-green-700 border-green-100" },
  COUPON_CREATE:       { label: "Created coupon",            color: "bg-amber-50 text-amber-700 border-amber-100" },
  COUPON_UPDATE:       { label: "Updated coupon",            color: "bg-amber-50 text-amber-700 border-amber-100" },
  COUPON_DELETE:       { label: "Deleted coupon",            color: "bg-amber-50 text-amber-700 border-amber-100" },
  STAFF_INVITE:        { label: "Invited staff",             color: "bg-violet-50 text-violet-700 border-violet-100" },
  STAFF_EDIT:          { label: "Edited staff member",       color: "bg-violet-50 text-violet-700 border-violet-100" },
  STAFF_REMOVE:        { label: "Removed staff member",      color: "bg-rose-50 text-rose-700 border-rose-100" },
};

const ACTION_GROUPS = [
  { label: "All actions",  value: "" },
  { label: "Products",     value: "PRODUCT" },
  { label: "Categories",   value: "CATEGORY" },
  { label: "Orders",       value: "ORDER" },
  { label: "Coupons",      value: "COUPON" },
  { label: "Staff",        value: "STAFF" },
];

function DetailBadge({ detail }: { detail: unknown }) {
  if (!detail || typeof detail !== "object") return null;
  const entries = Object.entries(detail as Record<string, unknown>).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {entries.map(([k, v]) => (
        <span key={k} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
          {k}: {String(v)}
        </span>
      ))}
    </div>
  );
}

export function AuditTable({
  entries,
  total,
  page,
  pageSize,
}: {
  entries: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const totalPages = Math.ceil(total / pageSize);
  const group = searchParams.get("group") ?? "";

  function navigate(updates: Record<string, string | number>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === "" || v === 0) params.delete(k);
      else params.set(k, String(v));
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ q: search, page: 1 });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {ACTION_GROUPS.map(g => (
            <button
              key={g.value}
              onClick={() => navigate({ group: g.value, page: 1 })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                group === g.value
                  ? "bg-(--color-primary) text-white border-(--color-primary)"
                  : "bg-white text-(--color-text-muted) border-(--color-border) hover:border-(--color-primary)/40"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search actor or entity…"
              className="pl-8 pr-3 py-2 text-sm border border-(--color-border) rounded-xl outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 bg-white w-full sm:w-56"
            />
          </div>
          <button type="submit" className="px-3 py-2 text-sm bg-(--color-primary) text-white rounded-xl font-semibold shrink-0">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
        {entries.length === 0 ? (
          <div className="py-16 text-center text-(--color-text-muted) text-sm">No audit entries found</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-(--color-surface-alt) border-b border-(--color-border)">
                {["Time", "Actor", "Action", "Target", "Details"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {entries.map(e => {
                const meta = ACTION_META[e.action] ?? { label: e.action, color: "bg-gray-50 text-gray-600 border-gray-100" };
                return (
                  <tr key={e.id} className="hover:bg-(--color-surface-alt)/40 transition-colors">
                    <td className="px-5 py-3 text-xs text-(--color-text-muted) whitespace-nowrap">
                      <div>{new Date(e.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] opacity-70">{new Date(e.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs font-medium text-(--color-text-primary) truncate max-w-36">{e.actorEmail ?? "—"}</p>
                      {e.actorRole && (
                        <p className="text-[10px] text-(--color-text-muted)">{ROLE_LABELS[e.actorRole] ?? e.actorRole}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${meta.color}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-(--color-text-primary) whitespace-nowrap">
                      {e.entityLabel ?? e.entity ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <DetailBadge detail={e.detail} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-xs text-(--color-text-muted)">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} events
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => navigate({ page: page - 1 })}
              className="p-2 rounded-lg border border-(--color-border) disabled:opacity-40 hover:bg-(--color-surface-alt) transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 py-2 text-xs font-semibold text-(--color-text-muted)">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => navigate({ page: page + 1 })}
              className="p-2 rounded-lg border border-(--color-border) disabled:opacity-40 hover:bg-(--color-surface-alt) transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
