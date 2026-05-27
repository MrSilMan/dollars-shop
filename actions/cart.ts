"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export type ActionResult = { success: boolean; error?: string };

async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sid = cookieStore.get("cart_session")?.value;
  if (!sid) {
    sid = randomUUID();
    cookieStore.set("cart_session", sid, { maxAge: 60 * 60 * 24 * 7, httpOnly: true, sameSite: "lax" });
  }
  return sid;
}

export async function addToCart(productId: string, quantity: number, variantId?: string): Promise<ActionResult> {
  try {
    const session = await auth();

    // Determine available stock from variant or product
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) return { success: false, error: "Variant not found" };
      if (variant.stock < quantity) return { success: false, error: "Insufficient stock" };
    } else {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product || !product.isActive) return { success: false, error: "Product not found" };
      if (product.stock < quantity) return { success: false, error: "Insufficient stock" };
    }

    if (session?.user?.id) {
      const existing = await prisma.cartItem.findFirst({
        where: { userId: session.user.id, productId, variantId: variantId ?? null },
      });
      if (existing) {
        await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
      } else {
        await prisma.cartItem.create({ data: { userId: session.user.id, productId, variantId: variantId ?? null, quantity } });
      }
    } else {
      const sessionId = await getSessionId();
      const existing = await prisma.cartItem.findFirst({ where: { sessionId, productId, variantId: variantId ?? null } });
      if (existing) {
        await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
      } else {
        await prisma.cartItem.create({ data: { sessionId, productId, variantId: variantId ?? null, quantity } });
      }
    }

    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to add to cart" };
  }
}

export async function updateCartQuantity(cartItemId: string, quantity: number): Promise<ActionResult> {
  try {
    const session = await auth();
    const sessionId = session?.user?.id ? undefined : await getSessionId();

    const item = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        ...(session?.user?.id
          ? { userId: session.user.id }
          : { sessionId }),
      },
      include: { product: true },
    });
    if (!item) return { success: false, error: "Cart item not found" };
    if (quantity > item.product.stock) return { success: false, error: "Insufficient stock" };

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
    } else {
      await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update cart" };
  }
}

export async function removeFromCart(cartItemId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    const sessionId = session?.user?.id ? undefined : await getSessionId();

    const deleted = await prisma.cartItem.deleteMany({
      where: {
        id: cartItemId,
        ...(session?.user?.id
          ? { userId: session.user.id }
          : { sessionId }),
      },
    });
    if (deleted.count === 0) return { success: false, error: "Cart item not found" };

    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to remove item" };
  }
}

export async function clearCart(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user?.id) {
      await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });
    } else {
      const sessionId = await getSessionId();
      await prisma.cartItem.deleteMany({ where: { sessionId } });
    }
    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to clear cart" };
  }
}

export async function mergeGuestCart(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("cart_session")?.value;
  if (!sessionId) return;

  const guestItems = await prisma.cartItem.findMany({ where: { sessionId } });
  if (guestItems.length === 0) return;

  for (const guestItem of guestItems) {
    const existing = await prisma.cartItem.findFirst({
      where: { userId: session.user.id, productId: guestItem.productId },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + guestItem.quantity },
      });
      await prisma.cartItem.delete({ where: { id: guestItem.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: guestItem.id },
        data: { userId: session.user.id, sessionId: null },
      });
    }
  }

  cookieStore.delete("cart_session");
  revalidatePath("/cart");
}

export async function getCartItems() {
  const include = { product: { include: { category: true } }, variant: true } as const;
  const session = await auth();
  if (session?.user?.id) {
    return prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include,
      orderBy: { createdAt: "asc" },
    });
  }
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("cart_session")?.value;
  if (!sessionId) return [];
  return prisma.cartItem.findMany({
    where: { sessionId },
    include,
    orderBy: { createdAt: "asc" },
  });
}
