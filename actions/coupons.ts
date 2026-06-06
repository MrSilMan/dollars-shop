"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export type CouponValidationResult =
  | { valid: true; couponId: string; code: string; type: "PERCENTAGE" | "FIXED"; value: number; discountAmount: number }
  | { valid: false; error: string };

export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

  if (!coupon || !coupon.isActive) return { valid: false, error: "Invalid or expired coupon code" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { valid: false, error: "This coupon has expired" };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return { valid: false, error: "This coupon has reached its usage limit" };
  if (coupon.minOrder && subtotal < Number(coupon.minOrder)) {
    return { valid: false, error: `Minimum order of $${Number(coupon.minOrder).toFixed(2)} required` };
  }

  const discountAmount =
    coupon.type === "PERCENTAGE"
      ? Math.min((subtotal * Number(coupon.value)) / 100, subtotal)
      : Math.min(Number(coupon.value), subtotal);

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    discountAmount: Math.round(discountAmount * 100) / 100,
  };
}

// ─── Admin CRUD ───────────────────────────────────────────────

const CouponSchema = z.object({
  code: z.string().min(2).max(32).transform(s => s.toUpperCase().trim()),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive(),
  minOrder: z.number().min(0).nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().default(true),
});

export async function createCoupon(data: unknown) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") return { error: "Unauthorized" };

  const parsed = CouponSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  try {
    const coupon = await prisma.coupon.create({ data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    }});
    revalidatePath("/admin/coupons");
    return { coupon: { ...coupon, value: Number(coupon.value), minOrder: coupon.minOrder ? Number(coupon.minOrder) : null } };
  } catch {
    return { error: "Code already exists or database error" };
  }
}

export async function updateCoupon(id: string, data: unknown) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") return { error: "Unauthorized" };

  const parsed = CouponSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  try {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...parsed.data,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });
    revalidatePath("/admin/coupons");
    return { coupon: { ...coupon, value: Number(coupon.value), minOrder: coupon.minOrder ? Number(coupon.minOrder) : null } };
  } catch {
    return { error: "Update failed" };
  }
}

export async function deleteCoupon(id: string) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") return { error: "Unauthorized" };

  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function getAllCoupons() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") return [];
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}
