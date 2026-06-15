import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canAccess, invitableRoles } from "@/lib/permissions";
import { StaffManager } from "./_components/StaffManager";

export const metadata: Metadata = { title: "Team — Admin | Dollar Shop" };

export default async function AdminStaffPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "";
  if (!canAccess("staff", role)) redirect("/admin");

  const [staff, pending] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["INVENTORY", "SALES", "MANAGER", "ADMIN"] } },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.staffInvitation.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, email: true, role: true, createdAt: true, expiresAt: true,
                inviter: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-(--color-text-primary)">Team</h1>
        <p className="text-sm text-(--color-text-muted) mt-0.5">
          Manage staff access — invite members and assign roles
        </p>
      </div>

      <StaffManager
        initialStaff={staff.map(m => ({ ...m, isActive: m.isActive, createdAt: m.createdAt.toISOString() }))}
        initialPending={pending.map(i => ({ ...i, createdAt: i.createdAt.toISOString(), expiresAt: i.expiresAt.toISOString(), inviter: { name: i.inviter.name } }))}
        invitableRoles={invitableRoles(role)}
        currentRole={role}
      />
    </div>
  );
}
