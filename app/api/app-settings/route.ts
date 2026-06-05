import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { z } from "zod";

export async function GET() {
  try {
    const settings = await prisma.appSettings.findFirst();
    return Response.json(settings ?? null);
  } catch {
    return Response.json(null);
  }
}

const UpdateSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  logoUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
  appName: z.string().min(1).max(80).optional(),
  footerText: z.string().max(300).optional(),
  fontScale: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional(),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "SUPER_ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const settings = await prisma.appSettings.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });

  revalidatePath("/", "layout");

  return Response.json(settings);
}
