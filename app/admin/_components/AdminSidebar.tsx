"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Store, ChevronRight, Layers, Tag, X, UserCog, ClipboardList, Mail, UserCircle } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { canAccess, ROLE_LABELS } from "@/lib/permissions";

const navItems = [
  { href: "/admin",          label: "Dashboard", icon: LayoutDashboard, section: "dashboard"  as const },
  { href: "/admin/products", label: "Products",  icon: Package,         section: "products"   as const },
  { href: "/admin/orders",   label: "Orders",    icon: ShoppingBag,     section: "orders"     as const },
  { href: "/admin/customers",label: "Customers", icon: Users,           section: "customers"  as const },
  { href: "/admin/coupons",  label: "Coupons",   icon: Tag,             section: "coupons"    as const },
  { href: "/admin/newsletter",label: "Newsletter",icon: Mail,           section: "newsletter" as const },
  { href: "/admin/staff",    label: "Team",      icon: UserCog,         section: "staff"      as const },
  { href: "/admin/homepage", label: "Homepage",  icon: Layers,          section: "homepage"   as const },
  { href: "/admin/audit",    label: "Audit Log", icon: ClipboardList,   section: "audit"      as const },
];

type Props = { logoSrc?: string; role?: string; isOpen?: boolean; onClose?: () => void };

export function AdminSidebar({ logoSrc = "/images/logo-1.png", role = "", isOpen = false, onClose }: Props) {
  const pathname = usePathname();
  const visible = navItems.filter(item => canAccess(item.section, role));
  const roleLabel = ROLE_LABELS[role] ?? "Staff";

  return (
    <aside
      className={[
        "admin-sidebar flex flex-col overflow-y-auto transition-transform duration-300",
        "md:relative md:translate-x-0",
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
          <p className="text-[10px] text-white/35 font-semibold tracking-widest uppercase">{roleLabel}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5">
        <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest px-3 mb-3">Menu</p>
        <div className="space-y-0.5">
          {visible.map(({ href, label, icon: Icon }) => {
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
        <Link
          href="/admin/account"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-white/8 hover:text-white/80 transition-colors"
        >
          <UserCircle size={15} className="shrink-0" />
          My Account
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-white/40 hover:bg-white/8 hover:text-white/80 transition-colors"
          >
            <LogOut size={15} className="shrink-0" />
            Sign Out
          </button>
        </form>
        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-white/8 hover:text-white/80 transition-colors"
        >
          <Store size={15} className="shrink-0" />
          View Store
        </a>
      </div>
    </aside>
  );
}
