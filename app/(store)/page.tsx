import type { Metadata } from "next";
import { HeroSection } from "@/components/store/HeroSection";
import { ProductGrid } from "@/components/store/ProductGrid";
import { FlashSaleTimer } from "@/components/store/FlashSaleTimer";
import { getFeaturedProducts, getFlashDeals, getAllCategories } from "@/actions/products";
import Link from "next/link";
import { ShieldCheck, Truck, MessageCircle, ShoppingBasket, LayoutGrid } from "lucide-react";
import { categoryIconMap as slugIconMap, categoryColorMap as slugColorMap } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Dollar Shop — Shop More. Save More.",
  description: "Your neighbourhood store for everyday essentials. Quality Everyday. Every Dollar Counts.",
};

export default async function HomePage() {
  const [featured, flashDeals, categories] = await Promise.all([
    getFeaturedProducts(),
    getFlashDeals(),
    getAllCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-3">

      {/* ── Hero carousel + category sidebar + promo panels ── */}
      <HeroSection categories={categories} />

      {/* ── Promo / Coupon cards ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          {
            amount: "30%", label: "OFF",
            desc: "All Groceries", sub: "Limited time",
            href: "/shop/daily-necessities",
            leftBg: "bg-(--color-danger)", rightBg: "bg-(--color-primary-light)",
          },
          {
            amount: "FREE", label: "SHIP",
            desc: "Orders Over $15", sub: "Every order",
            href: "/shop",
            leftBg: "bg-(--color-accent)", rightBg: "bg-(--color-accent-light)",
          },
          {
            amount: "NEW", label: "IN",
            desc: "Fresh Arrivals", sub: "Shop what's new",
            href: "/shop",
            leftBg: "bg-(--color-primary)", rightBg: "bg-(--color-primary-light)",
          },
          {
            amount: "⚡", label: "FLASH",
            desc: "Flash Deals Today", sub: "While stocks last",
            href: "/shop",
            leftBg: "bg-linear-to-b from-(--color-primary) to-(--color-primary-dark)", rightBg: "bg-(--color-primary-light)",
          },
        ].map((card) => (
          <Link
            key={card.desc}
            href={card.href}
            className="flex rounded-xl overflow-hidden border border-(--color-border) hover:border-(--color-primary) hover:shadow-md transition-all duration-150 bg-white group"
          >
            <div className={`${card.leftBg} w-14 sm:w-16 flex flex-col items-center justify-center text-white shrink-0 py-4 px-1`}>
              <span className="text-base sm:text-xl font-black leading-none">{card.amount}</span>
              <span className="text-[9px] font-bold tracking-wider text-white/80 mt-0.5 text-center">{card.label}</span>
            </div>
            <div className={`${card.rightBg} flex-1 px-3 py-3 flex flex-col justify-center`}>
              <p className="font-bold text-xs sm:text-sm text-(--color-text-primary) leading-tight">{card.desc}</p>
              <p className="text-[10px] text-(--color-text-muted) mt-0.5">{card.sub}</p>
              <span className="text-[10px] sm:text-xs font-bold text-(--color-primary) mt-1.5 group-hover:underline">Shop Now →</span>
            </div>
          </Link>
        ))}
      </section>

      {/* ── Category icon grid ── */}
      {categories.length > 0 && (
        <section className="bg-white rounded-xl p-4">
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1">
            {categories.slice(0, 9).map((cat) => {
              const Icon = slugIconMap[cat.slug] ?? ShoppingBasket;
              const colors = slugColorMap[cat.slug] ?? { bg: "#FFF3E0", color: "#E65100" };
              return (
                <Link
                  key={cat.id}
                  href={`/shop/${cat.slug}`}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-(--color-primary-light) transition-colors duration-150 group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-150 group-hover:scale-110 group-hover:shadow-sm ${colors.bg}`}
                  >
                    <Icon size={22} className={colors.text} />
                  </div>
                  <span className="text-[10px] sm:text-xs text-center text-(--color-text-primary) font-medium leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
            <Link
              href="/shop"
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-(--color-primary-light) transition-colors duration-150 group"
            >
              <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-(--color-primary) flex items-center justify-center transition-all duration-150 group-hover:scale-110 group-hover:bg-(--color-primary-light)">
                <LayoutGrid size={20} className="text-(--color-primary)" />
              </div>
              <span className="text-[10px] sm:text-xs text-center text-(--color-text-muted) font-medium">
                More
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* ── Flash Deals — with countdown timer ── */}
      {flashDeals.length > 0 && (
        <section className="bg-white rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-(--color-primary) to-(--color-accent)">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-black text-white flex items-center gap-2 text-sm sm:text-base">
                <span>⚡</span>
                Flash Deals
              </h2>
              <FlashSaleTimer />
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-white/90 hover:text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors duration-150 shrink-0"
            >
              View All →
            </Link>
          </div>
          <div className="p-3">
            <ProductGrid products={flashDeals as Parameters<typeof ProductGrid>[0]["products"]} />
          </div>
        </section>
      )}

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <section className="bg-white rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border)">
            <h2 className="font-black text-(--color-text-primary) flex items-center gap-2 text-sm sm:text-base">
              <span className="inline-block w-1 h-5 bg-(--color-primary) rounded-full" aria-hidden="true" />
              Featured Products
            </h2>
            <Link
              href="/shop"
              className="text-xs font-bold text-(--color-primary) hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="p-3">
            <ProductGrid products={featured as Parameters<typeof ProductGrid>[0]["products"]} />
          </div>
        </section>
      )}

      {/* ── Trust bar ── */}
      <section className="bg-white rounded-2xl shadow-sm border border-(--color-border) overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-(--color-border)">
          {[
            { icon: ShieldCheck, title: "Secure Checkout", desc: "EcoCash & InnBucks" },
            { icon: Truck, title: "Fast Delivery", desc: "Free over $15" },
            { icon: MessageCircle, title: "WhatsApp Support", desc: "+263 77 256 6468" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-2 px-3 py-5 text-center">
              <div className="w-12 h-12 bg-(--color-primary-light) rounded-xl flex items-center justify-center">
                <Icon size={22} className="text-(--color-primary)" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm leading-tight">{title}</p>
                <p className="text-[10px] sm:text-xs text-(--color-text-muted) mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
