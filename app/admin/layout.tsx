import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-(--color-surface-alt)">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-(--color-footer-bg) text-white flex flex-col hidden md:flex">
        <div className="p-5 border-b border-white/10">
          <Link href="/admin">
            <Image src="/images/logo-1.png" alt="Dollar Shop" width={120} height={44} className="h-10 w-auto object-contain" />
          </Link>
          <p className="text-xs text-white/40 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors">
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-colors">
              <LogOut size={18} />
              Sign Out
            </button>
          </form>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-colors mt-1">
            ← View Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-10 bg-(--color-footer-bg) text-white px-4 py-3 flex items-center justify-between">
          <Link href="/admin">
            <Image src="/images/logo-1.png" alt="Dollar Shop" width={100} height={37} className="h-9 w-auto object-contain" />
          </Link>
          <span className="text-xs text-white/50">Admin</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
