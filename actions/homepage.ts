"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!session || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) throw new Error("Unauthorized");
}

// ─── Hero Slides ────────────────────────────────────────────────────────────

const HeroSlideSchema = z.object({
  tag: z.string().default(""),
  tagBg: z.string().min(1),
  headline: z.string().default(""),
  sub: z.string().default(""),
  ctaLabel: z.string().default(""),
  ctaHref: z.string().default(""),
  ctaBg: z.string().min(1).default("#FFFFFF"),
  imageUrl: z.string().optional().nullable(),
  bgFrom: z.string().min(1),
  bgTo: z.string().min(1),
  bgNone: z.boolean().default(false),
  ctaNone: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
}).refine(
  (d) => d.imageUrl || (d.tag.length > 0 && d.headline.length > 0 && d.sub.length > 0 && d.ctaLabel.length > 0 && d.ctaHref.length > 0),
  { message: "Tag, headline, subtitle, and CTA are required when no background image is set." }
);

export async function getHeroSlides() {
  return prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getActiveHeroSlides() {
  return prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createHeroSlide(data: z.infer<typeof HeroSlideSchema>) {
  await requireAdmin();
  const parsed = HeroSlideSchema.parse(data);
  const slide = await prisma.heroSlide.create({ data: parsed });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return slide;
}

export async function updateHeroSlide(id: string, data: Partial<z.infer<typeof HeroSlideSchema>>) {
  await requireAdmin();
  const slide = await prisma.heroSlide.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return slide;
}

export async function deleteHeroSlide(id: string) {
  await requireAdmin();
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function reorderHeroSlides(ids: string[]) {
  await requireAdmin();
  await Promise.all(ids.map((id, sortOrder) => prisma.heroSlide.update({ where: { id }, data: { sortOrder } })));
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

// ─── Side Promos ────────────────────────────────────────────────────────────

const SidePromoSchema = z.object({
  label: z.string().min(1),
  headline: z.string().min(1),
  href: z.string().min(1),
  imageUrl: z.string().optional().nullable(),
  bgFrom: z.string().min(1),
  bgTo: z.string().min(1),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function getSidePromos() {
  return prisma.sidePromo.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getActiveSidePromos() {
  return prisma.sidePromo.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createSidePromo(data: z.infer<typeof SidePromoSchema>) {
  await requireAdmin();
  const parsed = SidePromoSchema.parse(data);
  const promo = await prisma.sidePromo.create({ data: parsed });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return promo;
}

export async function updateSidePromo(id: string, data: Partial<z.infer<typeof SidePromoSchema>>) {
  await requireAdmin();
  const promo = await prisma.sidePromo.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return promo;
}

export async function deleteSidePromo(id: string) {
  await requireAdmin();
  await prisma.sidePromo.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

// ─── Promo Cards ────────────────────────────────────────────────────────────

const PromoCardSchema = z.object({
  amount: z.string().min(1),
  label: z.string().min(1),
  desc: z.string().min(1),
  sub: z.string().min(1),
  href: z.string().min(1),
  leftBg: z.string().min(1),
  rightBg: z.string().min(1),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function getPromoCards() {
  return prisma.promoCard.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getActivePromoCards() {
  return prisma.promoCard.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createPromoCard(data: z.infer<typeof PromoCardSchema>) {
  await requireAdmin();
  const parsed = PromoCardSchema.parse(data);
  const card = await prisma.promoCard.create({ data: parsed });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return card;
}

export async function updatePromoCard(id: string, data: Partial<z.infer<typeof PromoCardSchema>>) {
  await requireAdmin();
  const card = await prisma.promoCard.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return card;
}

export async function deletePromoCard(id: string) {
  await requireAdmin();
  await prisma.promoCard.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}
