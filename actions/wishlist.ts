"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type WishlistActionResult = { success: boolean; error?: string; requiresAuth?: boolean };

export async function saveForLater(cartItemId: string, productId: string): Promise<WishlistActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, requiresAuth: true };

    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      create: { userId: session.user.id, productId },
      update: {},
    });

    await prisma.cartItem.deleteMany({
      where: { id: cartItemId, userId: session.user.id },
    });

    revalidatePath("/cart");
    revalidatePath("/wishlist");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save for later" };
  }
}
