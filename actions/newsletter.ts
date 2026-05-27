"use server";

import { prisma } from "@/lib/prisma";

export async function subscribeToNewsletter(
  email: string
): Promise<{ success: boolean; message: string }> {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  try {
    await prisma.newsletterSubscriber.create({ data: { email: trimmed } });
    return { success: true, message: "You're subscribed! Deals incoming." };
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return { success: false, message: "You're already on the list!" };
    }
    console.error("[newsletter] subscribe error:", err);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
