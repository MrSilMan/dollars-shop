import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccess, canInviteRole } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/staff/[id] — update role and/or isActive for a staff member
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  const callerRole = (session?.user as { role?: string } | undefined)?.role ?? "";
  if (!canAccess("staff", callerRole)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json() as { role?: string; isActive?: boolean };

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!canInviteRole(callerRole, target.role)) {
    return NextResponse.json({ error: "You cannot edit that member" }, { status: 403 });
  }

  const data: Record<string, unknown> = {};
  if (body.role !== undefined) {
    if (!canInviteRole(callerRole, body.role)) {
      return NextResponse.json({ error: "You cannot assign that role" }, { status: 403 });
    }
    data.role = body.role;
  }
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  const callerId = (session!.user as { id: string }).id;
  logAudit({ actorId: callerId, actorEmail: session!.user!.email ?? undefined, actorRole: callerRole, action: "STAFF_EDIT", entity: "user", entityId: id, entityLabel: updated.email, detail: data as Record<string, string | boolean> });
  return NextResponse.json(updated);
}

// DELETE /api/admin/staff/[id] — remove a staff member (downgrade to CUSTOMER)
// Also handles revoking pending invitations when id is prefixed with "inv_"
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  const inviterRole = (session?.user as { role?: string } | undefined)?.role ?? "";
  if (!canAccess("staff", inviterRole)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // Revoke pending invitation
  if (id.startsWith("inv_")) {
    const invId = id.slice(4);
    await prisma.staffInvitation.delete({ where: { id: invId } }).catch(() => null);
    return NextResponse.json({ ok: true });
  }

  // Remove existing staff user
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Inviter must have permission to manage the target's role
  if (!canInviteRole(inviterRole, target.role)) {
    return NextResponse.json({ error: "You cannot remove that role" }, { status: 403 });
  }

  const removed = await prisma.user.update({ where: { id }, data: { role: "CUSTOMER" }, select: { email: true } });
  const removerId = (session!.user as { id: string }).id;
  logAudit({ actorId: removerId, actorEmail: session!.user!.email ?? undefined, actorRole: inviterRole, action: "STAFF_REMOVE", entity: "user", entityId: id, entityLabel: removed.email, detail: { previousRole: target.role } });
  return NextResponse.json({ ok: true });
}
