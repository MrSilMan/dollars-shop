import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { WhatsAppButton } from "@/components/store/WhatsAppButton";
import { BottomNav } from "@/components/store/BottomNav";
import { CartCountProvider } from "@/components/store/CartCountContext";
import { auth } from "@/lib/auth";
import { getCartItems } from "@/actions/cart";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/app-settings";
import { isStaff, adminLandingPage } from "@/lib/permissions";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cartItems = await getCartItems();
  const settings = await getAppSettings();

  const wishlistCount = session?.user?.id
    ? await prisma.wishlistItem.count({ where: { userId: session.user.id } })
    : 0;

  const role = (session?.user as { role?: string } | undefined)?.role ?? "";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdmin = isStaff(role) && role !== "SUPER_ADMIN";
  const adminHref = adminLandingPage(role);

  return (
    <CartCountProvider
      initialCartCount={cartItems.length}
      initialWishlistCount={wishlistCount}
    >
      <Navbar
        userName={session?.user?.name}
        isAdmin={isAdmin}
        isSuperAdmin={isSuperAdmin}
        adminHref={adminHref}
        logoUrl={settings.logoUrl ?? undefined}
      />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer footerText={settings.footerText} logoUrl={settings.logoUrl ?? undefined} />
      <WhatsAppButton />
      <BottomNav isAuthenticated={!!session?.user} />
    </CartCountProvider>
  );
}
