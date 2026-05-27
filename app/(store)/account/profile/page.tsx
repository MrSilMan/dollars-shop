import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "./_components/ProfileForm";

export const metadata: Metadata = { title: "Profile Settings" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/profile");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, createdAt: true },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/account" className="text-sm text-(--color-text-muted) hover:text-(--color-primary) transition-colors">
          ← Account
        </Link>
        <h1 className="font-display text-2xl font-bold">Profile Settings</h1>
      </div>

      <div className="bg-white border border-(--color-border) rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-(--color-primary-light) flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-(--color-primary)">
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-lg">{user.name ?? "No name set"}</p>
            <p className="text-sm text-(--color-text-muted)">
              Member since {new Intl.DateTimeFormat("en-ZW", { dateStyle: "long" }).format(user.createdAt)}
            </p>
          </div>
        </div>

        <hr className="border-(--color-border)" />

        <ProfileForm name={user.name ?? ""} email={user.email} phone={user.phone ?? ""} />
      </div>
    </div>
  );
}
