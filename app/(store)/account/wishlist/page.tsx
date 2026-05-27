import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/store/ProductGrid";
import Link from "next/link";

export const metadata: Metadata = { title: "My Wishlist" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/wishlist");

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  const products = wishlistItems.map((w) => w.product);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account" className="text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors">← Account</Link>
        <h1 className="font-display text-2xl font-bold">Wishlist ({products.length})</h1>
      </div>
      <ProductGrid
        products={products as Parameters<typeof ProductGrid>[0]["products"]}
        wishlistIds={products.map((p) => p.id)}
        emptyMessage="Your wishlist is empty. Browse our shop and add items you love!"
      />
    </div>
  );
}
