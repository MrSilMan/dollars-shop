import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { WhatsAppButton } from "@/components/store/WhatsAppButton";
import { BottomNav } from "@/components/store/BottomNav";
import { auth } from "@/lib/auth";
import { getCartItems } from "@/actions/cart";
import { prisma } from "@/lib/prisma";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cartItems = await getCartItems();

  const wishlistCount = session?.user?.id
    ? await prisma.wishlistItem.count({ where: { userId: session.user.id } })
    : 0;

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  return (
    <>
      <Navbar cartCount={cartItems.length} wishlistCount={wishlistCount} userName={session?.user?.name} isAdmin={isAdmin} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton />
      <BottomNav cartCount={cartItems.length} isAuthenticated={!!session?.user} />
    </>
  );
}
