import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCartItems } from "@/actions/cart";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { toNumber } from "@/lib/utils/currency";
import { getBlurMapForProducts } from "@/lib/images";
import { getAppSettings } from "@/lib/app-settings";
import { calculateDeliveryFee } from "@/lib/delivery";
import { isInnBucksEnabled } from "@/lib/payments/providers";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [session, cartItems] = await Promise.all([auth(), getCartItems()]);
  if (!session) redirect("/login?callbackUrl=/checkout");
  if (cartItems.length === 0) redirect("/cart");

  const userPhone = session?.user?.id
    ? (await prisma.user.findUnique({ where: { id: session.user.id }, select: { phone: true } }))?.phone ?? undefined
    : undefined;

  const subtotal = cartItems.reduce((s, i) => s + toNumber(i.product.price) * i.quantity, 0);
  const deliveryFee = calculateDeliveryFee(subtotal);
  const [blurMap, settings] = await Promise.all([
    getBlurMapForProducts(cartItems.map((i) => i.product)),
    getAppSettings(),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl font-bold mb-8">Checkout</h1>
      <CheckoutForm
        cartItems={cartItems.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          product: { name: i.product.name, price: toNumber(i.product.price), images: i.product.images },
        }))}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        defaultEmail={session?.user?.email ?? undefined}
        defaultName={session?.user?.name ?? undefined}
        defaultPhone={userPhone}
        blurMap={blurMap}
        zwgRate={settings.zwgRate}
        innBucksEnabled={isInnBucksEnabled()}
      />
    </div>
  );
}
