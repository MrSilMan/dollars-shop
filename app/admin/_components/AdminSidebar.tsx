"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Store, ChevronRight, Layers, Tag, X } from "lucide-react";
import { signOutAction } from "@/actions/auth";

const navItems = [
  { href: "/admin",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products",  icon: Package },
  { href: "/admin/orders",   label: "Orders",    icon: ShoppingBag },
  { href: "/admin/customers",label: "Customers", icon: Users },
  { href: "/admin/coupons",  label: "Coupons",   icon: Tag },
  { href: "/admin/homepage", label: "Homepage",  icon: Layers },
];

type Props = { logoSrc?: string; isOpen?: boolean; onClose?: () => void };

export function AdminSidebar({ logoSrc = "/images/logo-1.png", isOpen = false, onClose }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className={[
        "admin-sidebar flex flex-col overflow-y-auto transition-transform duration-300",
        // Desktop: always visible, static in flow
        "md:relative md:translate-x-0",
        // Mobile: fixed drawer, slides in/out
        "max-md:fixed max-md:left-0 max-md:top-0 max-md:h-full max-md:z-40",
        isOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
      ].join(" ")}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/8 flex flex-col items-center relative">
        <button
          type="button"
          onClick={onClose}
          className="md:hidden absolute right-3 top-3 w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors"
          aria-label="Close menu"
        >
          <X size={14} />
        </button>

        <Link href="/admin" className="block" onClick={onClose}>
          <Image src={logoSrc} alt="Dollar Shop" width={190} height={72}
                 className="h-18 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-2 mt-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[10px] text-white/35 font-semibold tracking-widest uppercase">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5">
        <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest px-3 mb-3">Menu</p>
        <div className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative overflow-hidden group
                  ${isActive
                    ? "bg-white/12 text-white"
                    : "text-white/55 hover:bg-white/6 hover:text-white/85"
                  }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 bg-accent rounded-r-full" />
                )}
                <Icon
                  size={16}
                  className={`shrink-0 transition-colors ${isActive ? "text-accent" : "group-hover:text-white/80"}`}
                />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <ChevronRight size={13} className="text-white/30 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/8 space-y-0.5">
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-white/40 hover:bg-white/8 hover:text-white/80 transition-colors"
          >
            <LogOut size={15} className="shrink-0" />
            Sign Out
          </button>
        </form>
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-white/8 hover:text-white/80 transition-colors"
        >
          <Store size={15} className="shrink-0" />
          View Store
        </Link>
      </div>
    </aside>
  );
}
