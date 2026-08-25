"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { CategoryImage } from "@/components/store/CategoryImage";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  image?: string | null;
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
  bgNone?: boolean;
  ctaNone?: boolean;
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
  /**
   * Accepted payment methods, resolved on the server — the fallback copy below
   * must not advertise a provider checkout is not currently offering.
   */
  paymentSummary?: string;
}

const buildDefaultSlides = (paymentSummary: string): HeroSlide[] => [
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
    headline: `${paymentSummary}\nAccepted`,
    sub: "Fast, secure checkout with Zimbabwe's favourite payment methods",
    ctaLabel: "Start Shopping",
    ctaHref: "/shop",
    ctaBg: "#FFFFFF",
    imageUrl: null,
    bgFrom: "#E63900",
    bgTo: "#FF6A00",
  },
];

const buildDefaultSidePromos = (paymentSummary: string): SidePromoItem[] => [
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
    headline: paymentSummary.replace(" & ", " &\n"),
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

export function HeroSection({
  categories = [],
  slides: slidesProp,
  sidePromos: sidePromosProp,
  paymentSummary = "EcoCash & Cash",
}: HeroSectionProps) {
  const slides = (slidesProp && slidesProp.length > 0) ? slidesProp : buildDefaultSlides(paymentSummary);
  const sidePromos = (sidePromosProp && sidePromosProp.length > 0) ? sidePromosProp : buildDefaultSidePromos(paymentSummary);

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

  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
  };

  const sidebarCats = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-2">

      {/* ── Left: Category sidebar ── */}
      <aside className="hidden lg:flex flex-col bg-white rounded-xl overflow-hidden shadow-sm h-85 sm:h-95 lg:h-105">
        <nav className="flex flex-col flex-1 divide-y divide-gray-50 py-1 overflow-y-auto">
          {sidebarCats.slice(0, 10).map((cat) => {
            return (
              <Link
                key={cat.id}
                href={`/shop/${cat.slug}`}
                className="group flex items-center gap-2.5 px-3 py-2.5 hover:bg-(--color-primary-light) transition-colors duration-150"
              >
                <CategoryImage
                  slug={cat.slug}
                  name={cat.name}
                  image={cat.image}
                  size={20}
                  iconSize={14}
                  className="w-5 h-5 rounded-md text-(--color-text-muted) group-hover:text-(--color-primary) transition-colors duration-150"
                />
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
            href="/categories"
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
        className="relative text-white rounded-xl overflow-hidden transition-colors duration-500 h-85 sm:h-95 lg:h-105 flex items-center"
        style={slide.bgNone
          ? { background: "transparent" }
          : { background: `linear-gradient(135deg, ${slide.bgFrom}, ${slide.bgTo})` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slide.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.imageUrl} alt="" className={`absolute inset-0 w-full h-full pointer-events-none select-none ${slide.bgNone ? "opacity-100 object-contain" : "opacity-40 object-cover"}`} />
        )}
        {(slide.tag || slide.headline || slide.sub || (!slide.ctaNone && slide.ctaLabel)) && (
          <div className="relative px-8 max-w-sm w-full z-10">
            {slide.tag && (
              <span
                className="inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide bg-(--tag-bg)"
                style={{ "--tag-bg": slide.tagBg } as React.CSSProperties}
              >
                {slide.tag}
              </span>
            )}
            {slide.headline && (
              <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-3 whitespace-pre-line">
                {slide.headline}
              </h1>
            )}
            {slide.sub && (
              <p className="text-white/80 text-sm sm:text-base mb-7">{slide.sub}</p>
            )}
            {!slide.ctaNone && slide.ctaLabel && slide.ctaHref && (
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-2 bg-(--cta-bg) text-(--cta-fg) hover:opacity-90 font-black px-6 py-2.5 rounded-full transition-opacity duration-150 text-sm"
                style={{ "--cta-bg": slide.ctaBg ?? "#FFFFFF", "--cta-fg": slide.bgFrom } as React.CSSProperties}
              >
                {slide.ctaLabel} →
              </Link>
            )}
          </div>
        )}

        {/* Slide dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
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
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 active:bg-black/60 flex items-center justify-center transition-colors duration-150 touch-manipulation"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 active:bg-black/60 flex items-center justify-center transition-colors duration-150 touch-manipulation"
        >
          <ChevronRight size={20} />
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
