"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, User, Menu, X, Search } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  cartCount?: number;
  userName?: string | null;
}

const categoryLinks = [
  { href: "/shop",                      label: "All Products" },
  { href: "/shop/school-stationery",    label: "School Stationery" },
  { href: "/shop/hardware",             label: "Hardware" },
  { href: "/shop/baby-necessities",     label: "Baby Necessities" },
  { href: "/shop/electric-gadgets",     label: "Electric Gadgets" },
  { href: "/shop/daily-necessities",    label: "Daily Necessities" },
  { href: "/shop/careerday-uniforms",   label: "Careerday Uniforms" },
  { href: "/shop/birthday-party-items", label: "Birthday Party Items" },
  { href: "/shop/swimming-items",       label: "Swimming Items" },
  { href: "/shop/bicycles",             label: "Bicycles" },
  { href: "/shop/home-improvement",     label: "Home Improvement" },
  { href: "/shop/toys",                 label: "Toys" },
  { href: "/shop/kitchenware",          label: "Kitchenware" },
  { href: "/shop/plasticware",          label: "Plasticware" },
];

export function Navbar({ cartCount = 0, userName }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-linear-to-b from-[#FFD8CC] to-white">
      {/* ── Main header bar ── */}
      <div className="border-b border-border/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/logo-1.png"
              alt="Dollar Shop"
              width={180}
              height={70}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search bar — pill shape, gray fill */}
          <form action="/search" className="flex-1 flex items-center min-w-0">
            <div className="flex w-full rounded-full overflow-hidden border border-(--color-border) bg-(--color-surface-alt) max-w-2xl focus-within:border-(--color-primary) transition-colors duration-150">
              <input
                name="q"
                type="search"
                placeholder="Search for products, brands & more…"
                className="flex-1 bg-transparent text-sm px-5 py-2.5 outline-none text-(--color-text-primary) placeholder:text-(--color-text-muted) min-w-0"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="bg-(--color-primary) hover:bg-(--color-primary-dark) active:bg-(--color-primary-dark) m-0.5 px-5 text-white font-bold text-sm flex items-center gap-1.5 transition-colors duration-150 shrink-0 rounded-full"
                aria-label="Search"
              >
                <Search size={16} />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </form>

          {/* Icon actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            {userName ? (
              <Link
                href="/account"
                className="flex flex-col items-center gap-0.5 px-2 py-1 text-(--color-text-muted) hover:text-(--color-primary) transition-colors duration-150 rounded"
                aria-label="My Account"
              >
                <User size={20} />
                <span className="text-[10px] hidden sm:block leading-none">Account</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex flex-col items-center gap-0.5 px-2 py-1 text-(--color-text-muted) hover:text-(--color-primary) transition-colors duration-150 rounded"
              >
                <User size={20} />
                <span className="text-[10px] hidden sm:block leading-none">Sign In</span>
              </Link>
            )}

            <Link
              href="/account/wishlist"
              className="flex flex-col items-center gap-0.5 px-2 py-1 text-(--color-text-muted) hover:text-(--color-primary) transition-colors duration-150 rounded"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              <span className="text-[10px] hidden sm:block leading-none">Wishlist</span>
            </Link>

            <Link
              href="/cart"
              className="relative flex flex-col items-center gap-0.5 px-2 py-1 text-(--color-text-muted) hover:text-(--color-primary) transition-colors duration-150 rounded"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingCart size={20} />
              <span className="text-[10px] hidden sm:block leading-none">Cart</span>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0 bg-(--color-danger) text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden px-2 py-1 text-(--color-text-muted) hover:text-(--color-primary) transition-colors duration-150"
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
              aria-label="Toggle menu"
              aria-expanded={menuOpen ? "true" : "false"}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>


{/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-(--color-border) px-4 py-4 flex flex-col gap-1 shadow-lg">
          <form
            action="/search"
            className="flex items-center rounded-full overflow-hidden border border-(--color-border) bg-(--color-surface-alt) mb-2"
          >
            <input
              name="q"
              type="search"
              placeholder="Search products…"
              className="flex-1 text-sm px-4 py-2 outline-none bg-transparent"
              aria-label="Search products"
            />
            <button
              type="submit"
              aria-label="Search"
              className="bg-(--color-primary) hover:bg-(--color-primary-dark) m-0.5 px-4 py-2 text-white shrink-0 rounded-full transition-colors duration-150"
            >
              <Search size={16} />
            </button>
          </form>

          {categoryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium py-2.5 px-1 text-(--color-text-primary) hover:text-(--color-primary) border-b border-(--color-border) last:border-0 transition-colors duration-150"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {!userName && (
            <Link
              href="/login"
              className="mt-2 text-sm font-bold text-(--color-primary)"
              onClick={() => setMenuOpen(false)}
            >
              Sign In / Register →
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
