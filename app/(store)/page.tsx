import type { Metadata } from "next";
import { HeroSection } from "@/components/store/HeroSection";
import { ProductGrid } from "@/components/store/ProductGrid";
import { FlashSaleTimer } from "@/components/store/FlashSaleTimer";
import { HomePagination } from "@/components/store/HomePagination";
import {
  getFeaturedProducts,
  getFlashDeals,
  getAllCategories,
  getNewArrivals,
  getAllProductsPaginated,
} from "@/actions/products";
import { getActiveHeroSlides, getActiveSidePromos, getActivePromoCards } from "@/actions/homepage";
import { getBlurMapForProducts } from "@/lib/images";
import { FREE_DELIVERY_THRESHOLD_USD } from "@/lib/delivery";
import { paymentMethodsSummary } from "@/lib/payments/providers";
import Link from "next/link";
import { ShieldCheck, Truck, MessageCircle, LayoutGrid, Package, Users, Star, Zap } from "lucide-react";
import { NewsletterSection } from "@/components/store/NewsletterSection";
import { resolveCategoryColors } from "@/lib/categories";
import { CategoryImage } from "@/components/store/CategoryImage";

export const metadata: Metadata = {
  title: "Dollar Shop — Shop More. Save More.",
  description: "Your neighbourhood store for everyday essentials. Quality Everyday. Every Dollar Counts.",
};

type PromoCardData = { id: string; amount: string; label: string; desc: string; sub: string; href: string; leftBg: string; rightBg: string };

const DEFAULT_PROMO_CARDS: PromoCardData[] = [
  { id: "d1", amount: "30%", label: "OFF", desc: "All Groceries", sub: "Limited time", href: "/shop/daily-necessities", leftBg: "bg-(--color-danger)", rightBg: "bg-(--color-primary-light)" },
  { id: "d2", amount: "FREE", label: "SHIP", desc: "Orders Over $15", sub: "Every order", href: "/shop", leftBg: "bg-(--color-accent)", rightBg: "bg-(--color-accent-light)" },
  { id: "d3", amount: "NEW", label: "IN", desc: "Fresh Arrivals", sub: "Shop what's new", href: "/shop", leftBg: "bg-(--color-primary)", rightBg: "bg-(--color-primary-light)" },
  { id: "d4", amount: "⚡", label: "FLASH", desc: "Flash Deals Today", sub: "While stocks last", href: "/shop/flash-deals", leftBg: "bg-linear-to-b from-(--color-primary) to-(--color-primary-dark)", rightBg: "bg-(--color-primary-light)" },
];

