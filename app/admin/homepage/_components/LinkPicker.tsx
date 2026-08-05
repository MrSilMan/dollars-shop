"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getAllCategories } from "@/actions/products";

type Option = { label: string; value: string; group: string };

const STATIC_LINKS: Option[] = [
  { label: "Home", value: "/", group: "Pages" },
  { label: "Shop (all products)", value: "/shop", group: "Pages" },
  { label: "New Arrivals", value: "/shop/new-arrivals", group: "Pages" },
  { label: "Flash Deals", value: "/shop/flash-deals", group: "Pages" },
];

let categoryCache: Option[] | null = null;

async function loadCategoryOptions(): Promise<Option[]> {
  if (categoryCache) return categoryCache;
  const categories = await getAllCategories();
  categoryCache = categories.map((c) => ({
    label: c.name,
    value: `/shop/${c.slug}`,
    group: "Categories",
  }));
  return categoryCache;
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
};

export function LinkPicker({ value, onChange, placeholder, required = true }: Props) {
  const [options, setOptions] = useState<Option[]>(STATIC_LINKS);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCategoryOptions().then((cats) => setOptions([...STATIC_LINKS, ...cats]));
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) { setOpen(false); setSearched(false); }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const query = searched ? value.trim().toLowerCase() : "";
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query) || o.value.toLowerCase().includes(query))
    : options;

  const groups = Array.from(new Set(filtered.map((o) => o.group)));

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => { onChange(e.target.value); setSearched(true); setOpen(true); }}
          onFocus={() => setOpen(true)}
          required={required}
          className="w-full text-sm pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl outline-none hover:border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors"
          placeholder={placeholder ?? "/shop"}
        />
        <button
          type="button"
          aria-label="Toggle link suggestions"
          onClick={() => setOpen((o) => !o)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1">
          {groups.map((group) => (
            <div key={group}>
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{group}</p>
              {filtered
                .filter((o) => o.group === group)
                .map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => { onChange(o.value); setOpen(false); setSearched(false); }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-800 truncate">{o.label}</span>
                    <span className="text-[10px] text-gray-400 font-mono truncate shrink-0">{o.value}</span>
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
