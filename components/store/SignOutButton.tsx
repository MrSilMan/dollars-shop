"use client";

import { signOut } from "next-auth/react";
import type { ReactNode } from "react";

export function SignOutButton({
  className,
  children,
  redirectTo = "/",
}: {
  className?: string;
  children: ReactNode;
  redirectTo?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => signOut({ redirectTo })}
    >
      {children}
    </button>
  );
}
