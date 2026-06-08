import { prisma } from "@/lib/prisma";

/** WhatsApp carts are tracked by phone number rather than a browser cookie — see CartItem.sessionId. */
const cartSessionId = (phone: string) => `wa:${phone}`;

export async function getBotCartItems(phone: string) {
  return prisma.cartItem.findMany({
    where: { sessionId: cartSessionId(phone) },
    include: { product: { include: { category: true } }, variant: true },
    orderBy: { createdAt: "asc" },
  });
}

export type BotCartResult = { success: boolean; error?: string };

export async function addToBotCart(phone: string, productId: string, quantity: number): Promise<BotCartResult> {
  const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } });
  if (!product) return { success: false, error: "Product not found" };

  const sessionId = cartSessionId(phone);
  const existing = await prisma.cartItem.findFirst({ where: { sessionId, productId, variantId: null } });
  const desiredQuantity = (existing?.quantity ?? 0) + quantity;

  if (product.stock < desiredQuantity) return { success: false, error: "Insufficient stock" };

  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: desiredQuantity } });
  } else {
    await prisma.cartItem.create({ data: { sessionId, productId, quantity } });
  }
  return { success: true };
}

export async function removeFromBotCart(phone: string, cartItemId: string): Promise<BotCartResult> {
  const sessionId = cartSessionId(phone);
  const item = await prisma.cartItem.findFirst({ where: { id: cartItemId, sessionId } });
  if (!item) return { success: false, error: "Item not in cart" };

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  return { success: true };
}

export async function clearBotCart(phone: string): Promise<void> {
  await prisma.cartItem.deleteMany({ where: { sessionId: cartSessionId(phone) } });
}

export function botCartTotal(items: Awaited<ReturnType<typeof getBotCartItems>>): number {
  return items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
}
