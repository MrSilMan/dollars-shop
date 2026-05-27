"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, MessageCircle, User } from "lucide-react";

const staticTabs = [
  { href: "/",     label: "Home",       icon: Home,          highlight: false },
  { href: "/shop", label: "Categories", icon: LayoutGrid,    highlight: false },
  { href: "/cart", label: "Cart",       icon: ShoppingCart,  highlight: true  },
  { href: "/account/messages", label: "Messages", icon: MessageCircle, highlight: false },
] as const;

interface BottomNavProps {
  cartCount?: number;
  isAuthenticated?: boolean;
}

export function BottomNav({ cartCount = 0, isAuthenticated = false }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-(--color-border)"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {[...staticTabs, {
          href: isAuthenticated ? "/account" : "/login",
          label: isAuthenticated ? "Profile" : "Sign In",
          icon: User,
          highlight: false,
        }].map(({ href, label, icon: Icon, highlight }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");

          if (highlight) {
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className="flex flex-col items-center justify-center flex-1 h-full relative"
              >
                <span className={`relative w-13 h-13 rounded-full flex items-center justify-center shadow-md transition-colors duration-150 ${
                  isActive ? "bg-(--color-primary-dark)" : "bg-(--color-primary)"
                }`}>
                  <ShoppingCart size={22} className="text-white" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-(--color-danger) text-white text-[9px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 leading-none">
                      {cartCount > 9 ? "9+" : cartCount}
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

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
            >
              <Icon
                size={22}
                className={`transition-colors duration-150 ${
                  isActive ? "text-(--color-primary)" : "text-(--color-text-muted)"
                }`}
              />
              <span className={`text-[10px] font-medium transition-colors duration-150 ${
                isActive ? "text-(--color-primary)" : "text-(--color-text-muted)"
              }`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
