import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/shared/ChangePasswordForm";
import { ROLE_LABELS } from "@/lib/permissions";

export const metadata: Metadata = { title: "My Account | Dollar Shop Admin" };

export default async function AdminAccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true, passwordHash: true },
  });

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-(--color-text-primary)">
          My Account
        </h1>
        <p className="text-xs text-(--color-text-muted) mt-0.5">
          {user.name ?? user.email} · {ROLE_LABELS[user.role] ?? user.role}
        </p>
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
  );
}
