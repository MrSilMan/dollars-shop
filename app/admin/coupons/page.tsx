import type { Metadata } from "next";
import { getAllCoupons } from "@/actions/coupons";
import { CouponsManager } from "./_components/CouponsManager";

export const metadata: Metadata = { title: "Coupons — Admin | Dollar Shop" };

export default async function AdminCouponsPage() {
  const coupons = await getAllCoupons();
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-(--color-text-primary)">Coupons</h1>
        <p className="text-sm text-(--color-text-muted) mt-0.5">Create and manage promo codes</p>
      </div>
      <CouponsManager initialCoupons={coupons.map(c => ({
        ...c,
        value: Number(c.value),
        minOrder: c.minOrder ? Number(c.minOrder) : null,
        expiresAt: c.expiresAt?.toISOString() ?? null,
      }))} />
    </div>
  );
}
