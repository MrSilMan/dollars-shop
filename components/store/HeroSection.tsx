"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShoppingBasket, LayoutGrid } from "lucide-react";
import { categoryIconMap as slugIconMap } from "@/lib/categories";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

interface HeroSectionProps {
  categories?: Category[];
}

const mainSlides = [
  {
    id: 1,
    tag: "⚡ Flash Deals",
    tagBg: "bg-(--color-danger)",
    headline: "Everyday Essentials,\nUnbeatable Prices",
    sub: "Shop kitchenware, daily necessities & more — all under $5",
    cta: { label: "Shop Deals", href: "/shop" },
    bg: "from-[#FF4400] to-[#E63900]",
  },
  {
    id: 2,
    tag: "✨ New Arrivals",
    tagBg: "bg-white/20",
    headline: "Fresh Stock\nJust Landed",
    sub: "New products added weekly across all categories",
    cta: { label: "See New Arrivals", href: "/shop" },
    bg: "from-[#FF6A00] to-[#FF4400]",
  },
  {
    id: 3,
    tag: "📱 Mobile Money",
    tagBg: "bg-white/20",
    headline: "EcoCash & InnBucks\nAccepted",
    sub: "Fast, secure checkout with Zimbabwe's favourite payment methods",
    cta: { label: "Start Shopping", href: "/shop" },
    bg: "from-[#E63900] via-[#FF4400] to-[#FF6A00]",
  },
];

const sidePromos = [
  {
    id: "promo-1",
    label: "HOT DEALS",
    headline: "Up to 30% Off\nDaily Necessities",
    href: "/shop/daily-necessities",
    bg: "from-[#FF4400] to-[#E63900]",
  },
  {
    id: "promo-2",
    label: "PAY YOUR WAY",
    headline: "EcoCash &\nInnBucks",
    href: "/checkout",
    bg: "from-[#FF6A00] to-[#FF4400]",
  },
];

const fallbackCategories: Category[] = [
  { id: "kitchenware",          name: "Kitchenware",          slug: "kitchenware",          icon: "🍳" },
  { id: "plasticware",          name: "Plasticware",          slug: "plasticware",          icon: "🥤" },
  { id: "school-stationery",    name: "School Stationery",    slug: "school-stationery",    icon: "✏️" },
  { id: "hardware",             name: "Hardware",             slug: "hardware",             icon: "🔧" },
  { id: "baby-necessities",     name: "Baby Necessities",     slug: "baby-necessities",     icon: "👶" },
  { id: "electric-gadgets",     name: "Electric Gadgets",     slug: "electric-gadgets",     icon: "⚡" },
  { id: "daily-necessities",    name: "Daily Necessities",    slug: "daily-necessities",    icon: "🛒" },
  { id: "careerday-uniforms",   name: "Careerday Uniforms",   slug: "careerday-uniforms",   icon: "👔" },
  { id: "birthday-party-items", name: "Birthday Party Items", slug: "birthday-party-items", icon: "🎂" },
  { id: "swimming-items",       name: "Swimming Items",       slug: "swimming-items",       icon: "🏊" },
  { id: "bicycles",             name: "Bicycles",             slug: "bicycles",             icon: "🚲" },
  { id: "home-improvement",     name: "Home Improvement",     slug: "home-improvement",     icon: "🏠" },
  { id: "toys",                 name: "Toys",                 slug: "toys",                 icon: "🪀" },
];

export function HeroSection({ categories = [] }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % mainSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + mainSlides.length) % mainSlides.length);
  const next = () => setCurrent((c) => (c + 1) % mainSlides.length);
  const slide = mainSlides[current];

  const sidebarCats = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-2">

      {/* ── Left: Category sidebar ── */}
      <aside className="hidden lg:flex flex-col bg-white rounded-xl overflow-hidden shadow-sm h-85 sm:h-95 lg:h-105">
        <nav className="flex flex-col flex-1 divide-y divide-gray-50 py-1 overflow-y-auto">
          {sidebarCats.slice(0, 10).map((cat) => {
            const Icon = slugIconMap[cat.slug] ?? ShoppingBasket;
            return (
              <Link
                key={cat.id}
                href={`/shop/${cat.slug}`}
                className="group flex items-center gap-2.5 px-3 py-2.5 hover:bg-(--color-primary-light) transition-colors duration-150"
              >
                <span className="w-5 h-5 flex items-center justify-center shrink-0 text-(--color-text-muted) group-hover:text-(--color-primary) transition-colors duration-150">
                  <Icon size={14} />
                </span>
                <span className="flex-1 text-xs font-medium text-(--color-text-primary) group-hover:text-(--color-primary) leading-tight line-clamp-1">
                  {cat.name}
                </span>
                <ChevronRight
                  size={12}
                  className="shrink-0 text-(--color-primary) opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            );
          })}
          <Link
            href="/shop"
            className="group flex items-center gap-2.5 px-3 py-2.5 hover:bg-(--color-primary-light) transition-colors duration-150 mt-auto"
          >
            <span className="w-5 h-5 flex items-center justify-center shrink-0 text-(--color-primary)">
              <LayoutGrid size={14} />
            </span>
            <span className="flex-1 text-xs font-bold text-(--color-primary)">All Categories</span>
            <ChevronRight size={12} className="shrink-0 text-(--color-primary)" />
          </Link>
        </nav>
      </aside>

      {/* ── Middle: Main carousel ── */}
      <div
        className={`relative bg-linear-to-br ${slide.bg} text-white rounded-xl overflow-hidden transition-colors duration-500 h-85 sm:h-95 lg:h-105 flex items-center`}
      >
        <div className="px-8 max-w-sm w-full">
          <span className={`inline-block ${slide.tagBg} text-white text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide`}>
            {slide.tag}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-3 whitespace-pre-line">
            {slide.headline}
          </h1>
          <p className="text-white/80 text-sm sm:text-base mb-7">{slide.sub}</p>
          <Link
            href={slide.cta.href}
            className="inline-flex items-center gap-2 bg-white text-(--color-primary) hover:bg-white/90 font-black px-6 py-2.5 rounded-full transition-colors duration-150 text-sm"
          >
            {slide.cta.label} →
          </Link>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {mainSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-150 ${
                i === current ? "bg-white w-5" : "bg-white/40 w-1.5"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors duration-150"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors duration-150"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Right: Side promo cards ── */}
      <div className="hidden lg:flex flex-col gap-2 h-85 sm:h-95 lg:h-105">
        {sidePromos.map((promo) => (
          <Link
            key={promo.id}
            href={promo.href}
            className={`flex-1 bg-linear-to-br ${promo.bg} rounded-xl p-5 flex flex-col justify-end text-white hover:opacity-90 transition-opacity duration-150`}
          >
            <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase mb-1">
              {promo.label}
            </span>
            <span className="font-black text-lg leading-snug whitespace-pre-line">
              {promo.headline}
            </span>
            <span className="text-xs text-white/80 mt-2 font-semibold">Shop Now →</span>
          </Link>
        ))}
      </div>

    </div>
  );
}
