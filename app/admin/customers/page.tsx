import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Users, ShoppingBag, UserPlus, UserCheck } from "lucide-react";
import { CustomerFilters } from "./_components/CustomerFilters";

export const metadata: Metadata = { title: "Customers — Admin | Dollar Shop" };

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100   text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100  text-amber-700",
  "bg-rose-100   text-rose-700",
  "bg-cyan-100   text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-pink-100   text-pink-700",
];

function avatarColor(seed: string) {
  return AVATAR_COLORS[(seed.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
}

function initials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { search = "", orders = "" } = await searchParams;
  const searchStr = Array.isArray(search) ? (search[0] ?? "") : search;
  const ordersStr = Array.isArray(orders) ? (orders[0] ?? "") : orders;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const allCustomers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  const customers = allCustomers.filter((c) => {
    const term = searchStr.toLowerCase();
    const matchesSearch =
      !searchStr ||
      c.name?.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term);
    const matchesOrders =
      !ordersStr ||
      (ordersStr === "yes" ? c._count.orders > 0 : c._count.orders === 0);
    return matchesSearch && matchesOrders;
  });

  const withOrdersCount = allCustomers.filter((c) => c._count.orders > 0).length;
  const newThisMonth    = allCustomers.filter((c) => new Date(c.createdAt) >= startOfMonth).length;

  const summaryItems = [
    { label: "Total",         value: allCustomers.length, icon: Users,       cls: "bg-slate-50   text-slate-700"   },
    { label: "With Orders",   value: withOrdersCount,     icon: ShoppingBag, cls: "bg-blue-50    text-blue-700"    },
    { label: "New This Month",value: newThisMonth,        icon: UserPlus,    cls: "bg-emerald-50 text-emerald-700" },
    { label: "No Orders Yet", value: allCustomers.length - withOrdersCount, icon: UserCheck, cls: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── Header ── */}
      <div>
        <h1 className="font-display text-2xl font-bold text-(--color-text-primary)">Customers</h1>
        <p className="text-sm text-(--color-text-muted) mt-0.5">
          View and manage registered customers &mdash; {allCustomers.length} total
        </p>
      </div>

      {/* ── Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryItems.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${cls} border border-current/10`}>
            <Icon size={16} className="shrink-0 opacity-70" />
            <div>
              <p className="text-xl font-bold leading-none">{value}</p>
              <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-(--color-border) p-4">
        <Suspense fallback={<div className="h-10 rounded-xl bg-(--color-surface-alt) animate-pulse" />}>
          <CustomerFilters
            initialSearch={searchStr}
            initialHasOrders={ordersStr}
            total={allCustomers.length}
            filtered={customers.length}
          />
        </Suspense>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
        <div className="px-6 py-4 border-b border-(--color-border) flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-base">
              {searchStr || ordersStr ? "Filtered Customers" : "All Customers"}
            </h2>
            <p className="text-xs text-(--color-text-muted) mt-0.5">
              Showing {customers.length} customer{customers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-(--color-surface-alt) border-b border-(--color-border)">
                {[
                  { label: "Customer", align: "left"   },
                  { label: "Email",    align: "left"   },
                  { label: "Phone",    align: "left"   },
                  { label: "Orders",   align: "center" },
                  { label: "Joined",   align: "left"   },
                ].map(({ label, align }) => (
                  <th
                    key={label}
                    className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-(--color-text-muted) text-${align}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-(--color-border)">
              {customers.map((c) => {
                const ini  = initials(c.name, c.email);
                const aClr = avatarColor(c.email);

                return (
                  <tr key={c.id} className="hover:bg-green-50/20 transition-colors">

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${aClr}`}>
                          {ini}
                        </div>
                        <span className="font-semibold text-(--color-text-primary) leading-tight">
                          {c.name ?? <span className="text-(--color-text-muted) font-normal italic">No name</span>}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-(--color-text-muted)">
                      <a href={`mailto:${c.email}`} className="hover:text-(--color-primary) hover:underline transition-colors">
                        {c.email}
                      </a>
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-4 text-(--color-text-muted)">
                      {c.phone ?? <span className="text-(--color-border)">—</span>}
                    </td>

                    {/* Orders */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full min-w-8 text-center ${c._count.orders > 0 ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        {c._count.orders}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-(--color-text-muted) whitespace-nowrap text-xs">
                      {new Intl.DateTimeFormat("en-ZW", { dateStyle: "medium" }).format(
                        new Date(c.createdAt)
                      )}
                    </td>
                  </tr>
                );
              })}

              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-(--color-surface-alt) flex items-center justify-center">
                        <Users size={24} className="text-(--color-text-muted)" />
                      </div>
                      <p className="font-semibold text-(--color-text-primary)">No customers found</p>
                      <p className="text-sm text-(--color-text-muted)">
                        {searchStr || ordersStr
                          ? "Try adjusting your filters"
                          : "Customers will appear here once people register"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
