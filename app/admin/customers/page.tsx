import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Customers — Admin" };

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <h1 className="font-display text-2xl font-bold">Customers ({customers.length})</h1>
      <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--color-border) bg-(--color-surface-alt)">
              <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Email</th>
              <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Orders</th>
              <th className="text-left px-4 py-3 font-medium text-(--color-text-muted)">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-(--color-surface-alt) transition-colors">
                <td className="px-4 py-3 font-medium">{c.name ?? "—"}</td>
                <td className="px-4 py-3 text-(--color-text-muted)">{c.email}</td>
                <td className="px-4 py-3 text-(--color-text-muted)">{c.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="bg-(--color-primary-light) text-(--color-primary) text-xs font-medium px-2 py-0.5 rounded-full">{c._count.orders}</span>
                </td>
                <td className="px-4 py-3 text-(--color-text-muted)">
                  {new Intl.DateTimeFormat("en-ZW", { dateStyle: "medium" }).format(new Date(c.createdAt))}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-(--color-text-muted)">No customers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
