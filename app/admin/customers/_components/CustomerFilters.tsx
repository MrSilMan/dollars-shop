"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";

interface CustomerFiltersProps {
  initialSearch: string;
  initialHasOrders: string;
  total: number;
  filtered: number;
}

export function CustomerFilters({
  initialSearch,
  initialHasOrders,
  total,
  filtered,
}: CustomerFiltersProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [search,    setSearch]    = useState(initialSearch);
  const [hasOrders, setHasOrders] = useState(initialHasOrders);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pushURL(s: string, h: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (s) params.set("search", s); else params.delete("search");
    if (h) params.set("orders", h); else params.delete("orders");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushURL(value, hasOrders), 350);
  }

  function handleHasOrders(value: string) {
    setHasOrders(value);
    pushURL(search, value);
  }

  function handleClear() {
    setSearch(""); setHasOrders("");
    router.push(pathname);
  }

  const hasFilters = search || hasOrders;
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
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-(--color-border) rounded-xl placeholder:text-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15 focus:border-(--color-primary) transition-colors"
        />
      </div>

      {/* Orders filter */}
      <div className="relative">
        <select
          value={hasOrders}
          onChange={(e) => handleHasOrders(e.target.value)}
          className="appearance-none pl-3.5 pr-9 py-2.5 text-sm bg-white border border-(--color-border) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15 focus:border-(--color-primary) transition-colors text-(--color-text-primary) cursor-pointer"
        >
          <option value="">All Customers</option>
          <option value="yes">Has Orders</option>
          <option value="no">No Orders</option>
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
          {filtered} of {total} customer{total !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