const PAGE_SIZE = 12;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(String(pageParam ?? "1"), 10) || 1);

  const [featured, flashDeals, categories, heroSlides, sidePromos, rawPromoCards, newArrivals] =
    await Promise.all([
      getFeaturedProducts(),
      getFlashDeals(),
      getAllCategories(),
      getActiveHeroSlides(),
      getActiveSidePromos(),
      getActivePromoCards(),
      getNewArrivals(8),
    ]);

  // Products already on screen in the rails above — keep Browse All from repeating them.
  const railProductIds = [...new Set([...flashDeals, ...newArrivals, ...featured].map((p) => p.id))];

  const { products: allProducts, total, storeTotal } = await getAllProductsPaginated(
    page,
    PAGE_SIZE,
    railProductIds
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const promoCards: PromoCardData[] = rawPromoCards.length > 0 ? rawPromoCards : DEFAULT_PROMO_CARDS;
  const blurMap = await getBlurMapForProducts([...featured, ...flashDeals, ...newArrivals, ...allProducts] as Parameters<typeof ProductGrid>[0]["products"]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-3">

      {/* ── Hero carousel + category sidebar + promo panels ── */}
      <HeroSection categories={categories} slides={heroSlides} sidePromos={sidePromos} paymentSummary={paymentMethodsSummary()} />

      {/* ── Promo / Coupon cards ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {promoCards.map((card) => (
          <Link
            key={card.id}
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

      {/* ── Stats bar ── */}
      <section className="bg-white rounded-xl border border-(--color-border) overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-(--color-border)">
          {[
            { icon: Package, value: `${storeTotal}+`, label: "Products" },
            { icon: Star, value: "5-Star", label: "Rated Quality" },
            { icon: Zap, value: "Flash", label: "Deals Daily" },
            { icon: Users, value: "1,000+", label: "Happy Customers" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 bg-(--color-primary-light) rounded-lg flex items-center justify-center shrink-0">
                <Icon size={18} className="text-(--color-primary)" />
              </div>
              <div>
                <p className="font-black text-sm text-(--color-primary) leading-none">{value}</p>
                <p className="text-[10px] text-(--color-text-muted) mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category icon grid ── */}
      {categories.length > 0 && (
        <section className="bg-white rounded-xl p-4">
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1">
            {categories.slice(0, 9).map((cat: typeof categories[number]) => {
              const colors = resolveCategoryColors(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/shop/${cat.slug}`}
                  className="flex flex-col items-center gap-1.5 p-1 lg:p-2 rounded-xl hover:bg-(--color-primary-light) transition-colors duration-150 group"
                >
                  <CategoryImage
                    slug={cat.slug}
                    name={cat.name}
                    image={cat.image}
                    size={72}
                    iconSize={22}
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-2xl transition-all duration-150 group-hover:scale-110 group-hover:shadow-sm ${colors.bg} ${colors.text}`}
                  />
                  <span className="text-[10px] sm:text-xs text-center text-(--color-text-primary) font-medium leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
            <Link
              href="/categories"
              className="flex flex-col items-center gap-1.5 p-1 lg:p-2 rounded-xl hover:bg-(--color-primary-light) transition-colors duration-150 group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-2xl border-2 border-dashed border-(--color-primary) flex items-center justify-center transition-all duration-150 group-hover:scale-110 group-hover:bg-(--color-primary-light)">
                <LayoutGrid size={20} className="text-(--color-primary) sm:w-6 sm:h-6" />
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
              href="/shop/flash-deals"
              className="text-xs font-bold text-white/90 hover:text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors duration-150 shrink-0"
            >
              View All →
            </Link>
          </div>
          <div className="p-3">
            <ProductGrid products={flashDeals as Parameters<typeof ProductGrid>[0]["products"]} blurMap={blurMap} />
          </div>
        </section>
      )}

      {/* ── New Arrivals ── */}
      {newArrivals.length > 0 && (
        <section className="bg-white rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border)">
            <h2 className="font-black text-(--color-text-primary) flex items-center gap-2 text-sm sm:text-base">
              <span className="inline-block w-1 h-5 bg-(--color-accent) rounded-full" aria-hidden="true" />
              New Arrivals
            </h2>
            <Link href="/shop" className="text-xs font-bold text-(--color-primary) hover:underline">
              View All →
            </Link>
          </div>
          <div className="p-3">
            <ProductGrid products={newArrivals as Parameters<typeof ProductGrid>[0]["products"]} blurMap={blurMap} />
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
            <ProductGrid products={featured as Parameters<typeof ProductGrid>[0]["products"]} blurMap={blurMap} />
          </div>
        </section>
      )}

      {/* ── Newsletter ── */}
      <NewsletterSection />

      {/* ── Browse All Products (paginated, excluding the rails above) ── */}
      {allProducts.length > 0 && (
      <section id="browse-all" className="bg-white rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border)">
          <div>
            <h2 className="font-black text-(--color-text-primary) flex items-center gap-2 text-sm sm:text-base">
              <span className="inline-block w-1 h-5 bg-(--color-primary) rounded-full" aria-hidden="true" />
              Browse All Products
            </h2>
            <p className="text-[11px] text-(--color-text-muted) mt-0.5">{storeTotal} products in store</p>
          </div>
          <Link href="/shop" className="text-xs font-bold text-(--color-primary) hover:underline">
            Full Catalogue →
          </Link>
        </div>
        <div className="p-3">
          <ProductGrid products={allProducts as Parameters<typeof ProductGrid>[0]["products"]} blurMap={blurMap} />
        </div>
        <HomePagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          anchor="browse-all"
        />
      </section>
      )}

      {/* ── Trust bar ── */}
      <section className="bg-white rounded-2xl shadow-sm border border-(--color-border) overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-(--color-border)">
          {[
            { icon: ShieldCheck, title: "Secure Checkout", desc: paymentMethodsSummary() },
            { icon: Truck, title: "Fast Delivery", desc: `Free over $${FREE_DELIVERY_THRESHOLD_USD}` },
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
