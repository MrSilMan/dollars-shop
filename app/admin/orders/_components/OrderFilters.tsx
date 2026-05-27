"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const PAYMENT_STATUSES = ["UNPAID", "PENDING_VERIFICATION", "PAID", "FAILED", "REFUNDED"];

interface OrderFiltersProps {
  initialSearch: string;
  initialStatus: string;
  initialPayment: string;
  total: number;
  filtered: number;
}

export function OrderFilters({
  initialSearch,
  initialStatus,
  initialPayment,
  total,
  filtered,
}: OrderFiltersProps) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const [search,  setSearch]  = useState(initialSearch);
  const [status,  setStatus]  = useState(initialStatus);
  const [payment, setPayment] = useState(initialPayment);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pushURL(s: string, st: string, pm: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (s)  params.set("search",  s);  else params.delete("search");
    if (st) params.set("status",  st); else params.delete("status");
    if (pm) params.set("payment", pm); else params.delete("payment");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushURL(value, status, payment), 350);
  }

  function handleStatus(value: string) {
    setStatus(value);
    pushURL(search, value, payment);
  }

  function handlePayment(value: string) {
    setPayment(value);
    pushURL(search, status, value);
  }

  function handleClear() {
    setSearch(""); setStatus(""); setPayment("");
    router.push(pathname);
  }

  const hasFilters = search || status || payment;
  const isFiltered = filtered !== total;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-56">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search order # or customer…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-(--color-border) rounded-xl placeholder:text-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15 focus:border-(--color-primary) transition-colors"
        />
      </div>

      {/* Status */}
      <div className="relative">
        <select
          value={status}
          onChange={(e) => handleStatus(e.target.value)}
          className="appearance-none pl-3.5 pr-9 py-2.5 text-sm bg-white border border-(--color-border) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15 focus:border-(--color-primary) transition-colors text-(--color-text-primary) cursor-pointer"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
      </div>

      {/* Payment */}
      <div className="relative">
        <select
          value={payment}
          onChange={(e) => handlePayment(e.target.value)}
          className="appearance-none pl-3.5 pr-9 py-2.5 text-sm bg-white border border-(--color-border) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15 focus:border-(--color-primary) transition-colors text-(--color-text-primary) cursor-pointer"
        >
          <option value="">All Payments</option>
          {PAYMENT_STATUSES.map((p) => (
            <option key={p} value={p}>{p.replace(/_/g, " ").charAt(0) + p.replace(/_/g, " ").slice(1).toLowerCase()}</option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1.5 text-sm font-medium text-(--color-text-muted) hover:text-(--color-text-primary) px-3 py-2.5 rounded-xl hover:bg-(--color-surface-alt) transition-colors"
        >
          <X size={13} />
          Clear
        </button>
      )}

      {/* Count */}
      {isFiltered && (
        <span className="text-xs text-(--color-text-muted) ml-auto">
          {filtered} of {total} order{total !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
