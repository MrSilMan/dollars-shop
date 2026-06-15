import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canInviteRole, isStaff, ROLE_LABELS, canAccess } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { sendStaffInvitationEmail } from "@/lib/email";
import { getAppSettings } from "@/lib/app-settings";

// GET /api/admin/staff — list all staff members + pending invitations
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "";
  if (!canAccess("staff", role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

  return NextResponse.json({ staff, pending });
}

// POST /api/admin/staff — invite a new staff member
export async function POST(req: Request) {
  const session = await auth();
  const inviterRole = (session?.user as { role?: string })?.role ?? "";
  if (!canAccess("staff", inviterRole)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, role: targetRole } = await req.json();
  if (!email || !targetRole) return NextResponse.json({ error: "email and role are required" }, { status: 400 });
  if (!canInviteRole(inviterRole, targetRole)) return NextResponse.json({ error: "You cannot invite that role" }, { status: 403 });

  // Check if already a staff member
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && isStaff(existing.role)) {
    return NextResponse.json({ error: "This email already belongs to a staff member" }, { status: 409 });
  }

  // Delete any stale invitations for this email
  await prisma.staffInvitation.deleteMany({ where: { email, usedAt: null } });

  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const invitation = await prisma.staffInvitation.create({
    data: {
      email,
      role: targetRole,
      invitedBy: (session!.user as { id: string }).id,
      expiresAt,
    },
  });

  const settings = await getAppSettings();
  const appName = settings.appName ?? "Dollar Shop";
  const baseUrl = process.env.AUTH_URL ?? "https://invgest.com";
  const acceptUrl = `${baseUrl}/accept-invite?token=${invitation.token}`;

  await sendStaffInvitationEmail({
    to: email,
    inviterName: session!.user!.name ?? "Admin",
    role: targetRole,
    roleLabel: ROLE_LABELS[targetRole] ?? targetRole,
    acceptUrl,
    appName,
  });

  const inviterId = (session!.user as { id: string }).id;
  logAudit({ actorId: inviterId, actorEmail: session!.user!.email ?? undefined, actorRole: inviterRole, action: "STAFF_INVITE", entity: "user", entityLabel: email, detail: { role: targetRole } });

  return NextResponse.json({ ok: true });
}
