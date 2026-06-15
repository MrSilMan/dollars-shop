import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canAccess } from "@/lib/permissions";
import { AuditTable } from "./_components/AuditTable";

export const metadata: Metadata = { title: "Audit Log — Admin | Dollar Shop" };

const PAGE_SIZE = 50;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; group?: string; q?: string }>;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "";
  if (!canAccess("audit", role)) redirect("/admin");

  const { page: pageStr, group, q } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  const where: Record<string, unknown> = {};

  if (group) {
    where.action = { startsWith: group };
  }

  if (q?.trim()) {
    where.OR = [
      { actorEmail: { contains: q.trim(), mode: "insensitive" } },
      { entityLabel: { contains: q.trim(), mode: "insensitive" } },
    ];
  }

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const serialized = entries.map(e => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-(--color-text-primary)">Audit Log</h1>
        <p className="text-sm text-(--color-text-muted) mt-0.5">
          Complete record of all actions performed in the system
        </p>
      </div>

      <AuditTable
        entries={serialized}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
