import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import ProfileForm from "./_components/ProfileForm";
import { SignOutButton } from "@/components/store/SignOutButton";

export const metadata: Metadata = { title: "Profile Settings | Dollar Shop" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/profile");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, createdAt: true },
  });

  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-(--color-bg)">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="w-9 h-9 rounded-xl bg-white border border-(--color-border) flex items-center justify-center text-(--color-text-muted) hover:text-(--color-primary) hover:border-(--color-primary) transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-(--color-text-primary)">
              Profile Settings
            </h1>
            <p className="text-xs text-(--color-text-muted) mt-0.5">
              Manage your personal information
            </p>
          </div>
        </div>

        {/* Identity card */}
        <div className="account-hero-bg relative overflow-hidden rounded-3xl p-6 text-white shadow-xl">
          <div className="pointer-events-none absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 w-44 h-44 rounded-full bg-white/10" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 shadow-lg shrink-0">
                <span className="text-xl font-bold tracking-tight">{initials}</span>
              </div>
              <div>
                <p className="font-bold text-base leading-tight">{user.name ?? "No name set"}</p>
                <p className="text-white/60 text-sm mt-0.5">{user.email}</p>
                <p className="text-white/40 text-xs mt-1">
                  Member since{" "}
                  {new Intl.DateTimeFormat("en-ZW", { month: "short", year: "numeric" }).format(
                    user.createdAt
                  )}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1 bg-white/10 rounded-full px-3 py-1.5">
              <ShieldCheck size={12} className="text-white/70" />
              <span className="text-xs text-white/70 font-medium">Verified</span>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white border border-(--color-border) rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-(--color-border)">
            <p className="text-sm font-semibold text-(--color-text-primary)">Personal Information</p>
            <p className="text-xs text-(--color-text-muted) mt-0.5">Update your name and contact details</p>
          </div>
          <div className="px-6 py-5">
            <ProfileForm name={user.name ?? ""} email={user.email} phone={user.phone ?? ""} />
          </div>
        </div>

        {/* Sign out card */}
        <div className="bg-white border border-(--color-border) rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-(--color-border)">
            <p className="text-sm font-semibold text-(--color-text-primary)">Account</p>
          </div>
          <div className="px-6 py-4">
            <SignOutButton className="flex items-center gap-2.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                <LogOut size={14} className="text-red-500" />
              </div>
              Sign out of your account
            </SignOutButton>
          </div>
        </div>

      </div>
    </div>
  );
}
