import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { WhatsAppButton } from "@/components/store/WhatsAppButton";
import { BottomNav } from "@/components/store/BottomNav";
import { auth } from "@/lib/auth";
import { getCartItems } from "@/actions/cart";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cartItems = await getCartItems();

  return (
    <>
      <Navbar cartCount={cartItems.length} userName={session?.user?.name} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton />
      <BottomNav cartCount={cartItems.length} isAuthenticated={!!session?.user} />
    </>
  );
}
