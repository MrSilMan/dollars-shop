import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET — validate token and return invitation details
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const invitation = await prisma.staffInvitation.findUnique({
    where: { token },
    select: { id: true, email: true, role: true, expiresAt: true, usedAt: true },
  });

  if (!invitation) return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 });
  if (invitation.usedAt) return NextResponse.json({ error: "This invitation has already been used" }, { status: 410 });
  if (invitation.expiresAt < new Date()) return NextResponse.json({ error: "This invitation has expired" }, { status: 410 });

  return NextResponse.json({ email: invitation.email, role: invitation.role });
}

// POST — create account from invitation
export async function POST(req: Request) {
  const { token, name, password } = await req.json();
  if (!token || !name || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const invitation = await prisma.staffInvitation.findUnique({ where: { token } });
  if (!invitation) return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 });
  if (invitation.usedAt) return NextResponse.json({ error: "This invitation has already been used" }, { status: 410 });
  if (invitation.expiresAt < new Date()) return NextResponse.json({ error: "This invitation has expired" }, { status: 410 });

  const passwordHash = await bcrypt.hash(password, 12);

  // Upsert: if email already exists (e.g. was a customer), upgrade role
  await prisma.user.upsert({
    where: { email: invitation.email },
    create: { email: invitation.email, name, passwordHash, role: invitation.role },
    update: { name, passwordHash, role: invitation.role },
  });

  await prisma.staffInvitation.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  return NextResponse.json({ ok: true, email: invitation.email });
}
