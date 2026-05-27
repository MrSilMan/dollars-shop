"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductFiltersProps {
  categories: Category[];
  initialSearch: string;
  initialCategory: string;
  total: number;
  filtered: number;
}

export function ProductFilters({
  categories,
  initialSearch,
  initialCategory,
  total,
  filtered,
}: ProductFiltersProps) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const [search,   setSearch]   = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pushURL(newSearch: string, newCategory: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newSearch)    params.set("search",   newSearch);   else params.delete("search");
    if (newCategory)  params.set("category", newCategory); else params.delete("category");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushURL(value, category), 350);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    pushURL(search, value);
  }

  function handleClear() {
    setSearch("");
    setCategory("");
    router.push(pathname);
  }

  const hasFilters = search || category;
  const isFiltered = filtered !== total;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-56">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-(--color-border) rounded-xl placeholder:text-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15 focus:border-(--color-primary) transition-colors"
        />
      </div>

      {/* Category */}
      <div className="relative">
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="appearance-none pl-3.5 pr-9 py-2.5 text-sm bg-white border border-(--color-border) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--color-primary)/15 focus:border-(--color-primary) transition-colors text-(--color-text-primary) cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none"
        />
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

      {/* Result count */}
      {isFiltered && (
        <span className="text-xs text-(--color-text-muted) ml-auto">
          {filtered} of {total} product{total !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
