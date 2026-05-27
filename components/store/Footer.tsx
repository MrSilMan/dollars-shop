import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-(--color-footer-bg) text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <Image src="/images/logo-1.png" alt="Dollar Shop" width={100} height={86} className="h-24 w-auto object-contain mb-4 brightness-0 invert" />
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            Your neighbourhood store for everyday essentials. Quality Everyday. Every Dollar Counts.
          </p>
          <div className="flex gap-3">
            <a href="https://wa.me/263772566468" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 bg-white/20 hover:bg-(--color-primary) rounded-full flex items-center justify-center transition-colors duration-150 ring-1 ring-white/20">
              <MessageCircle size={16} />
            </a>
            <a href="https://facebook.com/dollarshopzw" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 bg-white/20 hover:bg-(--color-primary) rounded-full flex items-center justify-center transition-colors duration-150 ring-1 ring-white/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://instagram.com/dollarshopzw" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 bg-white/20 hover:bg-(--color-primary) rounded-full flex items-center justify-center transition-colors duration-150 ring-1 ring-white/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">Shop</h3>
          <ul className="space-y-2.5 text-sm text-white/70">
            {[
              { href: "/shop",                      label: "All Products" },
              { href: "/shop/school-stationery",    label: "School Stationery" },
              { href: "/shop/daily-necessities",    label: "Daily Necessities" },
              { href: "/shop/baby-necessities",     label: "Baby Necessities" },
              { href: "/shop/electric-gadgets",     label: "Electric Gadgets" },
              { href: "/shop/kitchenware",          label: "Kitchenware" },
              { href: "/shop/toys",                 label: "Toys" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-(--color-primary) transition-colors duration-150">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">Account</h3>
          <ul className="space-y-2.5 text-sm text-white/70">
            {[
              { href: "/login", label: "Sign In" },
              { href: "/register", label: "Create Account" },
              { href: "/account/orders", label: "My Orders" },
              { href: "/account/wishlist", label: "Wishlist" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-(--color-primary) transition-colors duration-150">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">Contact</h3>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex gap-2.5">
              <MapPin size={15} className="shrink-0 mt-0.5 text-white/60" />
              <span>123 Samora Machel Ave, Harare, Zimbabwe</span>
            </li>
            <li className="flex gap-2.5 items-center">
              <Phone size={15} className="shrink-0 text-white/60" />
              <a href="tel:+263772566468" className="hover:text-(--color-primary) transition-colors duration-150">+263 77 256 6468</a>
            </li>
            <li className="flex gap-2.5 items-center">
              <Mail size={15} className="shrink-0 text-white/60" />
              <a href="mailto:hello@dollarshop.co.zw" className="hover:text-(--color-primary) transition-colors duration-150">hello@dollarshop.co.zw</a>
            </li>
            <li className="flex gap-2.5">
              <Clock size={15} className="shrink-0 mt-0.5 text-white/60" />
              <span>Mon–Sat: 8AM–6PM<br />Sun: 9AM–1PM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>© {year} Softwise Investments. All rights reserved.</span>
          <span>Quality Everyday. Every Dollar Counts.</span>
        </div>
      </div>
    </footer>
  );
}
