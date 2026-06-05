"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/profile";
import { CheckCircle, AlertCircle, User, Mail, Phone } from "lucide-react";

interface Props {
  name: string;
  email: string;
  phone: string;
}

export default function ProfileForm({ name, email, phone }: Props) {
  const [state, action, pending] = useActionState(updateProfile, null);

  return (
    <form action={action} className="space-y-4">

      {/* Full Name */}
      <div className="space-y-1.5">
        <label htmlFor="profile-name" className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">
          Full Name
        </label>
        <div className="relative">
          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
          <input
            id="profile-name"
            name="name"
            type="text"
            defaultValue={name}
            autoComplete="name"
            required
            minLength={2}
            placeholder="Your full name"
            className="w-full pl-10 pr-4 py-3 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) transition-all bg-white"
          />
        </div>
      </div>

      {/* Email (read-only) */}
      <div className="space-y-1.5">
        <label htmlFor="profile-email" className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">
          Email Address
        </label>
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
          <input
            id="profile-email"
            type="email"
            value={email}
            title="Email address"
            disabled
            readOnly
            className="w-full pl-10 pr-4 py-3 border border-(--color-border) rounded-xl text-sm bg-(--color-surface-alt) text-(--color-text-muted) cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-(--color-text-muted) flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-(--color-text-muted)" />
          Email address cannot be changed
        </p>
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label htmlFor="profile-phone" className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">
          Phone Number
        </label>
        <div className="relative">
          <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
          <input
            id="profile-phone"
            name="phone"
            type="tel"
            defaultValue={phone}
            autoComplete="tel"
            placeholder="07X XXX XXXX"
            className="w-full pl-10 pr-4 py-3 border border-(--color-border) rounded-xl text-sm outline-none focus:border-(--color-primary) transition-all bg-white"
          />
        </div>
      </div>

      {/* Error state */}
      {state?.error && (
        <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {state.error}
        </div>
      )}

      {/* Success state */}
      {state?.success && (
        <div className="flex items-center gap-2.5 text-sm text-green-700 bg-green-50 border border-green-100 px-4 py-3 rounded-xl">
          <CheckCircle size={15} className="shrink-0" />
          Profile updated successfully.
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-(--color-primary) hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm mt-1"
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>

    </form>
  );
}
