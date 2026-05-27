"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center bg-(--color-surface-alt) border border-(--color-border) rounded-full overflow-hidden focus-within:border-(--color-primary) transition-colors duration-150"
    >
      <Search size={18} className="text-(--color-text-muted) shrink-0 ml-4" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, categories…"
        aria-label="Search products"
        className="flex-1 outline-none text-sm bg-transparent px-3 py-2.5 placeholder:text-(--color-text-muted)"
      />
      <button
        type="submit"
        className="bg-(--color-primary) hover:bg-(--color-primary-dark) active:bg-(--color-primary-dark) text-white text-sm font-bold px-5 py-2.5 rounded-full m-0.5 transition-colors duration-150 shrink-0"
      >
        Search
      </button>
    </form>
  );
}
