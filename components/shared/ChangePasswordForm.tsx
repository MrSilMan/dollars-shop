"use client";

import { useActionState } from "react";
import { changePassword } from "@/actions/change-password";
import { CheckCircle, AlertCircle, Lock } from "lucide-react";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);

  return (
    <form action={action} key={state?.success ? "done" : "pending"} className="space-y-4">

      <div className="space-y-1.5">
        <label htmlFor="currentPassword" className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">
          Current Password
        </label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter current password"
            className="w-full pl-10 pr-4 py-3 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) transition-all bg-white"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="newPassword" className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">
          New Password
        </label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            className="w-full pl-10 pr-4 py-3 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) transition-all bg-white"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">
          Confirm New Password
        </label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="Re-enter new password"
            className="w-full pl-10 pr-4 py-3 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) transition-all bg-white"
          />
        </div>
      </div>

      {state?.error && (
        <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="flex items-center gap-2.5 text-sm text-green-700 bg-green-50 border border-green-100 px-4 py-3 rounded-xl">
          <CheckCircle size={15} className="shrink-0" />
          Password updated successfully.
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-(--color-primary) hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm mt-1"
      >
        {pending ? "Updating…" : "Update Password"}
      </button>

    </form>
  );
}
