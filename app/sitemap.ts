import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dollarshop.co.zw";

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), priority: 0.9 },
    ...categories.map((c) => ({ url: `${baseUrl}/shop/${c.slug}`, priority: 0.8 as const })),
    ...products.map((p) => ({ url: `${baseUrl}/product/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 as const })),
  ];
}
