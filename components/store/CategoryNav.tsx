"use client";

import Link from "next/link";
import { useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShoppingBasket } from "lucide-react";
import { categoryIconMap } from "@/lib/categories";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

interface CategoryNavProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ inline: "center", block: "nearest", behavior: "instant" });
  }, [activeSlug]);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 240 : -240, behavior: "smooth" });
  }, []);

  const pillBase =
    "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-150 whitespace-nowrap";
  const pillActive = "bg-(--color-primary) text-white border-transparent";
  const pillIdle =
    "bg-white text-(--color-text-primary) border-(--color-border) hover:border-(--color-primary) hover:text-(--color-primary)";
  const navBtn =
    "shrink-0 w-7 h-7 flex items-center justify-center rounded-full border border-(--color-border) bg-white text-(--color-text-muted) hover:border-(--color-primary) hover:text-(--color-primary) transition-colors duration-150";

  return (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => scroll("left")} aria-label="Scroll categories left" className={navBtn}>
        <ChevronLeft size={14} />
      </button>

      <nav
        ref={scrollRef}
        aria-label="Product categories"
        className="flex gap-2 overflow-x-auto scrollbar-none flex-1 -mx-1 px-1"
      >
        <Link href="/shop" data-active={!activeSlug || undefined} className={`${pillBase} ${!activeSlug ? pillActive : pillIdle}`}>
          All Products
        </Link>
        {categories.map((cat) => {
          const Icon = categoryIconMap[cat.slug] ?? ShoppingBasket;
          return (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              data-active={activeSlug === cat.slug || undefined}
              className={`${pillBase} ${activeSlug === cat.slug ? pillActive : pillIdle}`}
            >
              <Icon size={13} aria-hidden="true" />
              {cat.name}
            </Link>
          );
        })}
      </nav>

      <button type="button" onClick={() => scroll("right")} aria-label="Scroll categories right" className={navBtn}>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
