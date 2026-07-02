"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { canAccess } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { sendPromotionalDealEmail, isConfigured } from "@/lib/email";

export async function getAllSubscribers() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!canAccess("newsletter", role ?? "")) return [];
  return prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
}

const DealSchema = z.object({
  subject: z.string().min(2).max(150),
  bodyHtml: z.string().min(2),
  ctaText: z.string().max(40).nullable().optional(),
  ctaUrl: z.string().url().nullable().optional(),
});

const BATCH_SIZE = 10;

export async function sendDealToSubscribers(data: unknown) {
  const session = await auth();
  const actor = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!canAccess("newsletter", actor?.role ?? "")) return { error: "Unauthorized" };

  if (!isConfigured()) return { error: "Email sending is not configured (missing SMTP settings)" };

  const parsed = DealSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const subscribers = await prisma.newsletterSubscriber.findMany({ select: { email: true } });
  if (subscribers.length === 0) return { error: "No subscribers to send to" };

  let sent = 0;
  let failed = 0;
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(s => sendPromotionalDealEmail({ to: s.email, ...parsed.data }))
    );
    for (const r of results) r.status === "fulfilled" ? sent++ : failed++;
  }

  logAudit({
    actorId: actor?.id,
    actorEmail: actor?.email,
    actorRole: actor?.role,
    action: "NEWSLETTER_SEND",
    entity: "newsletter",
    entityLabel: parsed.data.subject,
    detail: { sent, failed, total: subscribers.length },
  });

  return { success: true, sent, failed, total: subscribers.length };
}
