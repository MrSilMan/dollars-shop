import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyOrders } from "@/actions/orders";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatUSD, toNumber } from "@/lib/utils/currency";
import { Package, Heart, User, LogOut, ChevronRight, ShoppingBag, Clock } from "lucide-react";
import { SignOutButton } from "@/components/store/SignOutButton";

export const metadata: Metadata = { title: "My Account" };

const statusConfig: Record<string, { label: string; cls: string }> = {
  PENDING:    { label: "Pending",    cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  CONFIRMED:  { label: "Confirmed",  cls: "bg-blue-50 text-blue-700 border border-blue-200" },
  PROCESSING: { label: "Processing", cls: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  SHIPPED:    { label: "Shipped",    cls: "bg-cyan-50 text-cyan-700 border border-cyan-200" },
  DELIVERED:  { label: "Delivered",  cls: "bg-green-50 text-green-700 border border-green-200" },
  CANCELLED:  { label: "Cancelled",  cls: "bg-red-50 text-red-700 border border-red-200" },
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const [orders, wishlistCount, user] = await Promise.all([
    getMyOrders(),
    prisma.wishlistItem.count({ where: { userId: session.user!.id! } }),
    prisma.user.findUnique({
      where: { id: session.user!.id! },
      select: { name: true, createdAt: true },
    }),
  ]);

  const recentOrders = orders.slice(0, 3);
  const totalSpent = orders.reduce((s, o) => s + toNumber(o.total), 0);
  const initials = ((user?.name ?? session.user.email ?? "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase());

  return (
    <div className="min-h-screen bg-(--color-bg)">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Hero card ── */}
        <div className="account-hero-bg relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-14 -left-8 w-56 h-56 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 shadow-lg">
                <span className="text-2xl font-bold tracking-tight">{initials}</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">
                  {user?.name ?? "Welcome back"}
                </h1>
                <p className="text-white/60 text-sm mt-0.5">{session.user.email}</p>
                {user?.createdAt && (
                  <p className="text-white/40 text-xs mt-1">
                    Member since {new Intl.DateTimeFormat("en-ZW", { month: "short", year: "numeric" }).format(user.createdAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Sign out */}
            <SignOutButton className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-medium transition-colors shrink-0 mt-1">
              <LogOut size={14} />
              Sign Out
            </SignOutButton>
          </div>

          {/* Stats strip */}
          <div className="relative mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Orders", value: orders.length },
              { label: "Wishlist", value: wishlistCount },
              { label: "Spent", value: formatUSD(totalSpent) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-lg sm:text-xl font-bold">{value}</p>
                <p className="text-white/50 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Nav tiles ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Package,
              label: "My Orders",
              sub: `${orders.length} ${orders.length === 1 ? "order" : "orders"}`,
              href: "/account/orders",
              accent: "bg-violet-50 text-violet-600",
            },
            {
              icon: Heart,
              label: "Wishlist",
              sub: `${wishlistCount} saved item${wishlistCount !== 1 ? "s" : ""}`,
              href: "/account/wishlist",
              accent: "bg-rose-50 text-rose-500",
            },
            {
              icon: User,
              label: "Profile Settings",
              sub: "Edit your details",
              href: "/account/profile",
              accent: "bg-sky-50 text-sky-600",
            },
          ].map(({ icon: Icon, label, sub, href, accent }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center justify-between gap-4 p-5 bg-white border border-(--color-border) rounded-2xl hover:border-(--color-primary) hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-(--color-text-primary)">{label}</p>
                  <p className="text-xs text-(--color-text-muted) mt-0.5">{sub}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-(--color-text-muted) group-hover:text-(--color-primary) transition-colors shrink-0" />
            </Link>
          ))}
        </div>

        {/* ── Recent orders ── */}
        {recentOrders.length > 0 ? (
          <div className="bg-white border border-(--color-border) rounded-3xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-(--color-border)">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-(--color-primary)" />
                <h2 className="font-semibold text-sm text-(--color-text-primary)">Recent Orders</h2>
              </div>
              <Link href="/account/orders" className="text-xs font-semibold text-(--color-primary) hover:underline flex items-center gap-1">
                View all <ChevronRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-(--color-border)">
              {recentOrders.map((order) => {
                const sc = statusConfig[order.status] ?? { label: order.status, cls: "bg-gray-100 text-gray-600" };
                return (
                  <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-(--color-bg) transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-(--color-primary-light) flex items-center justify-center shrink-0">
                      <ShoppingBag size={16} className="text-(--color-primary)" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="price text-sm font-bold text-(--color-text-primary) truncate">{order.orderNumber}</p>
                      <p className="text-xs text-(--color-text-muted) mt-0.5">
                        {new Intl.DateTimeFormat("en-ZW", { dateStyle: "medium" }).format(new Date(order.createdAt))}
                        {" · "}
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${sc.cls}`}>
                      {sc.label}
                    </span>
                    <p className="price text-sm font-bold text-(--color-primary) shrink-0">
                      {formatUSD(toNumber(order.total))}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-(--color-border) rounded-3xl px-6 py-12 text-center space-y-3 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-(--color-primary-light) flex items-center justify-center mx-auto">
              <Package size={24} className="text-(--color-primary)" />
            </div>
            <p className="font-semibold text-(--color-text-primary)">No orders yet</p>
            <p className="text-sm text-(--color-text-muted)">Start shopping to see your orders here.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-2 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              <ShoppingBag size={15} />
              Browse Products
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
