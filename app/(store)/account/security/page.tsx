import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChangePasswordForm } from "@/components/shared/ChangePasswordForm";

export const metadata: Metadata = { title: "Security | Dollar Shop" };

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/security");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  return (
    <div className="min-h-screen bg-(--color-bg)">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="w-9 h-9 rounded-xl bg-white border border-(--color-border) flex items-center justify-center text-(--color-text-muted) hover:text-(--color-primary) hover:border-(--color-primary) transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-(--color-text-primary)">
              Security
            </h1>
            <p className="text-xs text-(--color-text-muted) mt-0.5">
              Manage your password
            </p>
          </div>
        </div>

        <div className="bg-white border border-(--color-border) rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-(--color-border)">
            <p className="text-sm font-semibold text-(--color-text-primary)">Change Password</p>
            <p className="text-xs text-(--color-text-muted) mt-0.5">Update the password used to sign in</p>
          </div>
          <div className="px-6 py-5">
            {user.passwordHash ? (
              <ChangePasswordForm />
            ) : (
              <p className="text-sm text-(--color-text-muted)">
                Your account signs in with Google and does not use a password.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
