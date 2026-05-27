import type { Metadata } from "next";
import { getHeroSlides, getSidePromos, getPromoCards } from "@/actions/homepage";
import { HomepageManager } from "./_components/HomepageManager";
import { LayoutDashboard } from "lucide-react";

export const metadata: Metadata = { title: "Homepage — Admin | Dollar Shop" };

export default async function AdminHomepagePage() {
  const [slides, sidePromos, promoCards] = await Promise.all([
    getHeroSlides(),
    getSidePromos(),
    getPromoCards(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <LayoutDashboard size={16} className="text-orange-600" />
            </div>
            <h1 className="text-xl font-black text-gray-900">Homepage Editor</h1>
          </div>
          <p className="text-sm text-gray-500">Manage hero slides, side promo panels, and the 4 filter cards shown on the storefront.</p>
        </div>
      </div>

      {/* Manager */}
      <div className="bg-gray-50 rounded-2xl p-5">
        <HomepageManager slides={slides} sidePromos={sidePromos} promoCards={promoCards} />
      </div>
    </div>
  );
}
