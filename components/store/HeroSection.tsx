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

interface HeroSlide {
  id: string;
  tag: string;
  tagBg: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  ctaBg?: string;
  imageUrl: string | null;
  bgFrom: string;
  bgTo: string;
}

interface SidePromoItem {
  id: string;
  label: string;
  headline: string;
  href: string;
  imageUrl: string | null;
  bgFrom: string;
  bgTo: string;
}

interface HeroSectionProps {
  categories?: Category[];
  slides?: HeroSlide[];
  sidePromos?: SidePromoItem[];
}

const defaultSlides: HeroSlide[] = [
  {
    id: "default-1",
    tag: "⚡ Flash Deals",
    tagBg: "#ff440033",
    headline: "Everyday Essentials,\nUnbeatable Prices",
    sub: "Shop kitchenware, daily necessities & more — all under $5",
    ctaLabel: "Shop Deals",
    ctaHref: "/shop",
    ctaBg: "#FFFFFF",
    imageUrl: null,
    bgFrom: "#FF4400",
    bgTo: "#E63900",
  },
  {
    id: "default-2",
    tag: "✨ New Arrivals",
    tagBg: "#ffffff33",
    headline: "Fresh Stock\nJust Landed",
    sub: "New products added weekly across all categories",
    ctaLabel: "See New Arrivals",
    ctaHref: "/shop",
    ctaBg: "#FFFFFF",
    imageUrl: null,
    bgFrom: "#FF6A00",
    bgTo: "#FF4400",
  },
  {
    id: "default-3",
    tag: "📱 Mobile Money",
    tagBg: "#ffffff33",
    headline: "EcoCash & InnBucks\nAccepted",
    sub: "Fast, secure checkout with Zimbabwe's favourite payment methods",
    ctaLabel: "Start Shopping",
    ctaHref: "/shop",
    ctaBg: "#FFFFFF",
    imageUrl: null,
    bgFrom: "#E63900",
    bgTo: "#FF6A00",
  },
];

const defaultSidePromos: SidePromoItem[] = [
  {
    id: "promo-1",
    label: "HOT DEALS",
    headline: "Up to 30% Off\nDaily Necessities",
    href: "/shop/daily-necessities",
    imageUrl: null,
    bgFrom: "#FF4400",
    bgTo: "#E63900",
  },
  {
    id: "promo-2",
    label: "PAY YOUR WAY",
    headline: "EcoCash &\nInnBucks",
    href: "/checkout",
    imageUrl: null,
    bgFrom: "#FF6A00",
    bgTo: "#FF4400",
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

export function HeroSection({ categories = [], slides: slidesProp, sidePromos: sidePromosProp }: HeroSectionProps) {
  const slides = (slidesProp && slidesProp.length > 0) ? slidesProp : defaultSlides;
  const sidePromos = (sidePromosProp && sidePromosProp.length > 0) ? sidePromosProp : defaultSidePromos;

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const slide = slides[current];

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
        className="relative text-white rounded-xl overflow-hidden transition-colors duration-500 h-85 sm:h-95 lg:h-105 flex items-center [background:linear-gradient(135deg,var(--slide-from),var(--slide-to))]"
        style={{ "--slide-from": slide.bgFrom, "--slide-to": slide.bgTo } as React.CSSProperties}
      >
        {slide.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none select-none" />
        )}
        <div className="relative px-8 max-w-sm w-full z-10">
          <span
            className="inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide bg-(--tag-bg)"
            style={{ "--tag-bg": slide.tagBg } as React.CSSProperties}
          >
            {slide.tag}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-3 whitespace-pre-line">
            {slide.headline}
          </h1>
          <p className="text-white/80 text-sm sm:text-base mb-7">{slide.sub}</p>
          <Link
            href={slide.ctaHref}
            className="inline-flex items-center gap-2 bg-(--cta-bg) text-(--cta-fg) hover:opacity-90 font-black px-6 py-2.5 rounded-full transition-opacity duration-150 text-sm"
            style={{ "--cta-bg": slide.ctaBg ?? "#FFFFFF", "--cta-fg": slide.bgFrom } as React.CSSProperties}
          >
            {slide.ctaLabel} →
          </Link>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {slides.map((_, i) => (
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
            className="relative flex-1 rounded-xl p-5 flex flex-col justify-end text-white hover:opacity-90 transition-opacity duration-150 overflow-hidden [background:linear-gradient(135deg,var(--promo-from),var(--promo-to))]"
            style={{ "--promo-from": promo.bgFrom, "--promo-to": promo.bgTo } as React.CSSProperties}
          >
            {promo.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={promo.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none select-none" />
            )}
            <span className="relative text-[10px] font-bold tracking-widest text-white/60 uppercase mb-1">
              {promo.label}
            </span>
            <span className="relative font-black text-lg leading-snug whitespace-pre-line">
              {promo.headline}
            </span>
            <span className="relative text-xs text-white/80 mt-2 font-semibold">Shop Now →</span>
          </Link>
        ))}
      </div>

    </div>
  );
}
