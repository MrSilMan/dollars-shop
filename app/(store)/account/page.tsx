import type { Metadata } from "next";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyOrders } from "@/actions/orders";
import Link from "next/link";
import { formatUSD, toNumber } from "@/lib/utils/currency";
import { Package, Heart, User, LogOut } from "lucide-react";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const orders = await getMyOrders();
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">My Account</h1>
          <p className="text-(--color-text-muted) text-sm mt-1">{session.user.email}</p>
        </div>
        <form action={handleSignOut}>
          <button type="submit" className="flex items-center gap-2 text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors">
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Package, label: "My Orders", href: "/account/orders", count: orders.length },
          { icon: Heart, label: "Wishlist", href: "/account/wishlist" },
          { icon: User, label: "Profile Settings", href: "/account/profile" },
        ].map(({ icon: Icon, label, href, count }) => (
          <Link key={href} href={href} className="flex items-center gap-4 p-5 bg-white border border-(--color-border) rounded-2xl hover:border-(--color-primary) hover:shadow-sm transition-all">
            <div className="w-10 h-10 bg-(--color-primary-light) rounded-xl flex items-center justify-center">
              <Icon size={20} className="text-(--color-primary)" />
            </div>
            <div>
              <p className="font-semibold text-sm">{label}</p>
              {count !== undefined && <p className="text-xs text-(--color-text-muted)">{count} {count === 1 ? "order" : "orders"}</p>}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Recent Orders</h2>
            <Link href="/account/orders" className="text-sm text-(--color-primary) hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between bg-(--color-surface-alt) rounded-xl px-4 py-3 gap-4">
                <div>
                  <p className="price text-sm font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-(--color-text-muted)">{new Intl.DateTimeFormat("en-ZW").format(new Date(order.createdAt))}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${order.status === "DELIVERED" ? "bg-green-100 text-green-700" : order.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                  {order.status}
                </span>
                <p className="price font-bold text-sm text-(--color-primary)">{formatUSD(toNumber(order.total))}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
