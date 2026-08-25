"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, Heart, User } from "lucide-react";
import { useCartCount } from "@/components/store/CartCountContext";

interface BottomNavProps {
  isAuthenticated?: boolean;
}

export function BottomNav({ isAuthenticated = false }: BottomNavProps) {
  const pathname = usePathname();
  const { cartCount, wishlistCount } = useCartCount();

  const tabs = [
    { href: "/",                    label: "Home",       icon: Home,         highlight: false, badge: 0 },
    { href: "/categories",          label: "Categories", icon: LayoutGrid,   highlight: false, badge: 0 },
    { href: "/cart",                label: "Cart",       icon: ShoppingCart, highlight: true,  badge: cartCount },
    { href: "/account/wishlist",    label: "Wishlist",   icon: Heart,        highlight: false, badge: wishlistCount },
    {
      href:  isAuthenticated ? "/account" : "/login",
      label: isAuthenticated ? "Profile"  : "Sign In",
      icon:  User,
      highlight: false,
      badge: 0,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      aria-label="Bottom navigation"
    >
      {/* liquid-glass shell */}
      <div className="mx-3 mb-3 rounded-2xl backdrop-blur-2xl backdrop-saturate-150 bg-white/60 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="flex items-center justify-around h-16 px-1">
          {tabs.map(({ href, label, icon: Icon, highlight, badge }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(href + "/");

            if (highlight) {
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={`${label}${badge > 0 ? `, ${badge} items` : ""}`}
                  className="flex flex-col items-center justify-center flex-1 h-full relative -translate-y-4"
                >
                  <span className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors duration-150 ${
                    isActive ? "bg-(--color-primary-dark)" : "bg-(--color-primary)"
                  }`}>
                    <ShoppingCart size={22} className="text-white" />
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-(--color-danger) text-white text-[9px] font-black min-w-4 h-4 rounded-full flex items-center justify-center px-1 leading-none">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </span>
                  <span className={`text-[10px] mt-0.5 font-medium ${
                    isActive ? "text-(--color-primary)" : "text-(--color-text-muted)"
                  }`}>
                    {label}
                  </span>
                </Link>
              );
            }

            const isWishlist = href === "/account/wishlist";

            return (
              <Link
                key={href}
                href={href}
                aria-label={`${label}${badge > 0 ? `, ${badge} items` : ""}`}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative"
              >
                <div className="relative">
                  <Icon
                    size={22}
                    fill={isWishlist && badge > 0 ? "currentColor" : "none"}
                    className={`transition-colors duration-150 ${
                      isActive
                        ? "text-(--color-primary)"
                        : isWishlist && badge > 0
                        ? "text-(--color-danger)"
                        : "text-(--color-text-muted)"
                    }`}
                  />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-(--color-danger) text-white text-[9px] font-black min-w-4 h-4 rounded-full flex items-center justify-center px-1 leading-none">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-(--color-primary)"
                    : isWishlist && badge > 0
                    ? "text-(--color-danger)"
                    : "text-(--color-text-muted)"
                }`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
